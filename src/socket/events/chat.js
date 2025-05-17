// events/chat.js
export function registerChatHandlers(io, socket) {
  socket.on("join-conversations", (conversationIds) => {
    if (!Array.isArray(conversationIds)) return;
    conversationIds.forEach((convId) => {
      socket.join(convId.toString());
    });
  });

  socket.on("send-message", ({ conversationId, text }) => {
    // save to DB then…
    io.to(conversationId.toString()).emit("new-message", {
      text,
      conversationId,
    });
  });
}
