import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// A user cannot favorite the same car twice
favoriteSchema.index(
  { user: 1, car: 1 },
  { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;