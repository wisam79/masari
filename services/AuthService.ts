import { supabase } from '../lib/supabase';
import { userRepository } from '../repositories/UserRepository';
import type { User } from '../types/models';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Service handling authentication operations and user session management.
 */
export class AuthService {
  /**
   * Signs in a user with their email and password.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing the success status, and potentially the user object or an error message.
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      if (!email || !email.trim()) {
        console.error('signInWithEmail: Email is required');
        return { success: false, error: 'Email is required' };
      }
      if (!password) {
        console.error('signInWithEmail: Password is required');
        return { success: false, error: 'Password is required' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('signInWithEmail: Supabase auth error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.error('signInWithEmail: User not found in response');
        return { success: false, error: 'User not found' };
      }

      const user = await userRepository.getUserById(data.user.id);

      if (!user) {
        console.error('signInWithEmail: Failed to fetch user profile for ID:', data.user.id);
        return { success: false, error: 'Failed to fetch user profile' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('signInWithEmail: Unexpected error during sign in:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  /**
   * Signs up a new user with their email and password.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing the success status, and potentially the user object or an error message.
   */
  async signUpWithEmail(email: string, password: string, fullName?: string): Promise<AuthResult> {
    try {
      if (!email || !email.trim()) {
        console.error('signUpWithEmail: Email is required');
        return { success: false, error: 'Email is required' };
      }
      if (!password) {
        console.error('signUpWithEmail: Password is required');
        return { success: false, error: 'Password is required' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || '',
          },
        },
      });

      if (error) {
        console.error('signUpWithEmail: Supabase auth error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.error('signUpWithEmail: Failed to create user in response');
        return { success: false, error: 'Failed to create user' };
      }

      let retries = 0;
      let user: User | null = null;
      while (retries < 5 && !user) {
        user = await userRepository.getUserById(data.user.id);
        if (!user) {
          await new Promise<void>((resolve) => setTimeout(resolve, 300));
          retries++;
        }
      }

      if (!user) {
        console.warn('signUpWithEmail: Profile creation pending for ID:', data.user.id);
        return { success: true, error: 'Profile creation pending' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('signUpWithEmail: Unexpected error during sign up:', error);
      return { success: false, error: 'Failed to sign up' };
    }
  }

  /**
   * Sends a password reset email to the given email address.
   *
   * @param email - The user's email address.
   * @returns An object containing the success status and optionally an error message.
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      if (!email || !email.trim()) {
        console.error('resetPassword: Email is required');
        return { success: false, error: 'Email is required' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        console.error('resetPassword: error sending reset email:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('resetPassword: Unexpected error during password reset:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  }

  /**
   * Retrieves the currently authenticated user.
   *
   * @returns A promise that resolves to the current User object, or null if no user is authenticated or an error occurs.
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const userProfile = await userRepository.getUserById(user.id);
      if (!userProfile) {
        console.warn('getCurrentUser: No user profile found for ID:', user.id);
      }
      
      return userProfile;
    } catch (error) {
      console.error('getCurrentUser: Error getting current user:', error);
      return null;
    }
  }

  /**
   * Signs out the currently authenticated user.
   *
   * @returns A promise that resolves to true if successful, false otherwise.
   */
  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('signOut: Error signing out from supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('signOut: Unexpected error signing out:', error);
      return false;
    }
  }

  /**
   * Registers a callback to be invoked when the authentication state changes.
   *
   * @param callback - The function to call when the auth state changes, receiving the User object or null.
   * @returns A subscription object (e.g., with an unsubscribe method).
   */
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
        console.error('onAuthStateChange: Error processing auth state change:', error);
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();