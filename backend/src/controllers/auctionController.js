import Auction from "../models/auction.js";
import Car from "../models/car.js";
import Bid from "../models/bid.js";

import { getIO } from "../config/socket.js";

// ==========================================
// CREATE AUCTION
// ==========================================

export const createAuction = async (
  req,
  res
) => {
  try {

    const {
      car,
      startingPrice,
      startDate,
      endDate
    } = req.body;

    // ==========================================
    // REQUIRED DATA
    // ==========================================

    if (
      !car ||
      startingPrice === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Please provide car, startingPrice, startDate and endDate"
      });
    }

    // ==========================================
    // CHECK CAR
    // ==========================================

    const existingCar =
      await Car.findById(
        car
      );

    if (!existingCar) {
      return res.status(404).json({
        message:
          "Car not found"
      });
    }

    // ==========================================
    // CHECK OWNER
    // ==========================================

    if (
      existingCar.seller.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only create an auction for your own car"
      });
    }

    // ==========================================
    // CHECK EXISTING AUCTION
    // ==========================================

    const existingAuction =
      await Auction.findOne({
        car
      });

    if (existingAuction) {
      return res.status(400).json({
        message:
          "This car already has an auction"
      });
    }

    // ==========================================
    // VALIDATE PRICE
    // ==========================================

    const price =
      Number(
        startingPrice
      );

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message:
          "Starting price must be a valid positive number"
      });
    }

    // ==========================================
    // VALIDATE DATES
    // ==========================================

    const start =
      new Date(
        startDate
      );

    const end =
      new Date(
        endDate
      );

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid date"
      });
    }

    if (
      end <= start
    ) {
      return res.status(400).json({
        message:
          "End date must be after start date"
      });
    }

    // ==========================================
    // DETERMINE STATUS
    // ==========================================

    const now =
      new Date();

    let status =
      "upcoming";

    if (
      start <= now &&
      now < end
    ) {
      status =
        "active";
    }

    // ==========================================
    // CREATE AUCTION
    // ==========================================

    const auction =
      await Auction.create({
        car,
        startingPrice:
          price,
        currentPrice:
          price,
        startDate:
          start,
        endDate:
          end,
        status
      });

    // ==========================================
    // RETURN AUCTION
    // ==========================================

    const populatedAuction =
      await Auction.findById(
        auction._id
      )
        .populate({
          path: "car",
          select:
            "title brand model year images location seller"
        })
        .populate(
          "winner",
          "name email"
        );

    res.status(201).json({
      message:
        "Auction created successfully",

      auction:
        populatedAuction
    });

  } catch (error) {

    console.error(
      "Create auction error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};

// ==========================================
// GET ALL AUCTIONS
// ==========================================

export const getAuctions = async (
  req,
  res
) => {
  try {

    await processAuctions();

    const auctions =
      await Auction.find()
        .populate({
          path: "car",
          select:
            "title brand model year images location seller"
        })
        .populate(
          "winner",
          "name email"
        )
        .sort({
          createdAt: -1
        });

    res.json({
      count:
        auctions.length,

      auctions
    });

  } catch (error) {

    console.error(
      "Get auctions error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};

// ==========================================
// GET ONE AUCTION
// ==========================================

export const getAuctionById = async (
  req,
  res
) => {
  try {

    await processAuctions();

    const auction =
      await Auction.findById(
        req.params.id
      )
        .populate({
          path: "car",
          select:
            "title brand model year images location seller"
        })
        .populate(
          "winner",
          "name email"
        );

    if (!auction) {
      return res.status(404).json({
        message:
          "Auction not found"
      });
    }

    res.json(
      auction
    );

  } catch (error) {

    console.error(
      "Get auction error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};

// ==========================================
// UPDATE AUCTION STATUS
// ==========================================

export const updateAuctionStatus =
  async (
    req,
    res
  ) => {
    try {

      const {
        status
      } = req.body;

      const allowedStatuses = [
        "upcoming",
        "active",
        "ended"
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid auction status"
        });
      }

      const auction =
        await Auction.findById(
          req.params.id
        )
          .populate("car");

      if (!auction) {
        return res.status(404).json({
          message:
            "Auction not found"
        });
      }

      // Only seller
      if (
        auction.car.seller.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to update this auction"
        });
      }

      auction.status =
        status;

      await auction.save();

      const updatedAuction =
        await Auction.findById(
          auction._id
        )
          .populate({
            path: "car",
            select:
              "title brand model year images location seller"
          })
          .populate(
            "winner",
            "name email"
          );

      res.json({
        message:
          "Auction status updated successfully",

        auction:
          updatedAuction
      });

    } catch (error) {

      console.error(
        "Update auction error:",
        error
      );

      res.status(500).json({
        message:
          "Server error"
      });
    }
  };

// ==========================================
// DELETE AUCTION
// ==========================================

export const deleteAuction = async (
  req,
  res
) => {
  try {

    const auction =
      await Auction.findById(
        req.params.id
      )
        .populate("car");

    if (!auction) {
      return res.status(404).json({
        message:
          "Auction not found"
      });
    }

    // Only seller
    if (
      auction.car.seller.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this auction"
      });
    }

    await Auction.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Auction deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete auction error:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};

// ==========================================
// PROCESS AUCTION LIFECYCLE
// ==========================================

export const processAuctions = async () => {
  try {

    const now =
      new Date();

    // ==========================================
    // UPCOMING → ACTIVE
    // ==========================================

    const upcomingAuctions =
      await Auction.find({
        status:
          "upcoming",

        startDate: {
          $lte:
            now
        },

        endDate: {
          $gt:
            now
        }
      });

    for (
      const auction of upcomingAuctions
    ) {

      auction.status =
        "active";

      await auction.save();

      console.log(
        `Auction ${auction._id} is now ACTIVE`
      );

      // Notify auction room
      try {

        const io =
          getIO();

        io.to(
          `auction:${auction._id}`
        ).emit(
          "auctionStarted",
          {
            auctionId:
              auction._id
          }
        );

      } catch (socketError) {

        console.error(
          "Socket auctionStarted error:",
          socketError.message
        );

      }
    }

    // ==========================================
    // ACTIVE → ENDED
    // ==========================================

    const endedAuctions =
      await Auction.find({
        status:
          "active",

        endDate: {
          $lte:
            now
        }
      });

    for (
      const auction of endedAuctions
    ) {

      // ========================================
      // FIND HIGHEST BID
      // ========================================

      const highestBid =
        await Bid.findOne({
          auction:
            auction._id
        })
          .sort({
            amount:
              -1
          })
          .populate(
            "bidder",
            "name email"
          );

      // ========================================
      // END AUCTION
      // ========================================

      auction.status =
        "ended";

      // ========================================
      // WINNER
      // ========================================

      if (highestBid) {

        auction.winner =
          highestBid
            .bidder
            ._id;

        auction.currentPrice =
          highestBid.amount;

        console.log(
          `Auction ${auction._id} ended`
        );

        console.log(
          `Winner: ${highestBid.bidder.name}`
        );

        console.log(
          `Winning bid: ${highestBid.amount} TND`
        );

      } else {

        console.log(
          `Auction ${auction._id} ended with no bids`
        );

      }

      await auction.save();

      // ========================================
      // SOCKET EVENT
      // ========================================

      try {

        const io =
          getIO();

        io.to(
          `auction:${auction._id}`
        ).emit(
          "auctionEnded",
          {
            auctionId:
              auction._id,

            winner:
              highestBid
                ? highestBid.bidder
                : null,

            currentPrice:
              auction.currentPrice
          }
        );

      } catch (socketError) {

        console.error(
          "Socket auctionEnded error:",
          socketError.message
        );

      }
    }

  } catch (error) {

    console.error(
      "Auction lifecycle error:",
      error
    );
  }
};