import { Server } from "socket.io";

let io;

// ==========================================
// INITIALIZE SOCKET.IO
// ==========================================

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174"
      ],
      methods: ["GET", "POST"]
    }
  });

  // ==========================================
  // CLIENT CONNECTION
  // ==========================================

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    // ========================================
    // JOIN AUCTION ROOM
    // ========================================

    socket.on(
      "joinAuction",
      (auctionId) => {
        const room =
          `auction:${auctionId}`;

        socket.join(room);

        console.log(
          `${socket.id} joined ${room}`
        );
      }
    );

    // ========================================
    // LEAVE AUCTION ROOM
    // ========================================

    socket.on(
      "leaveAuction",
      (auctionId) => {
        const room =
          `auction:${auctionId}`;

        socket.leave(room);

        console.log(
          `${socket.id} left ${room}`
        );
      }
    );

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          `Socket disconnected: ${socket.id}`
        );
      }
    );
  });

  return io;
};

// ==========================================
// GET SOCKET.IO INSTANCE
// ==========================================

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }

  return io;
};