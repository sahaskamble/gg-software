import mongoose from "mongoose";

const PricingSchema = new mongoose.Schema(
  {
    singlePlayerPrice: {
      type: Number,
      default: 120,
    },

    multiPlayerPrice: {
      type: Number,
      default: 70,
    }
  },
  {
    timestamps: true,
  }
);

const Pricing = mongoose.models.Pricing || mongoose.model("Pricing", PricingSchema);

export default Pricing;
