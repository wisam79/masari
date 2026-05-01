import { supabase } from '../lib/supabase';
import type { StudentProfile, StudentProfileInsert, StudentProfileUpdate } from '../types/models';

export class ProfileRepository {
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async upsertStudentProfile(profile: StudentProfileInsert): Promise<StudentProfile> {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateStudentProfile(userId: string, updates: StudentProfileUpdate): Promise<StudentProfile> {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async listStudentProfiles(userIds: string[]): Promise<StudentProfile[]> {
    if (userIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .in('user_id', userIds);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const profileRepository = new ProfileRepository();
