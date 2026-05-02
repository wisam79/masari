import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionRepository } from '../repositories/SubscriptionRepository';
import { subscriptionService } from '../services/SubscriptionService';
import type { PaymentMethod } from '../lib/constants';

interface CreateSubscriptionInput {
  studentId: string;
  driverId: string;
  institutionId: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptUri?: string;
}

/**
 * Fetches subscription requests for a specific student.
 * @param studentId - The ID of the student.
 * @returns React Query object containing the student's subscriptions.
 */
export function useStudentSubscriptions(studentId?: string) {
  return useQuery({
    enabled: !!studentId,
    queryKey: ['student-subscriptions', studentId],
    queryFn: () => subscriptionRepository.listStudentSubscriptions(studentId as string),
  });
}

/**
 * Fetches subscription requests directed to a specific driver.
 * @param driverId - The ID of the driver.
 * @returns React Query object containing the driver's subscription requests.
 */
export function useDriverSubscriptions(driverId?: string) {
  return useQuery({
    enabled: !!driverId,
    queryKey: ['driver-subscriptions', driverId],
    queryFn: () => subscriptionRepository.listDriverSubscriptions(driverId as string),
  });
}

/**
 * Creates a new subscription request.
 * @returns React Mutation object for creating a subscription.
 */
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

/**
 * Generates a public URL for a receipt image.
 * @returns React Mutation object for getting the receipt URL.
 */
export function useReceiptUrl() {
  return useMutation({
    mutationFn: (receiptPath: string) => subscriptionService.createReceiptUrl(receiptPath),
  });
}

/**
 * Approves a pending subscription.
 * @returns React Mutation object for approving a subscription.
 */
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

/**
 * Rejects a pending subscription.
 * @returns React Mutation object for rejecting a subscription.
 */
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
