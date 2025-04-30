import { Router } from "express";
import {
  confirmRequest,
  sendFriendRequest,
  signIn,
  signUp,
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
export default userRouter;
