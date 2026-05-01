import * as Location from 'expo-location';
import { locationRepository } from '../repositories/LocationRepository';
import type { DriverLocation } from '../types/models';

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

  async getCurrentCoordinates(): Promise<{ lat: number; lng: number }> {
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
}

export const locationService = new LocationService();
