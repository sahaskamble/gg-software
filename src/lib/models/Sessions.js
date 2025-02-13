import mongoose from 'mongoose';

export const sessionSchema = new mongoose.Schema(
  { 
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      contactNumber: {
        type: String,
        required: [true, "Customer contact number is required"],
      },
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: [true, "Game selection is required"],
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: [true, "Device selection is required"],
    },
    sessionStart: {
      type: Date,
      required: [true, "Session start time is required"],
      default: Date.now,
    },
    sessionEnd: {
      type: Date,
      required: [true, "Session end time is required"],
    },
    duration: {
      type: Number, // duration in minutes
      required: [true, "Session duration is required"],
    },
    numberOfPlayers: {
      type: Number,
      required: [true, "Number of players is required"],
      min: [1, "Number of players must be at least 1"],
    },
    snacks: [
      {
        snack: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Snack",
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    discountRate: {
      type: Number,
      default: 0,
      min: [0, "Discount rate cannot be negative"],
      max: [100, "Discount rate cannot exceed 100%"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount for the session is required"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    rewardPointsUsed: {
      type: Number,
      default: 0,
    },
    sessionStatus: {
      type: String,
      enum: ["Completed", "Active", "Extended"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
