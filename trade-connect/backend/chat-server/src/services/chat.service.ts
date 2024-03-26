import { publisher } from "../redis";
import { CHAT_KEY } from "../redis/keys";
import { GetUserChatDto } from "../types/chat.types";

export async function getUserChatService(dto: GetUserChatDto) {
  const chatKey = CHAT_KEY(dto.companyId, dto.userAddress, dto.recepientAddress);

  const chats = await publisher.lrange(chatKey, 0, -1);

  return chats;
}
