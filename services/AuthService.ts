import { supabase } from '../lib/supabase';
import { userRepository } from '../repositories/UserRepository';
import type { User } from '../types/models';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  async sendOTP(phone: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (_error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  async verifyOTP(phone: string, token: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User not found' };
      }

      let user = await userRepository.getUserById(data.user.id);

      if (!user) {
        user = await userRepository.createUser({
          id: data.user.id,
          phone,
          full_name: '',
          role: 'unassigned',
        });
      }

      if (!user) {
        return { success: false, error: 'Failed to create user' };
      }

      return { success: true, user };
    } catch (_error) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return await userRepository.getUserById(user.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await userRepository.getUserById(session.user.id);
        callback(user || null);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
