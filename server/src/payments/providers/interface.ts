import type { PaymentIntent } from '../payments.types.js';

export interface IPaymentProvider {
  initializePayment(input: {
    email: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent>;
  verifyPayment(
    reference: string
  ): Promise<{ status: string; amount: number; metadata: Record<string, any> }>;
  name: string;
}
