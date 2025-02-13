import mongoose from 'mongoose';

export const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Game title is required"],
      unique: true,
      trim: true,
    },
    numberOfPlayers: {
      type: Number,
      required: [true, "Number of players is required"],
      min: [1, "Number of players must be at least 1"],
    },
    description: {
      type: String,
      default: "No description provided",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
  },
  { timestamps: true }
);

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;

