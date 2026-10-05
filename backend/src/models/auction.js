import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      unique: true
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 0
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "ended"],
      default: "upcoming"
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;