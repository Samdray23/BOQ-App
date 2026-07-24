import { env } from '../config/index.js';
import { PaystackProvider } from './providers/paystack.provider.js';
import { StripeProvider } from './providers/stripe.provider.js';
import { paymentsRepository } from './payments.repository.js';
import { emailService } from '../email/email.service.js';
import type { IPaymentProvider } from './providers/interface.js';
import type { PaymentIntent } from './payments.types.js';

let provider: IPaymentProvider;

function getProvider(): IPaymentProvider {
  if (!provider) {
    switch (env.PAYMENT_PROVIDER) {
      case 'stripe':
        provider = new StripeProvider();
        break;
      case 'paystack':
      default:
        provider = new PaystackProvider();
        break;
    }
  }
  return provider;
}

const SUBSCRIPTION_PRICES: Record<string, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  professional: { monthly: 29900, yearly: 299000 },
  enterprise: { monthly: 99900, yearly: 999000 },
};

export const paymentsService = {
  async initializeSubscription(
    userId: string,
    email: string,
    plan: string,
    interval: 'monthly' | 'yearly'
  ): Promise<PaymentIntent> {
    const amount = SUBSCRIPTION_PRICES[plan]?.[interval] || 0;
    if (amount === 0) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const paymentIntent = await getProvider().initializePayment({
      email,
      amount,
      metadata: { userId, plan, interval },
    });

    await paymentsRepository.create({
      userId,
      amount,
      currency: 'NGN',
      paymentProvider: getProvider().name,
      providerReference: paymentIntent.reference,
      metadata: { plan, interval },
    });

    return paymentIntent;
  },

  async verifyPayment(userId: string, reference: string): Promise<void> {
    const result = await getProvider().verifyPayment(reference);
    const payment = await paymentsRepository.findByProviderReference(reference);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.user_id !== userId) {
      throw new Error('Access denied');
    }

    await paymentsRepository.updateStatus(payment.id, result.status, result);

    if (result.status === 'completed') {
      const metadata = payment.metadata as Record<string, any>;
      await paymentsRepository.activateSubscription(
        payment.user_id,
        metadata.plan || 'professional'
      );

      const user = await (
        await import('../auth/auth.repository.js')
      ).authRepository.findById(payment.user_id);
      if (user) {
        await emailService.sendPaymentConfirmationEmail(
          user.email,
          user.name,
          new Intl.NumberFormat('en-NG', { style: 'currency', currency: payment.currency }).format(
            payment.amount
          ),
          metadata.plan || 'Professional'
        );
      }
    }
  },

  async getUserSubscription(userId: string) {
    const subscription = await paymentsRepository.findSubscriptionByUser(userId);
    if (!subscription) {
      return { plan: 'free', status: 'active' };
    }
    return subscription;
  },

  async getPaymentHistory(userId: string) {
    return paymentsRepository.findByUser(userId);
  },
};
