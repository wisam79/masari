import { supabase } from '../lib/supabase';
import type { DailyAttendance, DailyAttendanceInsert, DailyAttendanceUpdate } from '../types/models';

export class AttendanceRepository {
  async getStudentAttendanceForDate(studentId: string, date: string): Promise<DailyAttendance | null> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async listDriverAttendanceForDate(driverId: string, date: string): Promise<DailyAttendance[]> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('driver_id', driverId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async upsertAttendance(input: DailyAttendanceInsert): Promise<DailyAttendance> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .upsert(input, { onConflict: 'student_id,date' })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateAttendance(id: string, updates: DailyAttendanceUpdate): Promise<DailyAttendance> {
    const { data, error } = await supabase
      .from('daily_attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const attendanceRepository = new AttendanceRepository();
