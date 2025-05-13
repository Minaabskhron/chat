export const registerBaseHandlers = (io, socket) => {
  // Core event handlers
  console.log(`User connected: ${socket.user._id}`); // Log connection

  // Log all received events for debugging

  socket.onAny((event, ...args) => {
    console.log(`Event received: ${event}`, args);
  });
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
  // Handle socket errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
};
