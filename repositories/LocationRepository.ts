import { supabase } from '../lib/supabase';
import type { DriverLocation, DriverLocationInsert } from '../types/models';

/**
 * Repository for managing driver location records.
 */
export class LocationRepository {
  /**
   * Upserts the current location of a driver.
   * @param location The driver location data to insert or update.
   * @returns A promise that resolves to the upserted DriverLocation record.
   */
  async upsertDriverLocation(location: DriverLocationInsert): Promise<DriverLocation> {
    const { data, error } = await supabase
      .from('driver_locations')
      .upsert(location, { onConflict: 'driver_id' })
      .select()
      .returns<DriverLocation[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Retrieves the current location of a specific driver.
   * @param driverId The unique identifier of the driver.
   * @returns A promise that resolves to the DriverLocation record if found, or null otherwise.
   */
  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .eq('driver_id', driverId)
      .returns<DriverLocation[]>()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const locationRepository = new LocationRepository();
