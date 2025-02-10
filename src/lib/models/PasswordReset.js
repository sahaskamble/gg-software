import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users'
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
});

// Hash the token before saving
passwordResetSchema.pre('save', async function(next) {
  if (this.isModified('token')) {
    try {
      this.token = await bcrypt.hash(this.token, SALT_ROUNDS);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare token
passwordResetSchema.methods.compareToken = async function(candidateToken) {
  try {
    return await bcrypt.compare(candidateToken, this.token);
  } catch (error) {
    throw error;
  }
};

const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
