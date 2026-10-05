import Bid from "../models/bid.js";
import Auction from "../models/auction.js";
import Car from "../models/car.js";

import { getIO } from "../config/socket.js";

// ==========================================
// PLACE A BID
// ==========================================

export const placeBid = async (
  req,
  res
) => {
  try {

    const {
      auction,
      amount
    } = req.body;

    // ==========================================
    // 1. CHECK REQUIRED DATA
    // ==========================================

    if (
      !auction ||
      amount === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide auction and amount"
      });
    }

    // ==========================================
    // 2. FIND AUCTION
    // ==========================================

    const existingAuction =
      await Auction.findById(
        auction
      );

    if (!existingAuction) {
      return res.status(404).json({
        message:
          "Auction not found"
      });
    }

    // ==========================================
    // 3. CHECK STATUS
    // ==========================================

    if (
      existingAuction.status !==
      "active"
    ) {
      return res.status(400).json({
        message:
          "Auction is not active"
      });
    }

    // ==========================================
    // 4. CHECK DATES
    // ==========================================

    const now =
      new Date();

    if (
      now < existingAuction.startDate
    ) {
      return res.status(400).json({
        message:
          "Auction has not started yet"
      });
    }

    if (
      now >= existingAuction.endDate
    ) {
      return res.status(400).json({
        message:
          "Auction has already ended"
      });
    }

    // ==========================================
    // 5. FIND CAR
    // ==========================================

    const car =
      await Car.findById(
        existingAuction.car
      );

    if (!car) {
      return res.status(404).json({
        message:
          "Car associated with this auction was not found"
      });
    }

    // ==========================================
    // 6. SELLER CANNOT BID
    // ==========================================

    if (
      car.seller.toString() ===
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You cannot bid on your own car"
      });
    }

    // ==========================================
    // 7. VALIDATE AMOUNT
    // ==========================================

    const bidAmount =
      Number(amount);

    if (
      Number.isNaN(
        bidAmount
      )
    ) {
      return res.status(400).json({
        message:
          "Bid amount must be a valid number"
      });
    }

    if (
      bidAmount <=
      existingAuction.currentPrice
    ) {
      return res.status(400).json({
        message:
          `Bid must be higher than the current price of ${existingAuction.currentPrice}`
      });
    }

    // ==========================================
    // 8. CREATE BID
    // ==========================================

    const bid =
      await Bid.create({
        auction,
        bidder:
          req.user.userId,
        amount:
          bidAmount
      });

    // ==========================================
    // 9. UPDATE AUCTION PRICE
    // ==========================================

    existingAuction.currentPrice =
      bidAmount;

    await existingAuction.save();

    // ==========================================
    // 10. POPULATE BID
    // ==========================================

    const populatedBid =
      await Bid.findById(
        bid._id
      )
        .populate(
          "bidder",
          "name email"
        )
        .populate(
          "auction"
        );

    // ==========================================
    // 11. SOCKET.IO LIVE UPDATE
    // ==========================================

    const io =
      getIO();

    io.to(
      `auction:${auction}`
    ).emit(
      "bidPlaced",
      {
        bid:
          populatedBid,

        currentPrice:
          existingAuction.currentPrice
      }
    );

    // ==========================================
    // 12. RESPONSE
    // ==========================================

    res.status(201).json({
      message:
        "Bid placed successfully",

      bid:
        populatedBid
    });

  } catch (error) {

    console.error(
      "Place bid error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};

// ==========================================
// GET ALL BIDS FOR AN AUCTION
// ==========================================

export const getAuctionBids = async (
  req,
  res
) => {
  try {

    const bids =
      await Bid.find({
        auction:
          req.params.auctionId
      })
        .populate(
          "bidder",
          "name email"
        )
        .sort({
          amount: -1
        });

    res.json({
      count:
        bids.length,

      bids
    });

  } catch (error) {

    console.error(
      "Get auction bids error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};

// ==========================================
// GET MY BIDS
// ==========================================

export const getMyBids = async (
  req,
  res
) => {
  try {

    const bids =
      await Bid.find({
        bidder:
          req.user.userId
      })
        .populate({
          path: "auction",

          populate: {
            path: "car",
            select:
              "title brand model year images location seller"
          }
        })
        .sort({
          createdAt: -1
        });

    res.json({
      count:
        bids.length,

      bids
    });

  } catch (error) {

    console.error(
      "Get my bids error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};