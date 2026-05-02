import * as Location from 'expo-location';
import { LOCATION } from '../lib/constants';
import { locationRepository } from '../repositories/LocationRepository';
import type { DriverLocation } from '../types/models';

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Service for handling location-related operations.
 */
export class LocationService {
  /**
   * Updates the current location for a given driver.
   *
   * @param driverId - The unique identifier of the driver.
   * @returns A promise that resolves to the updated DriverLocation.
   * @throws Will throw an error if the driverId is empty, permission is denied, or fetching/updating fails.
   */
  async updateCurrentDriverLocation(driverId: string): Promise<DriverLocation> {
    if (!driverId || !driverId.trim()) {
      const errorMsg = 'updateCurrentDriverLocation: driverId is required';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        const errorMsg = 'يجب السماح للتطبيق باستخدام الموقع لتحديث موقع السائق';
        console.error(`updateCurrentDriverLocation: Permission denied for driver ${driverId}`);
        throw new Error(errorMsg);
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return await locationRepository.upsertDriverLocation({
        driver_id: driverId,
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude,
      });
    } catch (error) {
      console.error('updateCurrentDriverLocation: Error updating driver location:', error);
      throw error;
    }
  }

  /**
   * Retrieves the current device coordinates.
   *
   * @returns A promise that resolves to the current Coordinates.
   * @throws Will throw an error if location permission is denied or fetching fails.
   */
  async getCurrentCoordinates(): Promise<Coordinates> {
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        const errorMsg = 'يجب السماح للتطبيق باستخدام الموقع لتحديد نقطة الصعود';
        console.error('getCurrentCoordinates: Permission denied');
        throw new Error(errorMsg);
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude,
      };
    } catch (error) {
      console.error('getCurrentCoordinates: Error getting coordinates:', error);
      throw error;
    }
  }

  /**
   * Calculates the distance in meters between two sets of coordinates using the Haversine formula.
   *
   * @param from - The starting coordinates.
   * @param to - The ending coordinates.
   * @returns The distance in meters.
   */
  calculateDistanceMeters(from: Coordinates, to: Coordinates): number {
    if (!from || !to || typeof from.lat !== 'number' || typeof from.lng !== 'number' || typeof to.lat !== 'number' || typeof to.lng !== 'number') {
      console.error('calculateDistanceMeters: Invalid coordinates provided', { from, to });
      return Infinity;
    }

    if (
      Math.abs(from.lat) > 90 || Math.abs(to.lat) > 90 ||
      Math.abs(from.lng) > 180 || Math.abs(to.lng) > 180 ||
      (from.lat === 0 && from.lng === 0) || (to.lat === 0 && to.lng === 0)
    ) {
      console.error('calculateDistanceMeters: Out-of-range or null-island coordinates', { from, to });
      return Infinity;
    }

    const earthRadiusMeters = 6371000;
    const fromLat = this.toRadians(from.lat);
    const toLat = this.toRadians(to.lat);
    const deltaLat = this.toRadians(to.lat - from.lat);
    const deltaLng = this.toRadians(to.lng - from.lng);

    const haversine =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  /**
   * Finds the nearest distance in meters from a starting point to a list of target coordinates.
   *
   * @param from - The starting coordinates.
   * @param targets - An array of target coordinates.
   * @returns The nearest distance in meters, or null if no targets are provided.
   */
  getNearestDistanceMeters(from: Coordinates, targets: Coordinates[]): number | null {
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return null;
    }

    if (!from || typeof from.lat !== 'number' || typeof from.lng !== 'number') {
      console.error('getNearestDistanceMeters: Invalid from coordinates', from);
      return null;
    }

    return targets.reduce<number | null>((nearest, target) => {
      if (!target || typeof target.lat !== 'number' || typeof target.lng !== 'number') {
        return nearest;
      }
      const distance = this.calculateDistanceMeters(from, target);
      return nearest === null || distance < nearest ? distance : nearest;
    }, null);
  }

  /**
   * Determines the appropriate polling interval based on the given distance in meters.
   *
   * @param distanceMeters - The distance in meters, or null.
   * @returns The polling interval in milliseconds.
   */
  getPollingIntervalForDistance(distanceMeters: number | null): number {
    if (distanceMeters !== null && typeof distanceMeters === 'number' && distanceMeters <= LOCATION.PROXIMITY_THRESHOLD) {
      return LOCATION.FAST_POLLING_INTERVAL;
    }

    return LOCATION.NORMAL_POLLING_INTERVAL;
  }

  /**
   * Converts degrees to radians.
   *
   * @param value - The value in degrees.
   * @returns The value in radians.
   */
  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}

export const locationService = new LocationService();
