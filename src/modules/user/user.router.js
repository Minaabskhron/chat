import { Router } from "express";
import { signUp, verifyEmail } from "./user.controller.js";

const userRouter = Router();

//user.router.get("/shareProfile", shareProfile);
userRouter.route("/").post(signUp);
userRouter.route("/verify-email/:token").get(verifyEmail);

export default userRouter;
