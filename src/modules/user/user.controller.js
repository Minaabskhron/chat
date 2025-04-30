import userModel from "./user.model.js";
import jwt from "jsonwebtoken";
import { AppError, catchError } from "../../utils/handleErrors.js";
import { sendEmail } from "../../servcies/sendEmail.js";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
//import qrcode from "qrcode";

// const addUser = catchError(async (req, res) => {
//   //for admin
//   const user = await userModel.create({ ...req.body, role: "ADMIN" });
//   let token = jwt.sign(
//     { _id: user._id, role: user.role, name: user.name, email: user.email },
//     process.env.JWT_KEY
//   );
//   token = `Bearer ${token}`;
//   // sendEmail(req.body.email);
//   res.json({ message: "Success", token });
// });

const signUp = catchError(async (req, res) => {
  const { username, name, email, password, age, gender } = req.body;
  const user = await userModel.create({
    username,
    email,
    password,
    age,
    gender,
    name,
  });
  const token = `Bearer ${jwt.sign(
    { email, username, name, _id: user._id },
    process.env.JWT_KEY
    // {expiresIn: "1h",}
  )}`;
  if (user) await sendEmail(user);
  res.status(201).json({ message: "Success", token });
});

const verifyEmail = catchError(async (req, res) => {
  const { token } = req.params;

  const { email } = jwt.verify(token, process.env.JWT_EMAIL_KEY);

  const user = await userModel.findOneAndUpdate(
    {
      email,
      emailVerificationToken: token,
    },
    {
      isEmailVerified: true,
      emailVerificationToken: "",
    }
  );
  if (!user)
    return res.status(400).json({
      message: "Invalid/expired token or already verified",
    });

  res.json({ messaage: "Success" });
});

const signIn = catchError(async (req, res) => {
  const { email, username, password } = req.body;

  if (!password || (!email && !username)) {
    throw new AppError("Please provide email/username and password", 400);
  }
  const user = await userModel
    .findOne({ $or: [{ email }, { username }] })
    .select("+isEmailVerified +isActive");
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new AppError("Invalid credentials", 400);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }
  if (user.isBlocked) {
    throw new AppError("Account is blocked", 403);
  }
  const { name, role, _id } = user;
  const token = `Bearer ${jwt.sign(
    { name, email, role, _id },
    process.env.JWT_KEY
  )}`;
  res.status(200).json({ message: "signed in successfully", token });
});

const sendFriendRequest = catchError(async (req, res) => {
  const senderId = req.user._id;
  const receiverId = new Types.ObjectId(String(req.body.id));

  if (senderId.equals(receiverId))
    throw new AppError("Cannot send request to yourself", 400);

  const [sender, receiver] = await Promise.all([
    userModel.findById(senderId),
    userModel.findById(receiverId),
  ]);

  if (!receiver) throw new AppError("User not found", 404);

  if (sender.outgoingRequests.includes(receiverId))
    throw new AppError("Request already sent", 400);

  if (sender.friends.includes(receiverId))
    throw new AppError("Already friends", 400);

  await userModel.findByIdAndUpdate(senderId, {
    $addToSet: { outgoingRequests: receiverId },
  });

  await userModel.findByIdAndUpdate(receiverId, {
    $addToSet: { incomingRequests: senderId },
  });

  res
    .status(200)
    .json({ status: "success", message: "Friend request sent successfully" });
});

const confirmRequest = catchError(async (req, res) => {
  const receiverId = req.user._id;
  const senderId = req.body.id;

  await userModel.findByIdAndUpdate(senderId, {
    $pull: { outgoingRequests: receiverId },
    $addToSet: { friends: receiverId },
  });

  await userModel.findByIdAndUpdate(receiverId, {
    $pull: { incomingRequests: senderId },
    $addToSet: { friends: senderId },
  });

  res
    .status(200)
    .json({ status: "success", message: "Friend request accepted" });
});

const cancelRequest = catchError(async (req, res) => {
  const loggedUserId = req.user._id;
  const theOtherUserId = req.body.id;

  if (!theOtherUserId) throw new AppError("Invalid user ID", 400);

  const [loggedUser, theOtherUser] = await Promise.all([
    userModel.findById(loggedUserId),
    userModel.findById(theOtherUserId),
  ]);

  if (!loggedUser || !theOtherUser) throw new AppError("User not found", 400);

  const outgoing = loggedUser.outgoingRequests.some((id) =>
    id.equals(theOtherUserId)
  );

  const ingoing = loggedUser.incomingRequests.some((id) =>
    id.equals(theOtherUserId)
  );

  if (!outgoing && !ingoing) throw new AppError("No existing request", 400);

  await userModel.findByIdAndUpdate(loggedUserId, {
    $pull: {
      outgoingRequests: theOtherUserId,
      incomingRequests: theOtherUserId,
    },
  });

  await userModel.findByIdAndUpdate(theOtherUserId, {
    $pull: { incomingRequests: loggedUserId, outgoingRequests: loggedUserId },
  });

  res
    .status(200)
    .json({ status: "success", message: "Friend request cancelled" });
});

// const shareProfile = catchError(async (req, res) => {
//   qrcode.toDataURL("http://localhost:3000/addmsg", (err, qr) => {
//     res.send(`<img src="qr"/>`);
//   });
// });

const updateUser = catchError(async (req, res) => {
  const { name, age, email, password, gender } = req.body;

  const updated = { name, age, email, password, gender };

  const { _id } = req.user;
  const newUser = await userModel.findByIdAndUpdate(_id, updated, {
    new: true, //returns the new data after update
    runValidators: true, //runs the schema validation
  });
  if (email) {
    await sendEmail(newUser);
  }
  res.json({ message: "Success", newUser });
});

// const deleteUser = catchError(async (req, res) => {
//   const { id } = req.params;
//   await userModel.findByIdAndDelete(id);
//   res.json({ messaage: "Success" });
// });

// const addNote = catchError(async (req, res) => {
//   const { content } = req.body;
//   const { _id } = req.user;
//   const data = await notesModel.create({ content, madeBy: _id.toString() });
//   res.status(201).json({ messaage: "Success", data });
// });

// const search = catchError(async (req, res) => {
//   const data = await userModel
//     .find(
//       {
//         $and: [
//           {
//             name: {
//               $regex: /^a/i, //search with name starts with a
//             },
//             age: {
//               $lte: 30, //age less than or equal = 30
//               $gte: 20, //age greater than or equal = 20
//             },
//           },
//         ],
//       },
//       {
//         password: 0, //y3ny mtgbsh alpassword
//         //w lw 7atena ay rkm y3ny true y3ny tl3 alpassword bs fe
//       }
//     )
//     .sort({ age: 1 })
//     .limit(3); //age 1 ascending -1 descending;
//   //limit hatly awl 3
//   //mmkn n7ot .populate('asm al7aga aly katbnaha fe almodel aly fe ref fe 7altna user')
//   //mmkn n7ot .populate('user',{name:1}) hat alname
// });

export {
  signUp,
  verifyEmail,
  signIn,
  sendFriendRequest,
  confirmRequest,
  cancelRequest,
  updateUser,
};
