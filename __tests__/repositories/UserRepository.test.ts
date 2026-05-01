// __tests__/repositories/UserRepository.test.ts
import { UserRepository } from '../../repositories/UserRepository';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'test-id',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'student',
      };
      
      (supabase.from().select().eq().single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userRepository.getUserById('test-id');
      
      expect(result).toEqual(mockUser);
    });

    it('should return null on error', async () => {
      (supabase.from().select().eq().single as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      const result = await userRepository.getUserById('invalid-id');
      
      expect(result).toBeNull();
    });
  });

  describe('getUserByPhone', () => {
    it('should return user by phone', async () => {
      const mockUser = {
        id: 'test-id',
        phone: '1234567890',
      };
      
      (supabase.from().select().eq().single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userRepository.getUserByPhone('1234567890');
      
      expect(result?.phone).toBe('1234567890');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        id: 'new-id',
        full_name: 'New User',
      };
      
      (supabase.from().insert().select().single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userRepository.createUser({
        full_name: 'New User',
        role: 'student',
      });
      
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 'test-id',
        full_name: 'Updated Name',
      };
      
      (supabase.from().update().eq().select().single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userRepository.updateUser('test-id', { full_name: 'Updated Name' });
      
      expect(result?.full_name).toBe('Updated Name');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const mockUser = {
        id: 'test-id',
        role: 'driver',
      };
      
      (supabase.from().update().eq().select().single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userRepository.updateUserRole('test-id', 'driver');
      
      expect(result?.role).toBe('driver');
    });
  });
});