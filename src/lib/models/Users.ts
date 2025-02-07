import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export enum UserRole {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  StoreManager = "StoreManager",
  Staff = "Staff"
}

export interface IUser {
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserModel extends Model<IUser, {}, IUserMethods> {
  // Add any static methods here if needed
}

export const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
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
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw error;
  }
};

const Users = (mongoose.models.Users as UserModel) || mongoose.model<IUser, UserModel>("Users", userSchema);

export default Users;
