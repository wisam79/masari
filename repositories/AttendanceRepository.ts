import { supabase } from '../lib/supabase';
import type { DailyAttendance, DailyAttendanceInsert, DailyAttendanceUpdate } from '../types/models';

function formatLocalDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Repository for managing daily attendance records.
 */
export class AttendanceRepository {
  /**
   * Retrieves the current date from the server in YYYY-MM-DD format.
   * Falls back to the local device date if the server query fails.
   * @returns A promise that resolves to the current date string.
   */
  async getServerDate(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_current_date');

      if (error) {
        console.error('getServerDate: RPC error:', error.message);
        return formatLocalDate();
      }

      if (typeof data === 'string' && data) {
        return data;
      }

      return formatLocalDate();
    } catch {
      return formatLocalDate();
    }
  }
  /**
   * Retrieves the daily attendance record for a specific student on a given date.
   * @param studentId The unique identifier of the student.
   * @param date The date of the attendance in YYYY-MM-DD format.
   * @returns A promise that resolves to the DailyAttendance record if found, or null otherwise.
   */
  async getStudentAttendanceForDate(studentId: string, date: string): Promise<DailyAttendance | null> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .returns<DailyAttendance[]>()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Lists all attendance records managed by a specific driver on a given date.
   * @param driverId The unique identifier of the driver.
   * @param date The date of the attendance in YYYY-MM-DD format.
   * @returns A promise that resolves to an array of DailyAttendance records.
   */
  async listDriverAttendanceForDate(driverId: string, date: string): Promise<DailyAttendance[]> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('driver_id', driverId)
      .eq('date', date)
      .order('created_at', { ascending: true })
      .returns<DailyAttendance[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Upserts a daily attendance record.
   * @param input The daily attendance data to insert or update.
   * @returns A promise that resolves to the upserted DailyAttendance record.
   */
  async upsertAttendance(input: DailyAttendanceInsert): Promise<DailyAttendance> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .upsert(input, { onConflict: 'student_id,date' })
      .select()
      .returns<DailyAttendance[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Updates an existing daily attendance record.
   * @param id The unique identifier of the daily attendance record.
   * @param updates The updates to apply to the attendance record.
   * @returns A promise that resolves to the updated DailyAttendance record.
   */
  async updateAttendance(id: string, updates: DailyAttendanceUpdate): Promise<DailyAttendance> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .returns<DailyAttendance[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const attendanceRepository = new AttendanceRepository();
