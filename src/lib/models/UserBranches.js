import mongoose, { Schema } from "mongoose";

export const UserBranchSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  branches: [{
    branchId: { type: String, required: true },
    branchName: { type: String, required: true },
    canAccess: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

export default mongoose.models.UserBranch || mongoose.model("UserBranch", UserBranchSchema);
