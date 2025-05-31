import { Router } from "express";
import { getConversation } from "./message.controller.js";
import { auth } from "../user/user.middleware.js";

const messageRouter = Router();
messageRouter.get("/getConversation/:receiverId", auth, getConversation);

export default messageRouter;
