import { supabase } from '../lib/supabase';
import type { Subscription, SubscriptionInsert } from '../types/models';

export class SubscriptionRepository {
  async listStudentSubscriptions(studentId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async listDriverSubscriptions(driverId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createSubscription(subscription: SubscriptionInsert): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async approveSubscription(subscriptionId: string): Promise<Subscription> {
    const { data, error } = await supabase.rpc('approve_subscription', {
      p_subscription_id: subscriptionId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async rejectSubscription(subscriptionId: string, reason?: string): Promise<Subscription> {
    const { data, error } = await supabase.rpc('reject_subscription', {
      p_subscription_id: subscriptionId,
      p_reason: reason,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const subscriptionRepository = new SubscriptionRepository();
