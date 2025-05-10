import { Router } from "express";
import { auth } from "../user/user.middleware.js";
import { getAllConversations } from "./conversation.controller.js";

const conversationRouter = Router();

conversationRouter.get("/", auth, getAllConversations);

export default conversationRouter;
