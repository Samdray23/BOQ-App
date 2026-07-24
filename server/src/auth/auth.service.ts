import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/index.js';
import { authRepository } from './auth.repository.js';
import { emailService } from '../email/email.service.js';
import { generateId, generateToken } from '../shared/utils.js';
import { BadRequestError, ConflictError, UnauthorizedError, InternalServerError } from '../shared/errors.js';
import type { User, UserResponse, AuthTokens } from './auth.types.js';
import { onboardingRepository } from '../onboarding/onboarding.repository.js';

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.is_verified,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
  };
}

function generateAccessToken(user: User): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

function generateRefreshToken(user: User): string {
  return jwt.sign({ userId: user.id, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ message: string; user?: UserResponse; token?: string; onboardingCompleted?: boolean }> {
    let existing: User | null = null;
    try {
      existing = await authRepository.findByEmail(input.email);
    } catch (err) {
      console.error('Database error during email lookup:', err);
      throw new InternalServerError('Unable to process registration. Please try again.');
    }

    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    let user: User;
    try {
      const hashedPassword = bcrypt.hashSync(input.password, 10);
      user = await authRepository.create({
        ...input,
        password: hashedPassword,
      });
    } catch (err) {
      console.error('Database error during user creation:', err);
      throw new InternalServerError('Unable to create account. Please try again.');
    }

    try {
      await onboardingRepository.create(user.id);
    } catch {
      // Non-critical: onboarding row creation failed, will be created on first fetch
    }

    if (!env.REQUIRE_EMAIL_VERIFICATION) {
      await authRepository.verifyEmail(user.id);
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await authRepository.updateRefreshToken(user.id, refreshToken);
      await authRepository.updateLastLogin(user.id);
      return {
        message: 'Account created. You are now logged in.',
        user: toUserResponse(user),
        token: accessToken,
        onboardingCompleted: false,
      };
    }

    const verificationToken = generateToken();

    try {
      await authRepository.createVerificationToken(user.id, verificationToken);
    } catch (tokenErr) {
      console.error('Failed to create verification token:', tokenErr);
      throw new InternalServerError(
        'Account created but verification setup failed. Please contact support.'
      );
    }

    const emailSent = await emailService
      .sendVerificationEmail(user.email, user.name, verificationToken)
      .then(() => true)
      .catch((emailErr) => {
        console.error('Verification email sending failed:', emailErr);
        return false;
      });

    if (!emailSent) {
      return {
        message:
          'Account created but we could not send the verification email. Please use the resend verification option.',
      };
    }

    return { message: 'Account created. Please check your email to verify your account.' };
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: UserResponse; token: string; onboardingCompleted: boolean }> {
    let user: User | null = null;
    try {
      user = await authRepository.findByEmail(input.email);
    } catch (err) {
      console.error('Database error during login:', err);
      throw new InternalServerError('Unable to process login. Please try again.');
    }

    if (!user || !bcrypt.compareSync(input.password, user.password)) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_verified) {
      throw new UnauthorizedError('Please verify your email before logging in.');
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);
    await authRepository.updateRefreshToken(user.id, refreshToken);
    await authRepository.updateLastLogin(user.id);

    let onboardingCompleted = true;
    try {
      const onboarding = await onboardingRepository.findByUserId(user.id);
      if (onboarding) {
        const isPhantom = !onboarding.completed && !onboarding.first_name && !onboarding.last_name;
        onboardingCompleted = isPhantom ? true : onboarding.completed;
      }
    } catch {
      // If onboarding table doesn't exist yet, treat as completed (existing user)
    }

    return { user: toUserResponse(user), token: accessToken, onboardingCompleted };
  },

  async googleAuth(credential: string): Promise<{ user: UserResponse; token: string; onboardingCompleted: boolean }> {
    if (!googleClient) {
      throw new BadRequestError('Google authentication is not configured');
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestError('Invalid Google token');
      }

      const googleId = payload.sub;
      const email = payload.email.toLowerCase();
      const name = payload.name || email.split('@')[0];

      let user = await authRepository.findByEmail(email);

      if (user) {
        if (!user.google_id) {
          await authRepository.updateGoogleId(user.id, googleId);
        }
        if (!user.is_verified) {
          await authRepository.verifyEmail(user.id);
        }
      } else {
        user = await authRepository.create({
          name,
          email,
          password: '',
          googleId,
        });
        try {
          await onboardingRepository.create(user.id);
        } catch {
          // Non-critical: onboarding row creation failed
        }
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await authRepository.updateRefreshToken(user.id, refreshToken);
      await authRepository.updateLastLogin(user.id);

      let onboardingCompleted = true;
      try {
        const onboarding = await onboardingRepository.findByUserId(user.id);
        if (onboarding) {
          const isPhantom = !onboarding.completed && !onboarding.first_name && !onboarding.last_name;
          onboardingCompleted = isPhantom ? true : onboarding.completed;
        }
      } catch {
        // If onboarding table doesn't exist yet, treat as completed (existing user)
      }

      return { user: toUserResponse(user), token: accessToken, onboardingCompleted };
    } catch (err) {
      if (err instanceof BadRequestError || err instanceof UnauthorizedError) throw err;
      console.error('Google auth error:', err);
      throw new UnauthorizedError('Google authentication failed');
    }
  },

  async verifyEmail(token: string): Promise<{
    message: string;
    user?: UserResponse;
    token?: string;
    onboardingCompleted?: boolean;
  }> {
    console.log('[AUTH DEBUG] verifyEmail called with token:', token);
    console.log('[AUTH DEBUG] Token length:', token.length);

    const row = await authRepository.findVerificationToken(token);
    console.log('[AUTH DEBUG] Token lookup result:', row ? 'FOUND' : 'NOT FOUND');

    if (!row) {
      console.log('[AUTH DEBUG] Token not found in database');
      throw new BadRequestError('Invalid or expired verification token');
    }

    console.log('[AUTH DEBUG] Token found - user_id:', row.user_id, 'expires_at:', row.expires_at);

    if (new Date(row.expires_at) < new Date()) {
      console.log('[AUTH DEBUG] Token has expired');
      await authRepository.deleteVerificationToken(row.id);
      throw new BadRequestError('Verification token has expired. Please register again.');
    }

    console.log('[AUTH DEBUG] Token is valid, checking user...');

    const user = await authRepository.findById(row.user_id);
    console.log('[AUTH DEBUG] User lookup result:', user ? `FOUND (is_verified: ${user.is_verified})` : 'NOT FOUND');

    if (!user) {
      throw new BadRequestError('User associated with token not found');
    }

    if (user.is_verified) {
      await authRepository.deleteVerificationToken(row.id);
    } else {
      console.log('[AUTH DEBUG] Updating user verification status...');
      await authRepository.verifyEmail(row.user_id);
      console.log('[AUTH DEBUG] Deleting used verification token...');
      await authRepository.deleteVerificationToken(row.id);
      user.is_verified = true;
    }

    // Generate tokens to log them in automatically
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await authRepository.updateRefreshToken(user.id, refreshToken);
    await authRepository.updateLastLogin(user.id);

    let onboardingCompleted = true;
    try {
      const onboarding = await onboardingRepository.findByUserId(user.id);
      if (onboarding) {
        const isPhantom = !onboarding.completed && !onboarding.first_name && !onboarding.last_name;
        onboardingCompleted = isPhantom ? true : onboarding.completed;
      }
    } catch {
      // If onboarding table doesn't exist yet, treat as completed (existing user)
    }

    console.log('[AUTH DEBUG] Email verified successfully!');
    return {
      message: 'Email verified successfully.',
      user: toUserResponse(user),
      token: accessToken,
      onboardingCompleted,
    };
  },

  async getMe(userId: string): Promise<{ user: UserResponse }> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }
    return { user: toUserResponse(user) };
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestError('No account found with this email');
    }

    if (user.is_verified) {
      return { message: 'Email is already verified. You can log in.' };
    }

    await authRepository.deleteUserVerificationTokens(user.id);

    const verificationToken = generateToken();
    await authRepository.createVerificationToken(user.id, verificationToken);

    await emailService
      .sendVerificationEmail(user.email, user.name, verificationToken)
      .catch(console.error);

    return { message: 'Verification email resent. Please check your inbox.' };
  },

  async refreshToken(refreshTokenValue: string): Promise<{ user: UserResponse; token: string }> {
    try {
      const decoded = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as {
        userId: string;
        type: string;
      };
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await authRepository.findById(decoded.userId);
      if (!user || user.refresh_token !== refreshTokenValue) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
      await authRepository.updateRefreshToken(user.id, newRefreshToken);

      return { user: toUserResponse(user), token: newAccessToken };
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      throw err;
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return {
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    const resetToken = generateToken();
    await authRepository.createPasswordResetToken(user.id, resetToken);

    await emailService
      .sendPasswordResetEmail(user.email, user.name, resetToken)
      .catch(console.error);

    return {
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const row = await authRepository.findPasswordResetToken(token);
    if (!row || row.used_at) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    if (new Date(row.expires_at) < new Date()) {
      throw new BadRequestError('Reset token has expired');
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await authRepository.updatePassword(row.user_id, hashedPassword);
    await authRepository.markPasswordResetTokenUsed(row.id);

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  },

  async logout(userId: string): Promise<void> {
    await authRepository.updateRefreshToken(userId, null);
  },
};
