import { env } from '../../config/index.js';
import type { PaymentIntent } from '../payments.types.js';
import type { IPaymentProvider } from './interface.js';

export class PaystackProvider implements IPaymentProvider {
  public name = 'paystack';
  private baseUrl = 'https://api.paystack.co';
  private secretKey: string;

  constructor() {
    this.secretKey = env.PAYSTACK_SECRET_KEY;
  }

  private async request(path: string, method: string, body?: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      throw new Error(`Paystack error: ${data.message || response.statusText}`);
    }
    return data;
  }

  async initializePayment(input: {
    email: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> {
    const data = await this.request('/transaction/initialize', 'POST', {
      email: input.email,
      amount: Math.round(input.amount * 100), // Paystack uses kobo
      currency: input.currency || 'NGN',
      metadata: input.metadata,
    });

    return {
      amount: input.amount,
      currency: input.currency || 'NGN',
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
    };
  }

  async verifyPayment(
    reference: string
  ): Promise<{ status: string; amount: number; metadata: Record<string, any> }> {
    const data = await this.request(`/transaction/verify/${encodeURIComponent(reference)}`, 'GET');

    return {
      status: data.data.status === 'success' ? 'completed' : 'failed',
      amount: data.data.amount / 100,
      metadata: data.data.metadata || {},
    };
  }
}
