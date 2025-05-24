import { Types } from "mongoose";
import { AppError } from "../../utils/handleErrors.js";
import userModel from "../user/user.model.js";
import conversationModel from "../conversation/conversation.model.js";
import messageModel from "./message.model.js";

export const createMessage = async ({ senderId, receiverId, text }) => {
  if (!receiverId || !text)
    throw new AppError("Receiver ID and message text are required", 400);

  // 2) Ensure receiver exists and is active
  const receiver = await userModel.findOne({
    _id: receiverId,
    isActive: true,
    isBlocked: false,
  });
  if (!receiver) {
    throw new AppError("User not found or inactive/blocked", 400);
  }

  // 3) Build sorted participants array to avoid duplicate conversations
  const participants = [senderId, receiverId]
    .map((id) => id.toString())
    .sort()
    .map((id) => new Types.ObjectId(id));

  // 4) Upsert conversation document
  const conversation = await conversationModel.findOneAndUpdate(
    { participants }, //if found return the existing document
    { $setOnInsert: { participants } }, //if not make it
    { new: true, upsert: true, runValidators: true } //upsert making the conversation if it is not found
  );

  // 5) Create the message
  const message = await messageModel.create({
    conversation: conversation._id,
    sender: senderId,
    text,
  });

  const updatedConversation = await conversationModel
    .findByIdAndUpdate(
      conversation._id,
      {
        $set: {
          lastMessage: message._id,
          initiator: senderId,
          lastMessageTime: message.createdAt,
        },
        $inc: {
          [`unreadCount.${receiverId}`]: 1,
        },
      },
      { new: true }
    )
    .populate("participants", "username _id");

  const populatedMessage = await message.populate({
    path: "sender",
    select: "username email",
  });

  return { populatedMessage, updatedConversation };
}; //this is for using in the socket and http requests
