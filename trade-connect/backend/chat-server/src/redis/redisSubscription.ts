import { Server } from "socket.io";
import { subscriber } from ".";
import { COMPANY_ONLINE_COUNT_UPDATED_CHANNEL, NEW_MESSAGE_CHANNEL, ONLINE_COUNT_UPDATED_CHANNEL, USER_NEW_MESSAGE_CHANNEL } from "./channels";
import { NewMessageDto } from "../types/chat.types";

export async function setupRedisSubscriptions(io: Server) {
  // REDIS SUBSCRIBERS

  /// Subscribes to the ONLINE_COUNT_UPDATED_CHANNEL
  /// When a new user connects/disconnects, the count of online users for a PARICULAR company will be udpdated

  await subscriber.subscribe(ONLINE_COUNT_UPDATED_CHANNEL, (err, count) => {
    if (err) {
      console.error(`Error Subscribing to ${ONLINE_COUNT_UPDATED_CHANNEL}`, err);
      return;
    }
  });

  /// Subscribes to the NEW_MESSAGE_CHANNEL
  /// When a new message is sent, the message will be sent to the recipient if they are online
  await subscriber.subscribe(NEW_MESSAGE_CHANNEL, (err, count) => {
    if (err) {
      console.error(`Error Subscribing to ${NEW_MESSAGE_CHANNEL}`, err);
      return;
    }
  });

  subscriber.on("message", (channel, text) => {
    if (channel === ONLINE_COUNT_UPDATED_CHANNEL) {
      const { companyId, count } = JSON.parse(text); // Parse the JSON string

      // Emits to that particular Company the number of online users
      io.emit(COMPANY_ONLINE_COUNT_UPDATED_CHANNEL(companyId), {
        count: count,
      });

      return;
    }

    if (channel === NEW_MESSAGE_CHANNEL) {
      const { companyId, messageObject }: { companyId: string; messageObject: NewMessageDto } = JSON.parse(text); // Parse the JSON string

      // The specific user from a specific CompanyId will be listening to get newMessages (only get sent when they are online)
      io.emit(USER_NEW_MESSAGE_CHANNEL(companyId, messageObject.toAddress), messageObject);
    }
  });
}
