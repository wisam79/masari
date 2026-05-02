import { supabase } from '../lib/supabase';
import type { Subscription, SubscriptionInsert } from '../types/models';

/**
 * Repository for managing subscriptions between students and drivers.
 */
export class SubscriptionRepository {
  /**
   * Lists all subscriptions associated with a specific student.
   * @param studentId The unique identifier of the student.
   * @returns A promise that resolves to an array of Subscription records.
   */
  async listStudentSubscriptions(studentId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .returns<Subscription[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Lists all subscriptions managed by a specific driver.
   * @param driverId The unique identifier of the driver.
   * @returns A promise that resolves to an array of Subscription records.
   */
  async listDriverSubscriptions(driverId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .returns<Subscription[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Creates a new subscription.
   * @param subscription The subscription data to insert.
   * @returns A promise that resolves to the newly created Subscription record.
   */
  async createSubscription(subscription: SubscriptionInsert): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .returns<Subscription[]>()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Approves a specific subscription using a database RPC.
   * @param subscriptionId The unique identifier of the subscription to approve.
   * @returns A promise that resolves to the approved Subscription record.
   */
  async approveSubscription(subscriptionId: string): Promise<Subscription> {
    const { data, error } = await supabase.rpc('approve_subscription', {
      p_subscription_id: subscriptionId,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No subscription returned from approve_subscription');
    return data as Subscription;
  }

  /**
   * Rejects a specific subscription using a database RPC.
   * @param subscriptionId The unique identifier of the subscription to reject.
   * @param reason The optional reason for rejecting the subscription.
   * @returns A promise that resolves to the rejected Subscription record.
   */
  async rejectSubscription(subscriptionId: string, reason?: string): Promise<Subscription> {
    const { data, error } = await supabase.rpc('reject_subscription', {
      p_subscription_id: subscriptionId,
      p_reason: reason ?? '',
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No subscription returned from reject_subscription');
    return data as Subscription;
  }
}

export const subscriptionRepository = new SubscriptionRepository();
