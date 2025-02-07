import mongoose, { Schema } from "mongoose";

export interface IUserBranch {
  userId: string;
  branches: {
    branchId: string;
    branchName: string;
    canAccess: boolean;
  }[];
}

export const UserBranchSchema = new Schema<IUserBranch>({
  userId: { type: String, required: true, unique: true },
  branches: [{
    branchId: { type: String, required: true },
    branchName: { type: String, required: true },
    canAccess: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

export default mongoose.models.UserBranch || mongoose.model<IUserBranch>("UserBranch", UserBranchSchema);
