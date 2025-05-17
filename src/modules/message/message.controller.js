import { Types } from "mongoose";
import { AppError, catchError } from "../../utils/handleErrors.js";
import conversationModel from "../conversation/conversation.model.js";
import userModel from "../user/user.model.js";
import messageModel from "./message.model.js";

const sendMessage = catchError(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, text } = req.body;

  if (!receiverId || !text)
    throw new AppError("Receiver ID and message text are required", 400);

  const receiver = await userModel.findOne({
    _id: receiverId,
    isActive: true,
    isBlocked: false,
  });
  if (!receiver) throw new AppError("user not found", 400);

  const participants = [senderId, receiverId] //bnrtbhom 3shan mib2ash feh 2 conversations ben a w b aw b w a
    .map((id) => id.toString())
    .sort()
    .map((id) => new Types.ObjectId(id));

  const conversation = await conversationModel.findOneAndUpdate(
    { participants }, //if found return the existing document
    { $setOnInsert: { participants } }, //if not make it
    { new: true, upsert: true, runValidators: true } //upsert making the conversation if it is not found
  );

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
          lastMessageTime: message.createdAt, // Add this line
        },
        $inc: { unreadCount: 1 },
      },
      { new: true }
    )
    .populate("participants", "username"); //hna higeb al object id w alusername bta3o

  const populatedMessage = await message.populate({
    path: "sender",
    select: "username", //hna hireplace alsender bl username bta3o
  });

  req.app.io.to(conversation._id.toString()).emit("new-message", {
    //Sends the new message to all clients in the conversation room
    //Alice types "Hi Bob!" and hits send
    // Only Bob needs to get the actual message
    message: populatedMessage,
    unreadCount: updatedConversation.unreadCount,
  });

  updatedConversation.participants.forEach((participant) => {
    if (!participant.equals(senderId)) {
      //Prevents sending update notifications to the message sender
      // Check: "Is this participant Alice?"
      // Only send to Bob

      req.app.io.emit("conversation-update", {
        //Broadcasts conversation updates to all connected clients
        // Everyone except Alice sees the conversation list update

        conversationId: conversation._id,
        lastMessage: populatedMessage,
        unreadCount: updatedConversation.unreadCount,
      });
    }
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
