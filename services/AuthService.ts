import { supabase } from '../lib/supabase';
import { userRepository } from '../repositories/UserRepository';
import type { User } from '../types/models';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      if (!email?.trim()) return { success: false, error: 'Email is required' };
      if (!password) return { success: false, error: 'Password is required' };

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('signInWithEmail: Supabase auth error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) return { success: false, error: 'User not found' };

      const user = await userRepository.getUserById(data.user.id);
      if (!user) return { success: false, error: 'Failed to fetch user profile' };

      return { success: true, user };
    } catch (error) {
      console.error('signInWithEmail: Unexpected error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  async signUpWithEmail(email: string, password: string, fullName?: string): Promise<AuthResult> {
    try {
      if (!email?.trim()) return { success: false, error: 'Email is required' };
      if (!password) return { success: false, error: 'Password is required' };

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName?.trim() || '' } },
      });

      if (error) {
        console.error('signUpWithEmail: Supabase auth error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) return { success: false, error: 'Failed to create user' };

      let retries = 0;
      let user: User | null = null;
      while (retries < 8 && !user) {
        try {
          user = await userRepository.getUserById(data.user.id);
        } catch {
          // Profile not yet created by trigger
        }
        if (!user) {
          await new Promise<void>((resolve) => setTimeout(resolve, 500));
          retries++;
        }
      }

      if (!user) {
        console.warn('signUpWithEmail: Profile creation pending for ID:', data.user.id);
        return { success: true, error: 'Profile creation pending' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('signUpWithEmail: Unexpected error:', error);
      return { success: false, error: 'Failed to sign up' };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      if (!email?.trim()) return { success: false, error: 'Email is required' };

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        console.error('resetPassword: error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('resetPassword: Unexpected error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return await userRepository.getUserById(user.id);
    } catch (error) {
      console.error('getCurrentUser: Error:', error);
      return null;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('signOut: Error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('signOut: Unexpected error:', error);
      return false;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    if (typeof callback !== 'function') {
      throw new Error('onAuthStateChange: callback must be a function');
    }

    return supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const user = await userRepository.getUserById(session.user.id);
          callback(user || null);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('onAuthStateChange: Error:', error);
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
