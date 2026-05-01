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

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, setInitialized, setUser, setLoading]);

  const sendOTP = async (phone: string) => {
    setLoading(true);
    try {
      const result = await authService.sendOTP(phone);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    setLoading(true);
    try {
      const result = await authService.verifyOTP(phone, token);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
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
    sendOTP,
    verifyOTP,
    signOut,
  };
}
