import { Socket } from "socket.io";
import { NewMessageDto, StoredUserDto, newMessageSchema } from "../types/websocket.types";
import Redis from "ioredis";
import dotenv from "dotenv";
import { SaveCompanyDto } from "../types/company.types";
dotenv.config();
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const ONLINE_COUNT_UPDATED_CHANNEL = "company_online_count_updated";
const COMPANY_ONLINE_COUNT_UPDATED_CHANNEL = (companyId: string) => `company:${companyId}:online_count_updated`;
const NEW_MESSAGE_CHANNEL = "chat:new_message";

const CHAT_KEY = (companyId: string, walletAddress1: string, walletAddress2: string) => {
  // Sort the wallet addresses
  const [firstAddress, secondAddress] = [walletAddress1, walletAddress2].sort();

  return `chat:${companyId}:${firstAddress}:${secondAddress}`; // gives a definite key for the chat
};
const USER_KEY = (companyId: string, userAddress: string) => `company:${companyId}:user:${userAddress}`;

const COMPANY_KEY = (companyId: string) => `company:${companyId}`;

const COMPANY_ONLINE_COUNT_KEY = (companyId: string) => `chat:company:${companyId}:connection_count`;
const USER_RECENT_CHAT_LIST = (companyId: string, userAddress: string) => `recent_chats:${companyId}:user:${userAddress}`;
const UNREAD_CHAT_LIST = (companyId: string, userAddress: string) => `unread_messages:${companyId}:user:${userAddress}`;

if (!UPSTASH_REDIS_REST_URL) {
  console.error("UPSTASH_REDIS_REST_URL is required");
  process.exit(1);
}

// const publisher = new Redis(UPSTASH_REDIS_REST_URL);
const publisher = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
});

export async function initializeCompany(dto: SaveCompanyDto) {
  await publisher.set(COMPANY_ONLINE_COUNT_KEY(dto.companyId), 0);

  await publisher.hset(COMPANY_KEY(dto.companyId), {
    access_key: dto.accessKey,
    company_id: dto.companyId,
  });
}

export async function initializeUser(socket: Socket, companyId: string, userAddress: string) {
  await publisher.hset(USER_KEY(companyId, userAddress), {
    online: true,
    company_id: companyId,
    user_address: userAddress,
  });

  //TODO: ALWAYS INIT THE COMPANY COUNT ON THEIR SIGNING UP in other server

  // const currentCompanyOnlineCount = await publisher.get(COMPANY_ONLINE_COUNT_KEY(companyId));
  // if (!currentCompanyOnlineCount) await publisher.set(COMPANY_ONLINE_COUNT_KEY(companyId), 0);

  const incResult = await publisher.incr(COMPANY_ONLINE_COUNT_KEY(companyId));

  await publisher.publish(ONLINE_COUNT_UPDATED_CHANNEL, JSON.stringify({ companyId, count: incResult }));

  const recentChatList = await publisher.lrange(USER_RECENT_CHAT_LIST(companyId, userAddress), 0, -1);
  socket.emit("recent_chat_list", recentChatList);
}

export async function disconnectUser(socket: Socket, companyId: string, userAddress: string) {
  const decrResult = await publisher.decr(COMPANY_ONLINE_COUNT_KEY(companyId));
  await publisher.publish(ONLINE_COUNT_UPDATED_CHANNEL, JSON.stringify({ companyId, count: decrResult }));

  await publisher.hset(USER_KEY(companyId, userAddress), {
    online: false,
    company_id: companyId,
    user_address: userAddress,
  });
}

export async function sendMessage(socket: Socket, companyId: string, senderAddress: string, newMessage: NewMessageDto) {
  const message = newMessageSchema.parse(newMessage);

  const reciever = await publisher.hgetall(`company:${companyId}:user:${message.toAddress}`);

  if (!reciever) {
    // Send Message User Doesnt exist
    // Reciever must be an address in that particular company ID
    console.log("User Doesnt Exist");
    return;
  }
  await publisher.rpush(CHAT_KEY(companyId, senderAddress, message.toAddress), JSON.stringify(message));

  // Update recent chats for sender and recipient
  await updateRecentChats(companyId, senderAddress, message.toAddress);

  // Update unread messages for recipient
  await incrementUnreadMessages(companyId, message.toAddress, senderAddress, message.message);
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
