import { useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { userRepository } from '../repositories/UserRepository';

let globalSubscription: { unsubscribe: () => void } | null = null;
let globalSubscriberCount = 0;

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

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    globalSubscriberCount++;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await userRepository.getUserById(session.user.id);
          if (mountedRef.current) setUser(userProfile || null);
        } else {
          if (mountedRef.current) setUser(null);
        }
      } catch (error) {
        console.error('Error during initial session fetch:', error);
        if (mountedRef.current) setUser(null);
      } finally {
        const state = useAuthStore.getState();
        if (!state.isInitialized) {
          state.setInitialized(true);
          state.setLoading(false);
        }
      }
    };

    if (!useAuthStore.getState().isInitialized) {
      initAuth();
    }

    if (!globalSubscription) {
      const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
        useAuthStore.getState().setUser(authUser);
        const state = useAuthStore.getState();
        if (!state.isInitialized) {
          state.setInitialized(true);
          state.setLoading(false);
        }
      });
      globalSubscription = subscription;
    }

    return () => {
      mountedRef.current = false;
      globalSubscriberCount--;
      if (globalSubscriberCount <= 0 && globalSubscription) {
        globalSubscription.unsubscribe();
        globalSubscription = null;
        globalSubscriberCount = 0;
      }
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
