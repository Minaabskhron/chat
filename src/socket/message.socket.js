import { createMessage } from "../modules/message/message.service.js";

export default function messageSocket(io, socket) {
  socket.on("send-message", async ({ senderId, receiverId, text }) => {
    try {
      const { populatedMessage } = await createMessage({
        senderId,
        receiverId,
        text,
      });
      // Emit to sender and receiver rooms (you’ll need to have them join)
      // 1) Send the new message back to the sender’s own room:

      io.to(senderId).emit("new-message", {
        populatedMessage,
      });
      // 2) Send the new message to the receiver’s room:

      io.to(receiverId).emit("new-message", {
        populatedMessage,
      });
    } catch (err) {
      socket.emit("message-error", err.message);
    }
  });
}
