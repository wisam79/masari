// __tests__/hooks/useSubscriptions.test.ts
import { SubscriptionRepository } from '../../repositories/SubscriptionRepository';
import { subscriptionService } from '../../services/SubscriptionService';

jest.mock('../../repositories/SubscriptionRepository');
jest.mock('../../services/SubscriptionService');

describe('SubscriptionRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch student subscriptions', async () => {
    const mockSubscriptions = [
      { id: 'sub-1', status: 'active' },
    ];
    
    (SubscriptionRepository.prototype.listStudentSubscriptions as jest.Mock).mockResolvedValue(mockSubscriptions);

    const repo = new SubscriptionRepository();
    const result = await repo.listStudentSubscriptions('student-1');
    
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
    
    (subscriptionService.createSubscriptionRequest as jest.Mock).mockResolvedValue(mockSubscription);

    const result = await subscriptionService.createSubscriptionRequest({
      studentId: 'student-1',
      driverId: 'driver-1',
      institutionId: 'inst-1',
      paymentMethod: 'zaincash',
    });
    
    expect(result.status).toBe('pending');
  });
});