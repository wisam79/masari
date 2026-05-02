import { supabase } from '../lib/supabase';
import type { StudentProfile, StudentProfileInsert, StudentProfileUpdate } from '../types/models';

/**
 * Repository for managing student profiles.
 */
export class ProfileRepository {
  /**
   * Retrieves the profile of a specific student.
   * @param userId The unique identifier of the student user.
   * @returns A promise that resolves to the StudentProfile record if found, or null otherwise.
   */
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .returns<StudentProfile[]>()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Upserts a student profile.
   * @param profile The student profile data to insert or update.
   * @returns A promise that resolves to the upserted StudentProfile record.
   */
  async upsertStudentProfile(profile: StudentProfileInsert): Promise<StudentProfile> {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .returns<StudentProfile[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Updates an existing student profile.
   * @param userId The unique identifier of the student user.
   * @param updates The updates to apply to the student profile.
   * @returns A promise that resolves to the updated StudentProfile record.
   */
  async updateStudentProfile(userId: string, updates: StudentProfileUpdate): Promise<StudentProfile> {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .returns<StudentProfile[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Lists profiles for a given array of student user IDs.
   * @param userIds An array of unique identifiers for student users.
   * @returns A promise that resolves to an array of StudentProfile records.
   */
  async listStudentProfiles(userIds: string[]): Promise<StudentProfile[]> {
    if (userIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .in('user_id', userIds)
      .returns<StudentProfile[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const profileRepository = new ProfileRepository();
