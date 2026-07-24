import { queryOne } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { OnboardingData } from './onboarding.types.js';

export const onboardingRepository = {
  async findByUserId(userId: string): Promise<OnboardingData | null> {
    return queryOne<OnboardingData>(
      'SELECT * FROM onboarding_data WHERE user_id = $1',
      [userId]
    );
  },

  async create(userId: string): Promise<OnboardingData> {
    const id = generateId();
    await queryOne(
      `INSERT INTO onboarding_data (id, user_id, completed, created_at, updated_at)
       VALUES ($1, $2, FALSE, NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [id, userId]
    );
    return (await this.findByUserId(userId))!;
  },

  async upsert(
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      company_name?: string;
      company_size?: string;
      country?: string;
      region?: string;
      experience_level?: string;
      estimation_standards?: string[];
      goals?: string[];
      ai_mode?: string;
      completed?: boolean;
    }
  ): Promise<OnboardingData> {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      await this.create(userId);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.first_name !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(data.last_name);
    }
    if (data.company_name !== undefined) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(data.company_name);
    }
    if (data.company_size !== undefined) {
      fields.push(`company_size = $${paramIndex++}`);
      values.push(data.company_size);
    }
    if (data.country !== undefined) {
      fields.push(`country = $${paramIndex++}`);
      values.push(data.country);
    }
    if (data.region !== undefined) {
      fields.push(`region = $${paramIndex++}`);
      values.push(data.region);
    }
    if (data.experience_level !== undefined) {
      fields.push(`experience_level = $${paramIndex++}`);
      values.push(data.experience_level);
    }
    if (data.estimation_standards !== undefined) {
      fields.push(`estimation_standards = $${paramIndex++}`);
      values.push(JSON.stringify(data.estimation_standards));
    }
    if (data.goals !== undefined) {
      fields.push(`goals = $${paramIndex++}`);
      values.push(JSON.stringify(data.goals));
    }
    if (data.ai_mode !== undefined) {
      fields.push(`ai_mode = $${paramIndex++}`);
      values.push(data.ai_mode);
    }
    if (data.completed !== undefined) {
      fields.push(`completed = $${paramIndex++}`);
      values.push(data.completed);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    if (fields.length > 1) {
      const setClause = fields.join(', ');
      const result = await queryOne<OnboardingData>(
        `UPDATE onboarding_data SET ${setClause} WHERE user_id = $${paramIndex} RETURNING *`,
        values
      );
      return result!;
    }

    return (await this.findByUserId(userId))!;
  },
};
