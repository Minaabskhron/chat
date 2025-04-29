import userModel from "./user.model.js";
import jwt from "jsonwebtoken";
import { catchError } from "../../utils/handleErrors.js";
import { sendEmail } from "../../servcies/sendEmail.js";
//import bcrypt from "bcrypt";
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
    { ...req.body },
    process.env.JWT_KEY
    // {expiresIn: "1h",}
  )}`;
  await sendEmail(user);
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

// const SignIn = catchError(async (req, res, next) => {
//   const { email, password } = req.body;
//   const user = await userModel.findOne({ email });
//   if (!user || !bcrypt.compareSync(password, user.password))
//     throw new AppError("Invalid credentials", 400);

//   const { name, role, _id } = user;
//   const token = jwt.sign({ name, email, role, _id }, process.env.SECRET_KEY);
//   res.status(200).json({ message: "signed in successfully", token });
// });

// const shareProfile = catchError(async (req, res) => {
//   qrcode.toDataURL("http://localhost:3000/addmsg", (err, qr) => {
//     res.send(`<img src="qr"/>`);
//   });
// });

// const updateUser = catchError(async (req, res) => {
//   const { name, age, email, password, gender } = req.body;
//   const { id } = req.params;
//   const data = await userModel.findByIdAndUpdate(
//     id,
//     { name, age, email, password, gender },
//     { new: true }
//   );
//   res.json({ messaage: "Success", data });
// });
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

export { signUp, verifyEmail };
