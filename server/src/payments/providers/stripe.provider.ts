import Stripe from 'stripe';
import { env } from '../../config/index.js';
import type { PaymentIntent } from '../payments.types.js';
import type { IPaymentProvider } from './interface.js';

export class StripeProvider implements IPaymentProvider {
  public name = 'stripe';
  private client: Stripe;

  constructor() {
    this.client = new Stripe(env.STRIPE_SECRET_KEY);
  }

  async initializePayment(input: {
    email: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> {
    const paymentIntent = await this.client.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: (input.currency || 'USD').toLowerCase(),
      receipt_email: input.email,
      metadata: input.metadata as Record<string, string>,
    });

    return {
      amount: input.amount,
      currency: input.currency || 'USD',
      reference: paymentIntent.id,
      authorizationUrl: '', // Stripe uses client-side confirmation
    };
  }

  async verifyPayment(
    reference: string
  ): Promise<{ status: string; amount: number; metadata: Record<string, any> }> {
    const paymentIntent = await this.client.paymentIntents.retrieve(reference);

    return {
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed',
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent.metadata as Record<string, any>,
    };
  }
}
