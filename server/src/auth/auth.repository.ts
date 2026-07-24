import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { User } from './auth.types.js';

export const authRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  },

  async findById(id: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE google_id = $1', [googleId]);
  },

  async create(input: {
    name: string;
    email: string;
    password: string;
    role?: string;
    googleId?: string;
  }): Promise<User> {
    const id = generateId();
    const now = new Date().toISOString();
    const role = input.role || 'quantity_surveyor';

    await query(
      `INSERT INTO users (id, name, email, password, role, is_verified, google_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        input.name.trim(),
        input.email.toLowerCase(),
        input.password,
        role,
        input.googleId ? true : false,
        input.googleId || null,
        now,
        now,
      ]
    );

    return (await this.findById(id))!;
  },

  async updateGoogleId(userId: string, googleId: string): Promise<void> {
    await query('UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2', [
      googleId,
      userId,
    ]);
  },

  async verifyEmail(userId: string): Promise<void> {
    await query('UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1', [userId]);
  },

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
      hashedPassword,
      userId,
    ]);
  },

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await query('UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2', [
      refreshToken,
      userId,
    ]);
  },

  async updateLastLogin(userId: string): Promise<void> {
    await query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [
      userId,
    ]);
  },

  // Verification tokens
  async createVerificationToken(userId: string, token: string): Promise<void> {
    const id = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    console.log('[AUTH REPO DEBUG] createVerificationToken - id:', id, 'userId:', userId, 'tokenLength:', token.length, 'expiresAt:', expiresAt);
    try {
      const result = await query(
        `INSERT INTO verification_tokens (id, user_id, token, expires_at, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [id, userId, token, expiresAt]
      );
      console.log('[AUTH REPO DEBUG] INSERT result - rows affected:', result.rowCount);
    } catch (err) {
      console.error('[AUTH REPO DEBUG] INSERT FAILED:', err);
      throw err;
    }
  },

  async findVerificationToken(
    token: string
  ): Promise<{ id: string; user_id: string; expires_at: string } | null> {
    console.log('[AUTH REPO DEBUG] findVerificationToken - tokenLength:', token.length);
    try {
      const result = await queryOne<{ id: string; user_id: string; expires_at: string }>(
        'SELECT id, user_id, expires_at FROM verification_tokens WHERE token = $1',
        [token]
      );
      console.log('[AUTH REPO DEBUG] SELECT result:', result ? 'FOUND' : 'NOT FOUND');
      return result;
    } catch (err) {
      console.error('[AUTH REPO DEBUG] SELECT FAILED:', err);
      throw err;
    }
  },

  async deleteVerificationToken(id: string): Promise<void> {
    await query('DELETE FROM verification_tokens WHERE id = $1', [id]);
  },

  async deleteUserVerificationTokens(userId: string): Promise<void> {
    await query('DELETE FROM verification_tokens WHERE user_id = $1', [userId]);
  },

  // Password reset tokens
  async createPasswordResetToken(userId: string, token: string): Promise<void> {
    const id = generateId();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    await query(
      `INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, userId, token, expiresAt]
    );
  },

  async findPasswordResetToken(
    token: string
  ): Promise<{ id: string; user_id: string; expires_at: string; used_at: string | null } | null> {
    return queryOne<{ id: string; user_id: string; expires_at: string; used_at: string | null }>(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token = $1',
      [token]
    );
  },

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [id]);
  },
};
