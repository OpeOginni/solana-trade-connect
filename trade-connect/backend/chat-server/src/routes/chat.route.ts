import { Router } from "express";
import { getUserChat } from "../controllers/chat.controller";
import { userAuthMiddleware } from "../middleware";

const chatRouter = Router();

chatRouter.get("/:receiverAddress", userAuthMiddleware, getUserChat);

export default chatRouter;
