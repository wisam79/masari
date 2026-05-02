import { supabase } from '../lib/supabase';
import { FINANCIAL } from '../lib/constants';
import type { PaymentMethod } from '../lib/constants';
import { subscriptionRepository } from '../repositories/SubscriptionRepository';
import type { Subscription } from '../types/models';

export interface CreateSubscriptionRequest {
  studentId: string;
  driverId: string;
  institutionId: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptUri?: string;
}

/**
 * Determines the content type of a file based on its URI.
 *
 * @param uri - The file URI.
 * @returns The MIME content type.
 */
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

/**
 * Extracts the file extension from a file URI.
 *
 * @param uri - The file URI.
 * @returns The file extension.
 */
function getFileExtension(uri: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

/**
 * Service for handling subscription and payment related operations.
 */
export class SubscriptionService {
  /**
   * Creates a signed URL for a given receipt path.
   *
   * @param receiptPath - The path of the receipt in storage.
   * @returns A promise that resolves to the signed URL.
   * @throws Will throw an error if the path is empty or URL creation fails.
   */
  async createReceiptUrl(receiptPath: string): Promise<string> {
    if (!receiptPath || !receiptPath.trim()) {
      const errorMsg = 'createReceiptUrl: receiptPath is required';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(receiptPath, 60 * 5);

      if (error) {
        console.error('createReceiptUrl: Error creating signed URL:', error.message);
        throw new Error(error.message);
      }

      if (!data?.signedUrl) {
        throw new Error('Signed URL was not returned by Supabase');
      }

      return data.signedUrl;
    } catch (error) {
      console.error('createReceiptUrl: Unexpected error:', error);
      throw error;
    }
  }

  /**
   * Uploads a receipt image/document to storage.
   *
   * @param studentId - The unique identifier of the student.
   * @param receiptUri - The local URI of the receipt to upload.
   * @returns A promise that resolves to the storage path of the uploaded receipt.
   * @throws Will throw an error if required inputs are missing or the upload fails.
   */
  async uploadReceipt(studentId: string, receiptUri: string): Promise<string> {
    if (!studentId || !studentId.trim()) {
      const errorMsg = 'uploadReceipt: studentId is required';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!receiptUri || !receiptUri.trim()) {
      const errorMsg = 'uploadReceipt: receiptUri is required';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const response = await fetch(receiptUri);

      if (!response.ok) {
        const errorMsg = 'تعذر قراءة ملف الوصل من الجهاز';
        console.error(`uploadReceipt: Fetch failed for URI ${receiptUri}`, response.statusText);
        throw new Error(errorMsg);
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
        console.error('uploadReceipt: Supabase upload error:', error.message);
        throw new Error(error.message);
      }

      return path;
    } catch (error) {
      console.error('uploadReceipt: Unexpected error during upload:', error);
      throw error;
    }
  }

  /**
   * Creates a new subscription request and uploads the receipt if provided.
   *
   * @param request - The subscription request details.
   * @returns A promise that resolves to the created Subscription.
   * @throws Will throw an error if validation fails or subscription creation fails.
   */
  async createSubscriptionRequest(request: CreateSubscriptionRequest): Promise<Subscription> {
    // Input validation
    if (!request) {
      throw new Error('createSubscriptionRequest: Request payload is missing');
    }
    if (!request.studentId) {
      throw new Error('createSubscriptionRequest: studentId is required');
    }
    if (!request.driverId) {
      throw new Error('createSubscriptionRequest: driverId is required');
    }
    if (!request.institutionId) {
      throw new Error('createSubscriptionRequest: institutionId is required');
    }
    if (!request.paymentMethod) {
      throw new Error('createSubscriptionRequest: paymentMethod is required');
    }

    let receiptPath: string | null = null;
    try {
      receiptPath = request.receiptUri
        ? await this.uploadReceipt(request.studentId, request.receiptUri)
        : null;

      const subscription = await subscriptionRepository.createSubscription({
        amount: FINANCIAL.BASE_SUBSCRIPTION,
        driver_id: request.driverId,
        institution_id: request.institutionId,
        payment_method: request.paymentMethod,
        payment_reference: request.paymentReference?.trim() || null,
        receipt_image_path: receiptPath,
        receipt_image_url: null,
        status: 'pending',
        student_id: request.studentId,
      });

      return subscription;
    } catch (error) {
      if (receiptPath) {
        try {
          await supabase.storage.from('receipts').remove([receiptPath]);
        } catch (cleanupError) {
          console.error('createSubscriptionRequest: Failed to clean up orphaned receipt:', cleanupError);
        }
      }
      console.error('createSubscriptionRequest: Failed to create subscription request:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
