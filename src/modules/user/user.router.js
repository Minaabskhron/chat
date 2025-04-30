import { Router } from "express";
import {
  cancelRequest,
  confirmRequest,
  sendFriendRequest,
  signIn,
  signUp,
  updateUser,
  verifyEmail,
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
export default userRouter;
