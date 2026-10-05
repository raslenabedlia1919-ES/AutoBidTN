import Favorite from "../models/favorite.js";
import Car from "../models/car.js";

// ADD CAR TO FAVORITES
export const addFavorite = async (req, res) => {
  try {
    const { car } = req.body;

    if (!car) {
      return res.status(400).json({
        message: "Please provide car"
      });
    }

    // Check if car already exists in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user.userId,
      car
    });

    if (existingFavorite) {
      return res.status(400).json({
        message: "Car is already in your favorites"
      });
    }

    // Check if car exists
    const existingCar = await Car.findById(car);

    if (!existingCar) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    const favorite = await Favorite.create({
      user: req.user.userId,
      car
    });

    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate("car")
      .populate("user", "name email");

    res.status(201).json({
      message: "Car added to favorites",
      favorite: populatedFavorite
    });

  } catch (error) {
    console.error("Add favorite error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET MY FAVORITES
export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user.userId
    })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json({
      count: favorites.length,
      favorites
    });

  } catch (error) {
    console.error("Get favorites error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// REMOVE FROM FAVORITES
export const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found"
      });
    }

    await Favorite.findByIdAndDelete(favorite._id);

    res.json({
      message: "Car removed from favorites"
    });

  } catch (error) {
    console.error("Remove favorite error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};