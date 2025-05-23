export const registerBaseHandlers = (io, socket) => {
  console.log(`New connection [${socket.id}] User: ${socket.user._id}`);

  // Debugging middleware
  socket.use(([event, ...args], next) => {
    console.log(`[${socket.id}] Event: ${event}`, args);
    next();
  });

  socket.on("error", (error) => {
    console.error(`Socket error [${socket.id}]:`, error);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Disconnect [${socket.id}]:`, reason);
  });

  socket.on("ping", (cb) => {
    if (typeof cb === "function") cb();
  });
};
