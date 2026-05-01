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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User not found' };
      }

      const user = await userRepository.getUserById(data.user.id);

      if (!user) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      return { success: true, user };
    } catch (_error) {
      return { success: false, error: 'Failed to sign in' };
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // We wait a brief moment to allow the database trigger to create the public.users record
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      const user = await userRepository.getUserById(data.user.id);

      if (!user) {
        // If trigger fails or delays, we just return success but no user profile yet
        return { success: true, error: 'Profile creation pending' };
      }

      return { success: true, user };
    } catch (_error) {
      return { success: false, error: 'Failed to sign up' };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
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