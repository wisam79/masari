import { useCallback, useEffect } from 'react';
import { authService } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { userRepository } from '../repositories/UserRepository';

export function useAuth() {
  const {
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    setUser,
    setLoading,
    setInitialized,
    logout,
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await userRepository.getUserById(session.user.id);
          if (mounted) setUser(userProfile || null);
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error('Error during initial session fetch:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted && !useAuthStore.getState().isInitialized) {
          useAuthStore.getState().setInitialized(true);
          useAuthStore.getState().setLoading(false);
        }
      }
    };

    if (!useAuthStore.getState().isInitialized) {
      initAuth();
    }

    const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
      if (mounted) {
        setUser(authUser);
        if (!useAuthStore.getState().isInitialized) {
          useAuthStore.getState().setInitialized(true);
          useAuthStore.getState().setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await authService.signInWithEmail(email, pass);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  const signUp = useCallback(async (email: string, pass: string, fullName?: string) => {
    setLoading(true);
    try {
      const result = await authService.signUpWithEmail(email, pass, fullName);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      return await authService.resetPassword(email);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const success = await authService.signOut();
      if (success) {
        logout();
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, [setLoading, logout]);

  return {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated,
    signIn,
    signUp,
    resetPassword,
    signOut,
  };
}
