import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { locationRepository } from '../repositories/LocationRepository';
import { locationService, type Coordinates } from '../services/LocationService';
import type { DriverLocation } from '../types/models';

import { LOCATION } from '../lib/constants';

const MAX_CONSECUTIVE_ERRORS = 5;
const ERROR_BACKOFF_MULTIPLIER = 2;

interface SmartPollingState {
  isPolling: boolean;
  lastError: string | null;
  lastUpdatedAt: string | null;
  nearestDistanceMeters: number | null;
  nextIntervalMs: number | null;
}

/**
 * Fetches and subscribes to real-time location updates for a specific driver.
 * @param driverId - The ID of the driver.
 * @returns React Query object containing the driver's location.
 */
export function useDriverLocation(driverId?: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    enabled: !!driverId,
    queryKey: ['driver-location', driverId],
    queryFn: () => locationRepository.getDriverLocation(driverId as string),
  });

  useEffect(() => {
    if (!driverId) {
      return undefined;
    }

    const channel = supabase
      .channel(`driver-location:${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload: RealtimePostgresChangesPayload<DriverLocation>) => {
          if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['driver-location', driverId], null);
            return;
          }

          queryClient.setQueryData(['driver-location', driverId], payload.new);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [driverId, queryClient]);

  return query;
}

/**
 * Updates the current location for a driver.
 * @returns React Mutation object for updating driver location.
 */
export function useUpdateDriverLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driverId: string) => locationService.updateCurrentDriverLocation(driverId),
    onSuccess: (location) => {
      void queryClient.invalidateQueries({ queryKey: ['driver-location', location.driver_id] });
    },
  });
}

/**
 * Gets the current coordinates of the device.
 * @returns React Mutation object for fetching current coordinates.
 */
export function useCurrentCoordinates() {
  return useMutation({
    mutationFn: () => locationService.getCurrentCoordinates(),
  });
}

/**
 * Polls the driver's location smartly based on distance to nearest pickup points.
 * @param driverId - The ID of the driver.
 * @param pickupPoints - List of target coordinates to calculate distance against.
 * @param enabled - Whether polling is currently active.
 * @returns The polling state (isPolling, nearestDistanceMeters, nextIntervalMs, etc.).
 */
export function useSmartDriverLocationPolling(
  driverId: string | undefined,
  pickupPoints: Coordinates[],
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupPointsRef = useRef<Coordinates[]>(pickupPoints);
  const consecutiveErrorsRef = useRef(0);
  const [state, setState] = useState<SmartPollingState>({
    isPolling: false,
    lastError: null,
    lastUpdatedAt: null,
    nearestDistanceMeters: null,
    nextIntervalMs: null,
  });

  const stablePickupPoints = useMemo(
    () => pickupPoints.map((point) => `${point.lat},${point.lng}`).join('|'),
    [pickupPoints],
  );

  useEffect(() => {
    pickupPointsRef.current = pickupPoints;
  }, [pickupPoints, stablePickupPoints]);

  useEffect(() => {
    if (!driverId || !enabled) {
      setState((current) => ({ ...current, isPolling: false, nextIntervalMs: null }));
      return undefined;
    }

    let isMounted = true;

    const clearPollingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const scheduleNextUpdate = async (delayMs: number) => {
      clearPollingTimeout();
      timeoutRef.current = setTimeout(() => {
        void updateAndSchedule();
      }, delayMs);
    };

    const updateAndSchedule = async () => {
      try {
        setState((current) => ({ ...current, isPolling: true, lastError: null }));
        const location = await locationService.updateCurrentDriverLocation(driverId);
        const nearestDistanceMeters = locationService.getNearestDistanceMeters(
          { lat: location.lat, lng: location.lng },
          pickupPointsRef.current,
        );
        const nextIntervalMs = locationService.getPollingIntervalForDistance(nearestDistanceMeters);

        if (!isMounted) {
          clearPollingTimeout();
          return;
        }

        consecutiveErrorsRef.current = 0;
        queryClient.setQueryData(['driver-location', driverId], location);
        setState({
          isPolling: true,
          lastError: null,
          lastUpdatedAt: location.last_updated,
          nearestDistanceMeters,
          nextIntervalMs,
        });

        await scheduleNextUpdate(nextIntervalMs);
      } catch (error) {
        if (!isMounted) {
          clearPollingTimeout();
          return;
        }

        consecutiveErrorsRef.current += 1;

        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          setState((current) => ({
            ...current,
            isPolling: false,
            lastError: `توقف التحديث التلقائي بعد ${MAX_CONSECUTIVE_ERRORS} محاولات فاشلة. اضغط للإعادة.`,
            nextIntervalMs: null,
          }));
          return;
        }

        const backoffMs = LOCATION.NORMAL_POLLING_INTERVAL * Math.pow(ERROR_BACKOFF_MULTIPLIER, Math.min(consecutiveErrorsRef.current - 1, 4));
        const nextIntervalMs = Math.min(backoffMs, 30 * 60 * 1000);
        setState((current) => ({
          ...current,
          isPolling: true,
          lastError: error instanceof Error ? error.message : 'تعذر تحديث الموقع',
          nextIntervalMs,
        }));
        await scheduleNextUpdate(nextIntervalMs);
      }
    };

    void updateAndSchedule();

    return () => {
      isMounted = false;
      clearPollingTimeout();
    };
  }, [driverId, enabled, queryClient, stablePickupPoints]);

  return state;
}
