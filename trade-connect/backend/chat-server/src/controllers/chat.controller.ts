import { Request, Response } from "express";
import { getUserChatSchema } from "../types/chat.types";
import { getUserChatService } from "../services/chat.service";
import errorHandler from "../lib/errorHandler";
import { DecodedTokenDto } from "../types/auth.types";

export async function getUserChat(req: Request, res: Response) {
  try {
    // validation
    const recieverAddress = req.params.receiverAddress;
    const userPayload: DecodedTokenDto = res.locals.user;
    const dto = getUserChatSchema.parse({
      recepientAddress: recieverAddress,
      userAddress: userPayload.userAddress,
      companyId: userPayload.companyId,
    });

    const chats = await getUserChatService(dto);
    return res.status(200).json({ success: true, chats });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}
