import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import db from '../db/index.js';
import { env } from '../config.js';
import { sendVerificationEmail } from '../services/email.js';
import { authenticate } from '../middleware/auth.js';
import type {
  UserRow,
  VerificationTokenRow,
  RegisterBody,
  LoginBody,
  UserResponse,
} from '../types/index.js';

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const router = Router();

function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isVerified: row.is_verified === 1,
  };
}

function generateToken(user: UserRow): string {
  return jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response): void => {
  const { name, email, password, role } = req.body as RegisterBody;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const id = uuid();
  const hashed = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO users (id, name, email, password, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(id, name.trim(), email.trim().toLowerCase(), hashed, role || 'quantity_surveyor', now, now);

  const token = uuid();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    `
    INSERT INTO verification_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `
  ).run(uuid(), id, token, expiresAt);

  sendVerificationEmail(email.trim(), name.trim(), token).catch(console.error);

  res.status(201).json({
    message: 'Account created. Please check your email to verify your account.',
  });
});

// GET /api/auth/verify/:token
router.get('/verify/:token', (req: Request, res: Response): void => {
  const { token } = req.params;

  const row = db
    .prepare(
      `
    SELECT vt.*, u.is_verified FROM verification_tokens vt
    JOIN users u ON u.id = vt.user_id
    WHERE vt.token = ?
  `
    )
    .get(token) as (VerificationTokenRow & { is_verified: number }) | undefined;

  if (!row) {
    res.status(400).json({ error: 'Invalid or expired verification token' });
    return;
  }

  if (row.is_verified === 1) {
    res.json({ message: 'Email already verified. You can log in.' });
    return;
  }

  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM verification_tokens WHERE id = ?').run(row.id);
    res.status(400).json({ error: 'Verification token has expired. Please register again.' });
    return;
  }

  db.prepare('UPDATE users SET is_verified = 1, updated_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    row.user_id
  );
  db.prepare('DELETE FROM verification_tokens WHERE id = ?').run(row.id);

  res.json({ message: 'Email verified successfully. You can now log in.' });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body as LoginBody;

  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as
    | UserRow
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (user.is_verified === 0) {
    res.status(403).json({ error: 'Please verify your email before logging in.' });
    return;
  }

  const jwtToken = generateToken(user);

  res.json({
    user: toUserResponse(user),
    token: jwtToken,
  });
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body as { credential: string };

  if (!credential) {
    res.status(400).json({ error: 'Google credential is required' });
    return;
  }

  if (!googleClient) {
    res.status(500).json({ error: 'Google authentication is not configured' });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

    if (user) {
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ?, updated_at = ? WHERE id = ?').run(
          googleId,
          new Date().toISOString(),
          user.id
        );
      }
      if (user.is_verified === 0) {
        db.prepare('UPDATE users SET is_verified = 1, updated_at = ? WHERE id = ?').run(
          new Date().toISOString(),
          user.id
        );
      }
    } else {
      const id = uuid();
      const now = new Date().toISOString();
      db.prepare(
        `
        INSERT INTO users (id, name, email, password, role, is_verified, google_id, created_at, updated_at)
        VALUES (?, ?, ?, '', 'quantity_surveyor', 1, ?, ?, ?)
      `
      ).run(id, name, email, googleId, now, now);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
    }

    const jwtToken = generateToken(user!);

    res.json({
      user: toUserResponse(user!),
      token: jwtToken,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: Request, res: Response): void => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as
    | UserRow
    | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: toUserResponse(user) });
});

// POST /api/auth/resend-verification
router.post('/resend-verification', (req: Request, res: Response): void => {
  const { email } = req.body as { email: string };

  if (!email?.trim()) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as
    | UserRow
    | undefined;

  if (!user) {
    res.status(404).json({ error: 'No account found with this email' });
    return;
  }

  if (user.is_verified === 1) {
    res.json({ message: 'Email is already verified. You can log in.' });
    return;
  }

  db.prepare('DELETE FROM verification_tokens WHERE user_id = ?').run(user.id);

  const token = uuid();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    `
    INSERT INTO verification_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `
  ).run(uuid(), user.id, token, expiresAt);

  sendVerificationEmail(user.email, user.name, token).catch(console.error);

  res.json({ message: 'Verification email resent. Please check your inbox.' });
});

export default router;
