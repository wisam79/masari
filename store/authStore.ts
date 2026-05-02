import { create } from 'zustand';
import type { User } from '../types/models';

/**
 * Interface representing the authentication state and its actions.
 */
interface AuthState {
  /** The currently authenticated user, or null if not authenticated. */
  user: User | null;
  /** Indicates if the authentication state is currently being loaded. */
  isLoading: boolean;
  /** Indicates if the initial authentication check has completed. */
  isInitialized: boolean;
  /** True if there is a currently authenticated user. */
  isAuthenticated: boolean;
  /** 
   * Sets the current user. Mutates `user`, `isAuthenticated`, and `isLoading` state.
   * @param user The user object or null.
   */
  setUser: (user: User | null) => void;
  /** 
   * Updates the loading status. Mutates `isLoading` state.
   * @param loading The new loading state.
   */
  setLoading: (loading: boolean) => void;
  /** 
   * Updates the initialized status. Mutates `isInitialized` state.
   * @param initialized The new initialized state.
   */
  setInitialized: (initialized: boolean) => void;
  /** 
   * Logs out the current user. Mutates `user` (sets to null), `isAuthenticated` (sets to false), and `isLoading` (sets to false).
   */
  logout: () => void;
}

/**
 * Global store for managing authentication state across the application.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));
