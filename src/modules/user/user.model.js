//https://mongoosejs.com/docs/schematypes.html

import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";

const schema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "username is required"],
      lowercase: true,
      minLength: 3,
      maxLength: 30,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
      lowercase: true,
      minLength: 3,
      maxLength: 30,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "gender is required"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
      index: true, //search bib2a asahl
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator(value) {
          const regex =
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}[\]:";'?/><,.]).{8,}$/;
          return regex.test(value);
        },
        message: "Password does not match the criteria",
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      required: [true, "Age is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
        validate: [(val) => val.length <= 5000, "Exceeds friends limit"],
      },
    ],
    incomingRequests: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    outgoingRequests: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    passwordResetCode: String,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
  },

  { timestamps: true }
);
schema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, +process.env.SALT);
  next();
});

schema.pre("findOneAndUpdate", function (next) {
  const salt = +process.env.SALT;

  const update = this.getUpdate();
  if (update?.password || update?.$set?.password) {
    if (update?.password) {
      update.password = bcrypt.hashSync(update.password, salt);
      update.passwordChangedAt = Date.now();
    }

    if (update?.$set.password) {
      update.$set.password = bcrypt.hashSync(update.$set.password, salt);
      update.$set.passwordChangedAt = Date.now();
    }
    this.setUpdate(update);
  }
  next();
});
const userModel = model("User", schema);
export default userModel;
