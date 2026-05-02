import { supabase } from '../lib/supabase';
import type { User, UserInsert, UserUpdate } from '../types/models';

/**
 * Repository for managing user accounts.
 */
export class UserRepository {
  /**
   * Retrieves a user by their unique identifier.
   * @param userId The unique identifier of the user.
   * @returns A promise that resolves to the User record if found, or null otherwise.
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .returns<User[]>()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Retrieves a user by their phone number.
   * @param phone The phone number of the user.
   * @returns A promise that resolves to the User record if found, or null otherwise.
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .returns<User[]>()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      return null;
    }
  }

  /**
   * Creates a new user account.
   * @param user The user data to insert.
   * @returns A promise that resolves to the newly created User record, or null if creation fails.
   */
  async createUser(user: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .returns<User[]>()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Updates an existing user account.
   * @param userId The unique identifier of the user.
   * @param updates The updates to apply to the user account.
   * @returns A promise that resolves to the updated User record, or null if update fails.
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .returns<User[]>()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Updates the role of a user.
   * @param userId The unique identifier of the user.
   * @param role The new role to assign to the user ('student' or 'driver').
   * @returns A promise that resolves to the updated User record, or null if update fails.
   */
  async updateUserRole(userId: string, role: 'student' | 'driver'): Promise<User | null> {
    return this.updateUser(userId, { role });
  }

  /**
   * Lists users for a given array of user IDs.
   * @param userIds An array of unique identifiers for users.
   * @returns A promise that resolves to an array of User records.
   */
  async listUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
        .order('full_name', { ascending: true })
        .returns<User[]>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing users by ids:', error);
      return [];
    }
  }
}

export const userRepository = new UserRepository();
