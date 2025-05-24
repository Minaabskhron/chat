import messageSocket from "./message.socket.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`…socket ${socket.id} joined room ${userId}`);
    });

    messageSocket(io, socket);
  });
}
