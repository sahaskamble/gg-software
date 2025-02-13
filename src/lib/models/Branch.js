import mongoose from "mongoose";

export const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Branch location is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // References the SuperAdmin who created the branch
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Branch || mongoose.model("Branch", branchSchema);
