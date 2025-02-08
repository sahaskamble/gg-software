import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const UserRole = {
  SuperAdmin: "SuperAdmin",
  Admin: "Admin",
  StoreManager: "StoreManager",
  Staff: "Staff"
};

export const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
    }
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw error;
  }
};

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;
