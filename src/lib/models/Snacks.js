import mongoose from "mongoose";

export const snackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Eatables", "Drinks"],
      default: "Eatables", // Changed default value to match enum
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5, // Notify when stock falls below this value
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "Out of Stock"],
      default: "Available",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
  },
  { timestamps: true }
);

snackSchema.pre("save", function(next) {
  this.status = this.stock > 0 ? "Available" : "Out of Stock";
  next();
});

const Snack = mongoose.models.Snack || mongoose.model("Snack", snackSchema);

export default Snack;

