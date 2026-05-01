import { supabase } from '../lib/supabase';
import { FINANCIAL } from '../lib/constants';
import { subscriptionRepository } from '../repositories/SubscriptionRepository';
import type { Subscription } from '../types/models';

export type PaymentMethod = 'zaincash' | 'fib' | 'cash' | 'other';

interface CreateSubscriptionRequest {
  studentId: string;
  driverId: string;
  institutionId: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptUri?: string;
}

function getContentType(uri: string): string {
  const lowerUri = uri.toLowerCase();

  if (lowerUri.endsWith('.png')) {
    return 'image/png';
  }

  if (lowerUri.endsWith('.webp')) {
    return 'image/webp';
  }

  if (lowerUri.endsWith('.pdf')) {
    return 'application/pdf';
  }

  return 'image/jpeg';
}

function getFileExtension(uri: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

export class SubscriptionService {
  async createReceiptUrl(receiptPath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(receiptPath, 60 * 5);

    if (error) {
      throw new Error(error.message);
    }

    return data.signedUrl;
  }

  async uploadReceipt(studentId: string, receiptUri: string): Promise<string> {
    const response = await fetch(receiptUri);

    if (!response.ok) {
      throw new Error('تعذر قراءة ملف الوصل من الجهاز');
    }

    const fileBody = await response.blob();
    const extension = getFileExtension(receiptUri);
    const path = `${studentId}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from('receipts')
      .upload(path, fileBody, {
        contentType: getContentType(receiptUri),
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return path;
  }

  async createSubscriptionRequest(request: CreateSubscriptionRequest): Promise<Subscription> {
    const receiptPath = request.receiptUri
      ? await this.uploadReceipt(request.studentId, request.receiptUri)
      : null;

    return subscriptionRepository.createSubscription({
      amount: FINANCIAL.BASE_SUBSCRIPTION,
      driver_id: request.driverId,
      institution_id: request.institutionId,
      payment_method: request.paymentMethod,
      payment_reference: request.paymentReference?.trim() || null,
      receipt_image_path: receiptPath,
      receipt_image_url: receiptPath,
      status: 'pending',
      student_id: request.studentId,
    });
  }
}

export const subscriptionService = new SubscriptionService();
