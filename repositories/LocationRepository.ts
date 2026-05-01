import { supabase } from '../lib/supabase';
import type { DriverLocation, DriverLocationInsert } from '../types/models';

export class LocationRepository {
  async upsertDriverLocation(location: DriverLocationInsert): Promise<DriverLocation> {
    const { data, error } = await supabase
      .from('driver_locations')
      .upsert(location, { onConflict: 'driver_id' })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .eq('driver_id', driverId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const locationRepository = new LocationRepository();
