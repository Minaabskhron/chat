import messageSocket from "./message.socket.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", async (userId) => {
      socket.join(userId);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      socket.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stop-typing", ({ senderId, receiverId }) => {
      socket.to(receiverId).emit("stop-typing", { senderId });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    messageSocket(io, socket);
  });
}
