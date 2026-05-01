import { useEffect } from 'react';
import { authService } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';

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
    if (isInitialized) {
      return;
    }

    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isInitialized, setInitialized, setUser, setLoading]);

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const signIn = async (email: string, pass: string) => {
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
  };

  const signUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await authService.signUpWithEmail(email, pass);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      return await authService.resetPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
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
  };

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