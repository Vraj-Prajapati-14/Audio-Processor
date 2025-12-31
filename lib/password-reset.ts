import { prisma } from './prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from './email';
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
    console.log('📧 Attempting to send password reset email to:', email);
    const emailResult = await sendPasswordResetEmail(email, token);
    console.log('📧 Email sending completed:', emailResult);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error code:', error?.code);
    
    // Remove token if email fails
    console.log('🧹 Cleaning up token due to email send failure...');
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

  // Send password reset success email (non-blocking)
  try {
    await sendPasswordResetSuccessEmail(validation.email!);
  } catch (error) {
    console.error('Failed to send password reset success email:', error);
    // Continue even if email fails
  }

  return { success: true };
}

