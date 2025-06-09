import conversationModel from "../modules/conversation/conversation.model.js";
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

      // new logic: check if the receiver is in this specific convo room
      // (i.e. they have that chat open in their browser)
      const receiverSocketId = onlineUsers.get(receiverId);
      const convRoomName = `conversation_${populatedMessage.conversation}`;
      const convRoom = io.sockets.adapter.rooms.get(convRoomName);
      const inThatRoom = convRoom ? convRoom.has(receiverSocketId) : false;
      const finalStatus = inThatRoom
        ? "seen" // they’re viewing this conversation right now
        : receiverSocketId
        ? "delivered" // they’re online, but not in this chat
        : "sent"; // they’re offline

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

  // in messageSocket.js
  socket.on(
    "mark-as-read",
    async ({ conversationId, receiverId, senderId }) => {
      try {
        // Bulk update all messages in this conversation where receiver === receiverId
        await messageModel.updateMany(
          {
            conversation: conversationId,
            receiver: receiverId,
            status: { $in: ["sent", "delivered"] },
          },
          { status: "seen" }
        );
        await conversationModel.findByIdAndUpdate(
          conversationId,
          {
            $set: { [`unreadCount.${senderId}`]: 0 },
            [`unreadMessages.${senderId}`]: [],
          },
          { new: true }
        );
        // Fetch the updated messages if you want to push them
        const updatedMessages = await messageModel
          .find({
            conversation: conversationId,
            receiver: receiverId,
            status: "seen",
          })
          .populate("sender", "username _id")
          .populate("receiver", "username _id");

        // Emit to both users so they can update UIs

        io.to(senderId).emit("messages-read", {
          conversationId,
          messages: updatedMessages,
        });
        // Optionally tell the other party that their messages have been read

        /* derive other user in convo */
        io.to(receiverId).emit("messages-read", {
          conversationId,
          messages: updatedMessages,
        });
      } catch (err) {
        socket.emit("message-error", err.message);
      }
    }
  );
}
