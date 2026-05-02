import { supabase } from '../lib/supabase';
import type { User, UserInsert, UserUpdate } from '../types/models';

export class UserRepository {
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .returns<User[]>()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    return data;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .returns<User[]>()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch user by phone: ${error.message}`);
    }
    return data;
  }

  async createUser(user: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .returns<User[]>()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .returns<User[]>()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  async updateUserRole(userId: string, role: 'student' | 'driver'): Promise<User> {
    return this.updateUser(userId, { role });
  }

  async listUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)
      .order('full_name', { ascending: true })
      .returns<User[]>();

    if (error) throw new Error(`Failed to list users: ${error.message}`);
    return data;
  }
}

export const userRepository = new UserRepository();
