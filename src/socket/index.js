import { Server } from "socket.io";
import { authenticateSocket } from "./auth.js";
import { registerBaseHandlers } from "./events/base.js";
import { registerChatHandlers } from "./events/chat.js";
import conversationModel from "../modules/conversation/conversation.model.js";
import userModel from "../modules/user/user.model.js";

const onlineUsers = new Map();

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.BACK_URL?.split(",") || "*", // Add null check
      methods: ["GET", "POST"],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();

    // Track user's sockets
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    const userSockets = onlineUsers.get(userId);
    userSockets.add(socket.id);

    // Update online status only if first connection
    if (userSockets.size === 1) {
      await userModel
        .findByIdAndUpdate(userId, {
          isOnline: true,
          $unset: { lastSeen: 1 },
        })
        .catch((err) =>
          console.error(`Online status error [${socket.id}]:`, err)
        );
    }

    // Join existing conversation rooms
    try {
      const conversations = await conversationModel
        .find({
          participants: userId,
        })
        .select("_id")
        .lean();

      conversations.forEach((conv) => {
        socket.join(`conv_${conv._id}`); // Add namespace prefix
      });
    } catch (err) {
      console.error(`Room join error [${socket.id}]:`, err);
    }

    registerBaseHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", async () => {
      const userSockets = onlineUsers.get(userId) || new Set();
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        await userModel
          .findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          })
          .catch((err) =>
            console.error(`Offline status error [${socket.id}]:`, err)
          );
      }
    });
  });

  return io;
};
