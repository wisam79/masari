import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationRepository } from '../repositories/LocationRepository';
import { locationService } from '../services/LocationService';

export function useDriverLocation(driverId?: string) {
  return useQuery({
    enabled: !!driverId,
    queryKey: ['driver-location', driverId],
    queryFn: () => locationRepository.getDriverLocation(driverId as string),
    refetchInterval: 60_000,
  });
}

export function useUpdateDriverLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driverId: string) => locationService.updateCurrentDriverLocation(driverId),
    onSuccess: (location) => {
      void queryClient.invalidateQueries({ queryKey: ['driver-location', location.driver_id] });
    },
  });
}

export function useCurrentCoordinates() {
  return useMutation({
    mutationFn: () => locationService.getCurrentCoordinates(),
  });
}
