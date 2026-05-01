import * as Location from 'expo-location';
import { LOCATION } from '../lib/constants';
import { locationRepository } from '../repositories/LocationRepository';
import type { DriverLocation } from '../types/models';

export interface Coordinates {
  lat: number;
  lng: number;
}

export class LocationService {
  async updateCurrentDriverLocation(driverId: string): Promise<DriverLocation> {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error('يجب السماح للتطبيق باستخدام الموقع لتحديث موقع السائق');
    }

    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return locationRepository.upsertDriverLocation({
      driver_id: driverId,
      lat: currentPosition.coords.latitude,
      lng: currentPosition.coords.longitude,
      last_updated: new Date().toISOString(),
    });
  }

  async getCurrentCoordinates(): Promise<Coordinates> {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error('يجب السماح للتطبيق باستخدام الموقع لتحديد نقطة الصعود');
    }

    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: currentPosition.coords.latitude,
      lng: currentPosition.coords.longitude,
    };
  }

  calculateDistanceMeters(from: Coordinates, to: Coordinates): number {
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

  getNearestDistanceMeters(from: Coordinates, targets: Coordinates[]): number | null {
    if (targets.length === 0) {
      return null;
    }

    return targets.reduce<number | null>((nearest, target) => {
      const distance = this.calculateDistanceMeters(from, target);
      return nearest === null || distance < nearest ? distance : nearest;
    }, null);
  }

  getPollingIntervalForDistance(distanceMeters: number | null): number {
    if (distanceMeters !== null && distanceMeters <= LOCATION.PROXIMITY_THRESHOLD) {
      return LOCATION.FAST_POLLING_INTERVAL;
    }

    return LOCATION.NORMAL_POLLING_INTERVAL;
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}

export const locationService = new LocationService();
