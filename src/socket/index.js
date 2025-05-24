import messageSocket from "./message.socket.js";

export function registerSocketHandlers(io) {
  // 1) io.on("connection", …)
  //    – Fires once **per new client** that connects
  //    – Gives you a `socket` object you can use for that client
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 2) socket.on("join", …)
    //    – Fires when this particular client emits “join”
    //    – Lets you handle custom events from that one client
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`…socket ${socket.id} joined room ${userId}`);
    });

    messageSocket(io, socket);
  });
}
