import mongoose from 'mongoose';

export const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Device name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviceCategory",
      required: [true, "Device category is required"],
    },
    screenNumber: {
      type: Number,
      required: [true, "Screen number is required"],
      min: [1, "Screen number must be at least 1"],
    },
    numberOfControllers: {
      type: Number,
      required: [true, "Number of controllers is required"],
      min: [0, "Controllers cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    deviceStatus: {
      type: String,
      enum: ["Available", "Occupied", "Extended"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);

export default Device;
