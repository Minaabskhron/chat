import { createMessage } from "../modules/message/message.service.js";

export default function messageSocket(io, socket) {
  socket.on("send-message", async ({ senderId, receiverId, text }) => {
    try {
      const { populatedMessage, updatedConversation } = await createMessage({
        senderId,
        receiverId,
        text,
      });
      // Emit to sender and receiver rooms (you’ll need to have them join)
      io.to(senderId).emit("new-message", {
        populatedMessage,
        updatedConversation,
      });
      io.to(receiverId).emit("new-message", {
        populatedMessage,
        updatedConversation,
      });
    } catch (err) {
      socket.emit("message-error", err.message);
    }
  });
}
