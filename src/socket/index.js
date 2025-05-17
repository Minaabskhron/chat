import { Server } from "socket.io";
import { authenticateSocket } from "./auth.js";
import { registerBaseHandlers } from "./events/base.js";
import { registerChatHandlers } from "./events/chat.js";

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

  // Apply middleware
  io.use(authenticateSocket); // Apply auth middleware to all connections

  // Register event handlers
  io.on("connection", (socket) => {
    // Handle new connections
    registerBaseHandlers(io, socket); // Register core events
    registerChatHandlers(io, socket); // Register chat events
  });

  return io; // Return configured Socket.io instance
};
