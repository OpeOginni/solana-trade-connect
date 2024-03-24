import { Socket } from "socket.io";

import { NewMessageInputDto, newMessageSchema } from "../types/chat.types";
import { publisher } from "../redis";
import { SaveCompanyDto } from "../types/company.types";
import { CHAT_KEY, COMPANY_KEY, COMPANY_ONLINE_COUNT_KEY, UNREAD_CHAT_LIST, USER_KEY, USER_RECENT_CHAT_LIST } from "../redis/keys";
import { NEW_MESSAGE_CHANNEL, ONLINE_COUNT_UPDATED_CHANNEL } from "../redis/channels";

export async function initializeCompany(dto: SaveCompanyDto) {
  await publisher.set(COMPANY_ONLINE_COUNT_KEY(dto.companyId), 0);

  await publisher.hset(COMPANY_KEY(dto.companyId), {
    access_key: dto.accessKey,
    company_id: dto.companyId,
  });
}

export async function initializeUser(socket: Socket) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  await publisher.hset(USER_KEY(companyId, userAddress), {
    online: true,
    company_id: companyId,
    user_address: userAddress,
  });

  const incResult = await publisher.incr(COMPANY_ONLINE_COUNT_KEY(companyId));

  await publisher.publish(ONLINE_COUNT_UPDATED_CHANNEL, JSON.stringify({ companyId, count: incResult }));

  const unreadMessages = await publisher.hgetall(UNREAD_CHAT_LIST(companyId, userAddress));
  const recentChatList = await publisher.hgetall(USER_RECENT_CHAT_LIST(companyId, userAddress));
  socket.emit("recent_chat_list", recentChatList);
  socket.emit("unread_messages", unreadMessages);
}

export async function disconnectUser(socket: Socket) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  const decrResult = await publisher.decr(COMPANY_ONLINE_COUNT_KEY(companyId));
  await publisher.publish(ONLINE_COUNT_UPDATED_CHANNEL, JSON.stringify({ companyId, count: decrResult }));

  await publisher.hset(USER_KEY(companyId, userAddress), {
    online: false,
    company_id: companyId,
    user_address: userAddress,
  });
}

export async function getRecentChats(socket: Socket) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  const recentChatList = await publisher.hgetall(USER_RECENT_CHAT_LIST(companyId, userAddress));
  socket.emit("recent_chat_list", recentChatList);
}

export async function sendMessage(socket: Socket, newMessage: NewMessageInputDto) {
  console.log("Sending Message");
  console.log(newMessage);

  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  newMessage.fromAddress = userAddress;
  const message = newMessageSchema.parse(newMessage);

  const reciever = await publisher.hgetall(`company:${companyId}:user:${message.toAddress}`);

  if (!reciever) {
    // Send Message User Doesnt exist
    // Reciever must be an address in that particular company ID
    console.log("User Doesnt Exist");
    return;
  }
  await publisher.rpush(CHAT_KEY(companyId, userAddress, message.toAddress), JSON.stringify(message));

  // Update recent chats for sender and recipient
  await updateRecentChats(companyId, userAddress, message.toAddress);

  // Update unread messages for recipient
  await incrementUnreadMessages(companyId, message.toAddress, userAddress, message.message);
  return message;
}

async function updateRecentChats(companyId: string, userAddress1: string, userAddress2: string) {
  await publisher.hset(USER_RECENT_CHAT_LIST(companyId, userAddress1), userAddress2, new Date().toISOString());
  await publisher.hset(USER_RECENT_CHAT_LIST(companyId, userAddress2), userAddress1, new Date().toISOString());
}

async function incrementUnreadMessages(companyId: string, recipientAddress: string, senderAddress: string, message: string) {
  // Check if the recipient is online
  const recipientOnline = await publisher.hget(USER_KEY(companyId, recipientAddress), "online");

  if (recipientOnline === "true") {
    // If the recipient is Online Publish a new message that will send a socket responese to that specific user
    publisher.publish(NEW_MESSAGE_CHANNEL, JSON.stringify({ companyId, recipientAddress, senderAddress, message }));
    return;
  }

  // Increment unread messages count for the recipient
  await publisher.hincrby(UNREAD_CHAT_LIST(companyId, recipientAddress), senderAddress, 1);
}
