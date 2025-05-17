import { Server } from "socket.io";
import { authenticateSocket } from "./auth.js";
import { registerBaseHandlers } from "./events/base.js";
import { registerChatHandlers } from "./events/chat.js";
import userModel from "../modules/user/user.model.js";

export const initializeSocket = (httpServer) => {
  // Main export function
  const io = new Server(httpServer, {
    // Create Socket.io server
    cors: {
      // CORS configuration
      origin: process.env.CLIENT_URL || "*", // Allowed origins
      methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
      allowedHeaders: ["Authorization"], // Allowed headers
      credentials: true, // Allow cookies/auth
    },
  });

  // 2) create the in-memory onlineUsers map here
  const onlineUsers = new Map();

  // Apply middleware
  io.use(authenticateSocket); // Apply auth middleware to all connections

  // Register event handlers
  io.on("connection", (socket) => {
    // after authenticateSocket, socket.user is set
    const userId = socket.user._id.toString();

    onlineUsers.set(userId, socket.id);
    // Handle new connections

    userModel
      .findByIdAndUpdate(userId, { isOnline: true })
      .catch(console.error);

    registerBaseHandlers(io, socket); // Register core events
    registerChatHandlers(io, socket); // Register chat events

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      try {
        await userModel.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Error saving lastSeen:", err);
      }
    });
  });

  return io; // Return configured Socket.io instance
};
