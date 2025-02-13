import mongoose from "mongoose";

export const PricingSchema = new mongoose.Schema(
  {
    singlePlayerPrice: {
      type: Number,
      default: 120,
    },

    multiPlayerPrice: {
      type: Number,
      default: 70,
    },
    overThreePlayersPrice: {
      type: Number,
      default: 60,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Pricing = mongoose.models.Pricing || mongoose.model("Pricing", PricingSchema);

export default Pricing;
