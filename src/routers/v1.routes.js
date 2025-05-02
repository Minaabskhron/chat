import { Router } from "express";
import userRouter from "../modules/user/user.router.js";
import messageRouter from "../modules/message/message.router.js";

const router = Router();

router.use("/user", userRouter);
router.use("/message", messageRouter);
// router.use("/conversation", conversationRouter);

export default router;
