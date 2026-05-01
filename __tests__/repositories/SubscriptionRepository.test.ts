// __tests__/repositories/SubscriptionRepository.test.ts
import { SubscriptionRepository } from '../../repositories/SubscriptionRepository';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

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
      
      (supabase.from().select().eq().order as jest.Mock).mockResolvedValue({
        data: mockSubscriptions,
        error: null,
      });

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
      
      (supabase.from().insert().select().single as jest.Mock).mockResolvedValue({
        data: mockSubscription,
        error: null,
      });

      const result = await subscriptionRepository.createSubscription({
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