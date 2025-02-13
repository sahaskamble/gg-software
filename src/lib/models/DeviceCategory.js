import mongoose from 'mongoose';

export const deviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
  },
  { timestamps: true }
);

const DeviceCategory = mongoose.models.DeviceCategory || mongoose.model("DeviceCategory", deviceCategorySchema);

export default DeviceCategory;

