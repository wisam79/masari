// __tests__/repositories/SubscriptionRepository.test.ts
import { SubscriptionRepository } from '../../repositories/SubscriptionRepository';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('SubscriptionRepository', () => {
  let subscriptionRepository: SubscriptionRepository;

  beforeEach(() => {
    subscriptionRepository = new SubscriptionRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listStudentSubscriptions', () => {
    it('should return student subscriptions', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          student_id: 'student-1',
          status: 'active',
        },
      ];
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockSubscriptions, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await subscriptionRepository.listStudentSubscriptions('student-1');
      
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });
  });

  describe('createSubscription', () => {
    it('should create subscription', async () => {
      const mockSubscription = {
        id: 'sub-1',
        status: 'pending',
      };
      
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await subscriptionRepository.createSubscription({
        amount: 90000,
        student_id: 'student-1',
        driver_id: 'driver-1',
        institution_id: 'inst-1',
        status: 'pending',
      });
      
      expect(result.status).toBe('pending');
    });
  });

  describe('approveSubscription', () => {
    it('should approve subscription via RPC', async () => {
      const mockSubscription = {
        id: 'sub-1',
        status: 'active',
      };
      
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSubscription,
        error: null,
      });

      const result = await subscriptionRepository.approveSubscription('sub-1');
      
      expect(result.status).toBe('active');
      expect(supabase.rpc).toHaveBeenCalledWith('approve_subscription', {
        p_subscription_id: 'sub-1',
      });
    });
  });

  describe('rejectSubscription', () => {
    it('should reject subscription via RPC', async () => {
      const mockSubscription = {
        id: 'sub-1',
        status: 'rejected',
      };
      
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSubscription,
        error: null,
      });

      const result = await subscriptionRepository.rejectSubscription('sub-1', 'Invalid receipt');
      
      expect(result.status).toBe('rejected');
    });
  });
});