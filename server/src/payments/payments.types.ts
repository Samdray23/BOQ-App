export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  payment_provider: string | null;
  provider_subscription_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_provider: string;
  provider_reference: string | null;
  provider_response: Record<string, any> | null;
  metadata: Record<string, any>;
  paid_at: string | null;
  created_at: string;
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  reference: string;
  authorizationUrl?: string;
}

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
