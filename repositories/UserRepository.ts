import { supabase } from '../lib/supabase';
import type { User, UserInsert, UserUpdate } from '../types/models';

export class UserRepository {
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      return null;
    }
  }

  async createUser(user: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async updateUserRole(userId: string, role: 'student' | 'driver'): Promise<User | null> {
    return this.updateUser(userId, { role });
  }

  async listUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing users by ids:', error);
      return [];
    }
  }
}

export const userRepository = new UserRepository();
