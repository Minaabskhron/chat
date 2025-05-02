//https://mongoosejs.com/docs/schematypes.html

import { Schema, Types, model } from "mongoose";

const schema = new Schema(
  {
    conversation: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation reference required"],
      index: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },
    text: {
      type: String,
      required: [true, "Message content is required"],
      minlength: [1, "Message cannot be empty"],
      maxlength: [2000, "Message too long (max 2000 characters)"],
      trim: true,
    },
    readBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

// Virtual population of conversation participants
schema.virtual("recipients", {
  ref: "Conversation", // The model to use
  localField: "conversation", // Field in message model
  foreignField: "_id", // Field in conversation model
  justOne: true, // Only return one conversation
  options: { select: "participants" }, // Only get participant IDs
});

// Indexes for common queries
schema.index({ conversation: 1, createdAt: -1 }); // Get conversation messages
schema.index({ sender: 1, createdAt: -1 }); // Get user's message history

const messageModel = model("Message", schema);
export default messageModel;
