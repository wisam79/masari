import { supabase } from '../lib/supabase';
import type { DriverInstitution, DriverInstitutionInsert, Institution, User } from '../types/models';

export class InstitutionRepository {
  async listActiveInstitutions(): Promise<Institution[]> {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('is_active', true)
      .order('city', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getDriverInstitutions(driverId: string): Promise<DriverInstitution[]> {
    const { data, error } = await supabase
      .from('driver_institutions')
      .select('*')
      .eq('driver_id', driverId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async upsertDriverInstitution(input: DriverInstitutionInsert): Promise<DriverInstitution> {
    const { data, error } = await supabase
      .from('driver_institutions')
      .upsert(input, { onConflict: 'driver_id,institution_id' })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async listDriversForInstitution(institutionId: string): Promise<User[]> {
    const { data: links, error: linksError } = await supabase
      .from('driver_institutions')
      .select('driver_id')
      .eq('institution_id', institutionId)
      .eq('is_active', true);

    if (linksError) {
      throw new Error(linksError.message);
    }

    const driverIds = links.map((link) => link.driver_id);
    if (driverIds.length === 0) {
      return [];
    }

    const { data: drivers, error: driversError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'driver')
      .in('id', driverIds)
      .order('full_name', { ascending: true });

    if (driversError) {
      throw new Error(driversError.message);
    }

    return drivers;
  }
}

export const institutionRepository = new InstitutionRepository();
