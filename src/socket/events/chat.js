import { Types } from "mongoose";
import conversationModel from "../../modules/conversation/conversation.model.js";

export function registerChatHandlers(io, socket) {
  socket.on("join-conversations", async (conversationIds, callback) => {
    try {
      // Check if callback exists and is a function
      const hasCallback = typeof callback === "function";

      // Validate input format
      if (!Array.isArray(conversationIds)) {
        const error = new Error("Invalid conversation IDs format");
        if (hasCallback)
          return callback({ status: "error", message: error.message });
        throw error;
      }

      // Validate and convert IDs
      const validIds = conversationIds
        .map((id) => {
          try {
            return new Types.ObjectId(id);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (validIds.length === 0) {
        const error = new Error("No valid conversation IDs provided");
        if (hasCallback)
          return callback({ status: "error", message: error.message });
        throw error;
      }

      // Find conversations user is part of
      const validConversations = await conversationModel
        .find({
          _id: { $in: validIds },
          participants: socket.user._id,
        })
        .exec();

      // Join rooms
      validConversations.forEach((conv) => {
        socket.join(`conv_${conv._id}`);
        console.log(`User ${socket.user._id} joined conv_${conv._id}`);
      });

      // Send response only if callback exists
      if (hasCallback) {
        callback({
          status: "success",
          joined: validConversations.map((conv) => conv._id.toString()),
        });
      }
    } catch (err) {
      console.error(`Join error [${socket.id}]:`, err.message);
      if (typeof callback === "function") {
        callback({
          status: "error",
          message: err.message,
          code: err.code, // Optional: add error codes
        });
      }
    }
  });
}
