//https://mongoosejs.com/docs/schematypes.html

import { Schema, Types, model } from "mongoose";

const schema = new Schema(
  {
    participants: {
      type: [
        {
          type: Types.ObjectId,
          ref: "User",
          required: [true, "Participant ID is required"],
        },
      ],
      validate: {
        validator: function (participants) {
          // Allow 1 participant (self-chat) or 2 distinct users
          return (
            participants.length === 1 ||
            (participants.length === 2 &&
              !participants[0].equals(participants[1]))
          );
        },
        message: "Conversation must have 1 or 2 distinct participants",
      },
    },
    lastMessage: {
      type: Types.ObjectId, // Reference to last message
      ref: "Message", // Reference to Message model
    },
    lastMessageTime: Date,

    unreadCount: {
      type: Map,
      of: Number,
      default: () => ({}),
    },
    unreadMessages: {
      type: Map,
      of: [Types.ObjectId],
      default: () => ({}),
    },
  },
  {
    // Schema options
    timestamps: true, // Auto-add createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in objects
  }
);

schema.index({ participants: 1, lastMessageTime: -1 });

schema.pre("save", function (next) {
  if (this.participants.length === 2) {
    this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
  }
  next();
});

const conversationModel = model("Conversation", schema);
export default conversationModel;
