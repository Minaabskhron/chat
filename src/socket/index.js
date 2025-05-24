import userModel from "../modules/user/user.model.js";
import messageSocket from "./message.socket.js";

const onlineUsers = new Map();

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    let thisUserId;

    socket.on("join", async (userId) => {
      console.log(`…socket ${socket.id} joined room ${userId}`);
      thisUserId = userId;
      socket.join(userId);
      const prevCount = onlineUsers.get(userId) || 0;

      onlineUsers.set(userId, prevCount + 1);
      if (prevCount === 0) {
        await userModel.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("user-online", userId);
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      socket.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stop-typing", ({ senderId, receiverId }) => {
      socket.to(receiverId).emit("stop-typing", { senderId });
    });

    messageSocket(io, socket);

    socket.on("disconnect", async () => {
      if (!thisUserId) return;

      const count = (onlineUsers.get(thisUserId) || 1) - 1;
      if (count > 0) {
        onlineUsers.set(thisUserId, count);
      } else {
        onlineUsers.delete(thisUserId);

        await userModel.findByIdAndUpdate(thisUserId, {
          lastSeen: new Date(),
          isOnline: false,
        });

        io.emit("user-offline", {
          userId: thisUserId,
          lastSeen: new Date().toISOString(),
        });
      }
    });
  });
}
