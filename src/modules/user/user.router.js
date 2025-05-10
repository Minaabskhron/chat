import { Router } from "express";
import {
  cancelRequest,
  changePassword,
  confirmRequest,
  forgotPassword,
  getAllUsers,
  resetPassword,
  sendFriendRequest,
  signIn,
  signUp,
  updateUser,
  verifyEmail,
  verifyResetCode,
} from "./user.controller.js";
import { auth } from "./user.middleware.js";

const userRouter = Router();

//user.router.get("/shareProfile", shareProfile);
userRouter.post("/signup", signUp);
userRouter.get("/verify-email/:token", verifyEmail);
userRouter.post("/signin", signIn);
userRouter.post("/sendfriendrequest", auth, sendFriendRequest);
userRouter.patch("/confirmrequest", auth, confirmRequest);
userRouter.patch("/cancelrequest", auth, cancelRequest);
userRouter.patch("/update", auth, updateUser);
userRouter.post("/forgetPassword", forgotPassword);
userRouter.post("/verifyresetCode", verifyResetCode);
userRouter.post("/resetPassword", resetPassword);
userRouter.patch("/changePassword", auth, changePassword);
userRouter.get("/getAllusers", auth, getAllUsers);
export default userRouter;
