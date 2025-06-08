import messageModel from "../modules/message/message.model.js";
import { createMessage } from "../modules/message/message.service.js";

export default function messageSocket(io, socket, onlineUsers) {
  socket.on("send-message", async ({ senderId, receiverId, text }) => {
    try {
      const { populatedMessage } = await createMessage({
        senderId,
        receiverId,
        text,
      });

      const finalStatus = onlineUsers.has(receiverId) ? "delivered" : "sent";

      const updatedMessage = await messageModel
        .findByIdAndUpdate(
          populatedMessage._id,
          { status: finalStatus },
          { new: true }
        )
        .populate("sender", "username _id");

      // Immediate emission
      io.to(receiverId).emit("new-message", { message: updatedMessage });

      // Delayed emission for sender to ensure status update

      io.to(senderId).emit("new-message", { message: updatedMessage });
    } catch (err) {
      socket.emit("message-error", err.message);
    }
  });

  socket.on("check-delivery", async ({ messageId, receiverId }) => {
    if (onlineUsers.has(receiverId)) {
      const message = await messageModel
        .findByIdAndUpdate(messageId, { status: "delivered" }, { new: true })
        .populate("sender", "username _id");

      io.to(message.sender._id.toString()).emit("new-message", { message });
    }
  });
}
