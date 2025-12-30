import { prisma } from './prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from './email';
import bcrypt from 'bcryptjs';

const RESET_TOKEN_EXPIRY_MINUTES = 5;

export async function generatePasswordResetToken(email: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists for security
    return { success: true };
  }

  // Generate secure random token
  const token = randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + RESET_TOKEN_EXPIRY_MINUTES);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Store token in VerificationToken table
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: token,
      expires: expires,
    },
  });

  // Send email
  try {
    await sendPasswordResetEmail(email, token);
    return { success: true };
  } catch (error) {
    // Remove token if email fails
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        token: token,
      },
    });
    throw error;
  }
}

export async function validatePasswordResetToken(token: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!verificationToken) {
    return { valid: false, error: 'Invalid or expired reset token' };
  }

  if (verificationToken.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.deleteMany({
      where: { token },
    });
    return { valid: false, error: 'Reset token has expired' };
  }

  return { valid: true, email: verificationToken.identifier };
}

export async function resetPassword(token: string, newPassword: string) {
  // Validate token
  const validation = await validatePasswordResetToken(token);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password
  await prisma.user.update({
    where: { email: validation.email! },
    data: { password: hashedPassword },
  });

  // Delete all reset tokens for this email (prevent reuse)
  await prisma.verificationToken.deleteMany({
    where: { 
      identifier: validation.email!,
      token: token,
    },
  });

  return { success: true };
}

