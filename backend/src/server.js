import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";

import { connectDB } from "./config/db.js";

import commentRoutes from "./routes/commentRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

import {
  processAuctions
} from "./controllers/auctionController.js";

import {
  initSocket
} from "./config/socket.js";

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
    ]
  })
);

app.use(express.json());

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message:
      "AutoBid TN API is running"
  });
});

// ==========================================
// ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/cars",
  carRoutes
);

app.use(
  "/api/auctions",
  auctionRoutes
);

app.use(
  "/api/bids",
  bidRoutes
);

app.use(
  "/api/comments",
  commentRoutes
);

app.use(
  "/api/favorites",
  favoriteRoutes
);

// ==========================================
// HTTP SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

const server =
  http.createServer(app);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Initialize Socket.IO
    initSocket(server);

    // Process auctions immediately
    await processAuctions();

    // Check every 30 seconds
    setInterval(
      async () => {
        await processAuctions();
      },
      30 * 1000
    );

    // Start server
    server.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );
      }
    );

  } catch (error) {
    console.error(
      "Server startup error:",
      error
    );
  }
};

startServer();