import { supabase } from '../lib/supabase';
import type { DriverInstitution, DriverInstitutionInsert, Institution, User } from '../types/models';

/**
 * Repository for managing institutions and driver-institution associations.
 */
export class InstitutionRepository {
  /**
   * Retrieves a list of all active institutions.
   * @returns A promise that resolves to an array of active Institution records.
   */
  async listActiveInstitutions(): Promise<Institution[]> {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('is_active', true)
      .order('city', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
      .returns<Institution[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Retrieves the institutions associated with a specific driver.
   * @param driverId The unique identifier of the driver.
   * @returns A promise that resolves to an array of DriverInstitution records.
   */
  async getDriverInstitutions(driverId: string): Promise<DriverInstitution[]> {
    const { data, error } = await supabase
      .from('driver_institutions')
      .select('*')
      .eq('driver_id', driverId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .returns<DriverInstitution[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Upserts an association between a driver and an institution.
   * @param input The driver institution data to insert or update.
   * @returns A promise that resolves to the upserted DriverInstitution record.
   */
  async upsertDriverInstitution(input: DriverInstitutionInsert): Promise<DriverInstitution> {
    const { data, error } = await supabase
      .from('driver_institutions')
      .upsert(input, { onConflict: 'driver_id,institution_id' })
      .select()
      .returns<DriverInstitution[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Retrieves all drivers associated with a specific institution.
   * @param institutionId The unique identifier of the institution.
   * @returns A promise that resolves to an array of User records representing drivers.
   */
  async listDriversForInstitution(institutionId: string): Promise<User[]> {
    const { data: links, error: linksError } = await supabase
      .from('driver_institutions')
      .select('driver_id')
      .eq('institution_id', institutionId)
      .eq('is_active', true)
      .returns<{ driver_id: string }[]>();

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
      .order('full_name', { ascending: true })
      .returns<User[]>();

    if (driversError) {
      throw new Error(driversError.message);
    }

    return drivers;
  }
}

export const institutionRepository = new InstitutionRepository();
