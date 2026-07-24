import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Payment, Subscription } from './payments.types.js';

export const paymentsRepository = {
  async create(input: {
    userId: string;
    amount: number;
    currency: string;
    paymentProvider: string;
    providerReference: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    const id = generateId();
    await query(
      `INSERT INTO payments (id, user_id, amount, currency, status, payment_provider, provider_reference, metadata, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, NOW())`,
      [
        id,
        input.userId,
        input.amount,
        input.currency,
        input.paymentProvider,
        input.providerReference,
        JSON.stringify(input.metadata || {}),
      ]
    );
    return (await queryOne<Payment>('SELECT * FROM payments WHERE id = $1', [id]))!;
  },

  async findByProviderReference(reference: string): Promise<Payment | null> {
    return queryOne<Payment>('SELECT * FROM payments WHERE provider_reference = $1', [reference]);
  },

  async updateStatus(
    id: string,
    status: string,
    providerResponse?: Record<string, any>
  ): Promise<void> {
    if (status === 'completed') {
      await query(
        `UPDATE payments SET status = $1, provider_response = $2, paid_at = NOW() WHERE id = $3`,
        [status, JSON.stringify(providerResponse || {}), id]
      );
    } else {
      await query(`UPDATE payments SET status = $1, provider_response = $2 WHERE id = $3`, [
        status,
        JSON.stringify(providerResponse || {}),
        id,
      ]);
    }
  },

  async findSubscriptionByUser(userId: string): Promise<Subscription | null> {
    return queryOne<Subscription>('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
  },

  async activateSubscription(userId: string, plan: string): Promise<void> {
    const existing = await this.findSubscriptionByUser(userId);
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (existing) {
      await query(
        `UPDATE subscriptions SET plan = $1, status = 'active', current_period_start = $2, current_period_end = $3, updated_at = NOW() WHERE user_id = $4`,
        [plan, now.toISOString(), periodEnd.toISOString(), userId]
      );
    } else {
      const id = generateId();
      await query(
        `INSERT INTO subscriptions (id, user_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
         VALUES ($1, $2, $3, 'active', $4, $5, NOW(), NOW())`,
        [id, userId, plan, now.toISOString(), periodEnd.toISOString()]
      );
    }
  },

  async findByUser(userId: string): Promise<Payment[]> {
    return queryMany<Payment>(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },
};
