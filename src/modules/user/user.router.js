import { Router } from "express";
import { signIn, signUp, verifyEmail } from "./user.controller.js";

const userRouter = Router();

//user.router.get("/shareProfile", shareProfile);
userRouter.post("/signup", signUp);
userRouter.get("/verify-email/:token", verifyEmail);
userRouter.post("/signin", signIn);
export default userRouter;
