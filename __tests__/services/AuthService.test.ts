// __tests__/services/AuthService.test.ts
import { AuthService } from '../../services/AuthService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should return user on successful sign in', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };
      
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signInWithEmail('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should return error on failed sign in', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid credentials'),
      });

      const result = await authService.signInWithEmail('wrong@example.com', 'wrong');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('signUpWithEmail', () => {
    it('should return user on successful sign up', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'new@example.com',
      };
      
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signUpWithEmail('new@example.com', 'password123');
      
      expect(result.success).toBe(true);
    });

    it('should handle sign up errors', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Email already registered'),
      });

      const result = await authService.signUpWithEmail('exists@example.com', 'password123');
      
      expect(result.success).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should send reset email successfully', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await authService.resetPassword('test@example.com');
      
      expect(result.success).toBe(true);
    });

    it('should handle reset errors', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: new Error('Invalid email'),
      });

      const result = await authService.resetPassword('invalid');
      
      expect(result.success).toBe(false);
    });
  });
});