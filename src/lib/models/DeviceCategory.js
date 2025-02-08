import mongoose from 'mongoose';

export const deviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const DeviceCategory = mongoose.models.DeviceCategory || mongoose.model("DeviceCategory", deviceCategorySchema);

export default DeviceCategory;

