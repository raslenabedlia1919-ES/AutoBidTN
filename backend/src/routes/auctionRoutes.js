import express from "express";

import {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuctionStatus,
  deleteAuction
} from "../controllers/auctionController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all auctions
router.get("/", getAuctions);

// Get one auction
router.get("/:id", getAuctionById);

// Create auction - login required
router.post("/", authMiddleware, createAuction);

// Update auction status - login required
router.put("/:id/status", authMiddleware, updateAuctionStatus);

// Delete auction - login required
router.delete("/:id", authMiddleware, deleteAuction);

export default router;