import { Types } from "mongoose";
import { AppError, catchError } from "../../utils/handleErrors.js";
import conversationModel from "../conversation/conversation.model.js";
import userModel from "../user/user.model.js";
import messageModel from "./message.model.js";
import { createMessage } from "./message.service.js";

const sendMessage = catchError(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, text } = req.body;

  const { populatedMessage, updatedConversation } = await createMessage({
    senderId,
    receiverId,
    text,
  });

  res.status(201).json({
    message: "Success",
    theMessage: populatedMessage,
    conversation: updatedConversation,
  });
});

const getConversation = catchError(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;

  const receiver = await userModel.findById(receiverId);
  if (!receiver) throw new AppError("receiver not found", 400);

  const participants = [senderId, receiverId]
    .map((id) => id.toString())
    .sort()
    .map((id) => new Types.ObjectId(id));

  const conversation = await conversationModel.findOne({ participants });

  if (!conversation)
    return res
      .status(200)
      .json({ message: "No conversation found", messages: [] });

  if (!conversation.participants.some((p) => p.equals(senderId))) {
    //bnshof sender part of alconversation d
    throw new AppError("Unauthorized access", 403);
  }

  const messages = await messageModel
    .find({ conversation: conversation._id })
    .populate("sender", "username")
    .sort("createdAt")
    .select("text createdAt sender");

  res.status(200).json({ message: "sucess", messages });
});

export { sendMessage, getConversation };
