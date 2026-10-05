import express from "express";

import {
  placeBid,
  getAuctionBids,
  getMyBids
} from "../controllers/bidController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Place a bid
router.post("/", authMiddleware, placeBid);

// Get all bids for an auction
router.get("/auction/:auctionId", getAuctionBids);

// Get current user's bids
router.get("/my-bids", authMiddleware, getMyBids);

export default router;