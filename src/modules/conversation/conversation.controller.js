import { catchError } from "../../utils/handleErrors.js";
import conversationModel from "./conversation.model.js";

const getAllConversations = catchError(async (req, res) => {
  const senderId = req.user._id;
  const conversations = await conversationModel
    .find({ $or: [{ participants: senderId }] })
    .populate({ path: "participants", select: "username name" })
    .populate({
      path: "lastMessage",
      select: "text createdAt sender status",
      populate: { path: "sender", select: "username" },
    })
    .sort({ lastMessageTime: -1 });

  if (!conversations)
    return res
      .status(200)
      .json({ message: "No conversations found", conversations: [] });

  // Process each conversation to add receiver information
  const processedConversations = conversations.map((convo) => {
    // 1. Find the participant who ISN'T the current user
    const receiverParticipant = convo.participants.find(
      (p) => p._id.toString() !== senderId.toString() // Compare string versions of IDs
    );

    // 2. Handle self-chat case (only 1 participant) or unexpected empty results
    const receiver = receiverParticipant || convo.participants[0]; // Fallback to first participant

    // 3. Create enhanced conversation object with receiver info
    return {
      ...convo.toObject(), // Convert Mongoose document to plain object
      receiver: {
        // Add receiver field with simplified data
        _id: receiver._id, // Receiver's database ID
        username: receiver.username, // Receiver's display name
        name: receiver.name, // Receiver's display name
      },
    };
  });

  res.status(200).json({ message: "sucess", processedConversations });
});

export { getAllConversations };
