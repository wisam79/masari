import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionRepository } from '../repositories/SubscriptionRepository';
import { subscriptionService, type PaymentMethod } from '../services/SubscriptionService';

interface CreateSubscriptionInput {
  studentId: string;
  driverId: string;
  institutionId: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptUri?: string;
}

export function useStudentSubscriptions(studentId?: string) {
  return useQuery({
    enabled: !!studentId,
    queryKey: ['student-subscriptions', studentId],
    queryFn: () => subscriptionRepository.listStudentSubscriptions(studentId as string),
  });
}

export function useDriverSubscriptions(driverId?: string) {
  return useQuery({
    enabled: !!driverId,
    queryKey: ['driver-subscriptions', driverId],
    queryFn: () => subscriptionRepository.listDriverSubscriptions(driverId as string),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => subscriptionService.createSubscriptionRequest(input),
    onSuccess: (subscription) => {
      void queryClient.invalidateQueries({ queryKey: ['student-subscriptions', subscription.student_id] });
      void queryClient.invalidateQueries({ queryKey: ['driver-subscriptions', subscription.driver_id] });
    },
  });
}

export function useApproveSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionRepository.approveSubscription(subscriptionId),
    onSuccess: (subscription) => {
      void queryClient.invalidateQueries({ queryKey: ['driver-subscriptions', subscription.driver_id] });
      void queryClient.invalidateQueries({ queryKey: ['student-subscriptions', subscription.student_id] });
    },
  });
}

export function useRejectSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) =>
      subscriptionRepository.rejectSubscription(subscriptionId, reason),
    onSuccess: (subscription) => {
      void queryClient.invalidateQueries({ queryKey: ['driver-subscriptions', subscription.driver_id] });
      void queryClient.invalidateQueries({ queryKey: ['student-subscriptions', subscription.student_id] });
    },
  });
}
