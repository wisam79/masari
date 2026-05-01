// __tests__/services/AuthService.test.ts
import { AuthService } from '../../services/AuthService';
import { supabase } from '../../lib/supabase';
import { userRepository } from '../../repositories/UserRepository';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mock userRepository
jest.mock('../../repositories/UserRepository', () => ({
  userRepository: {
    getUserById: jest.fn(),
  },
}));

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
        full_name: 'Test User',
        role: 'student',
      };
      
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (userRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

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
        full_name: 'New User',
        role: 'student',
      };
      
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (userRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

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