import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Users from '@/lib/models/Users';
import PasswordReset from '@/lib/models/PasswordReset';
import { validatePassword } from '@/lib/utils';
import { logger } from '@/lib/logger';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password', details: errors },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find valid reset token
    const passwordReset = await PasswordReset.findOne({
      createdAt: { $gt: new Date(Date.now() - 3600000) } // Within last hour
    });

    if (!passwordReset) {
      logger.warn('Invalid or expired reset token used');
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Verify token
    const isValidToken = await passwordReset.compareToken(token);
    if (!isValidToken) {
      logger.warn('Invalid reset token used');
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Find and update user
    const user = await Users.findById(passwordReset.userId);
    if (!user) {
      logger.error('User not found for valid reset token', { userId: passwordReset.userId });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete reset token
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    logger.info('Password reset successful', { userId: user._id });

    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    logger.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
