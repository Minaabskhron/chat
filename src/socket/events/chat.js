import { Types } from "mongoose";
import conversationModel from "../../modules/conversation/conversation.model.js";

export function registerChatHandlers(io, socket) {
  socket.on("join-conversations", async (conversationIds, callback) => {
    try {
      // Validate callback existence
      if (typeof callback !== "function") {
        throw new Error("Callback function required");
      }

      if (!Array.isArray(conversationIds)) {
        throw new Error("Invalid conversation IDs format");
      }

      // Convert to ObjectIDs and validate
      const validIds = conversationIds
        .map((id) => {
          try {
            return new Types.ObjectId(id);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const validConversations = await conversationModel.find({
        _id: { $in: validIds },
        participants: socket.user._id,
      });

      // Join rooms with standardized naming
      validConversations.forEach((conv) => {
        socket.join(`conv_${conv._id}`);
      });

      callback({
        status: "success",
        joined: validConversations.map((conv) => conv._id.toString()),
      });
    } catch (err) {
      console.error(`Join error [${socket.id}]:`, err);
      if (typeof callback === "function") {
        callback({ status: "error", message: err.message });
      }
    }
  });
}
