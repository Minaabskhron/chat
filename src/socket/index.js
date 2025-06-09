import { setUserOffline, setUserOnline } from "../modules/user/user.service.js";
import messageSocket from "./message.socket.js";

const onlineUsers = new Map();

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", async (userId) => {
      onlineUsers.set(userId, socket.id);
      try {
        await setUserOnline(userId);
      } catch (error) {
        console.error("Error setting user online:", error);
      }
      socket.join(userId);
      io.emit("user-online", { userId });
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      socket.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stop-typing", ({ senderId, receiverId }) => {
      socket.to(receiverId).emit("stop-typing", { senderId });
    });

    // NEW: let a client join a specific conversation room
    socket.on("join-conversation", ({ conversationId }) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("leave-conversation", ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
    });

    messageSocket(io, socket, onlineUsers);

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
      let disconnectedUserId = null;
      for (let [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      if (disconnectedUserId) {
        // Remove from in‐memory map
        onlineUsers.delete(disconnectedUserId);

        // Persist offline + lastSeen
        try {
          await setUserOffline(disconnectedUserId);
        } catch (err) {
          console.error("Error setting user offline:", err);
        }

        // Notify others that this user is now offline
        io.emit("user-offline", {
          userId: disconnectedUserId,
          lastSeen: new Date().toISOString(),
        });
      }
    });
  });
}
