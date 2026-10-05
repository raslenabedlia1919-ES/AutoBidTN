import express from "express";

import {
  addFavorite,
  getMyFavorites,
  removeFavorite
} from "../controllers/favoriteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add favorite
router.post("/", authMiddleware, addFavorite);

// Get my favorites
router.get("/my-favorites", authMiddleware, getMyFavorites);

// Remove favorite
router.delete("/:id", authMiddleware, removeFavorite);

export default router;