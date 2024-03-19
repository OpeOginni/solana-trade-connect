import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import helmet from "helmet";
import dotenv from "dotenv";
import { getHealthCheck } from "./controllers/health-check.controller";
import cors, { CorsOptions } from "cors";
import Redis from "ioredis";
import { disconnectUser, initializeUser, sendMessage } from "./websocket/messages.websocket";
import { NewMessageDto } from "./types/message.types";
import { setupRedisSubscriptions } from "./redis/redisSubscription";
dotenv.config();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const ONLINE_COUNT_UPDATED_CHANNEL = "company-online-count-updated";
const COMPANY_ONLINE_COUNT_UPDATED_CHANNEL = (companyId: string) => `company:${companyId}:online-count-updated`;
const NEW_MESSAGE_CHANNEL = "chat:new-message";
const USER_NEW_MESSAGE_CHANNEL = (companyId: string, userAddress: string) => `chat:new-message:${companyId}:${userAddress}`;

if (!UPSTASH_REDIS_REST_URL) {
  console.error("UPSTASH_REDIS_REST_URL is required");
  process.exit(1);
}

// const subscriber = new Redis(UPSTASH_REDIS_REST_URL);

const corsOptions: CorsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default async function buildServer() {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(cors(corsOptions));

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: corsOptions,
  });

  // socket IO middlewares (socket has access to requests using `socket.request`)
  io.use((socket, next) => {});

  io.on("connection", async (socket) => {
    console.log("Client Connected");

    // We might decide to get this from a JWT that is sent with the ORIGINAL connection websocket request
    const companyId = socket.handshake.query.companyId as string;
    const userAddress = socket.handshake.query.userAddress as string;

    await initializeUser(socket, companyId, userAddress);

    io.on("new_message", async (newMessage: NewMessageDto) => {
      await sendMessage(socket, companyId, userAddress, newMessage);
    });

    io.on("create_trade", async (newMessage: NewMessageDto) => {
      await sendMessage(socket, companyId, userAddress, newMessage);
    });

    io.on("disconnect", async () => {
      console.log("Client Disconnected");

      await disconnectUser(socket, companyId, userAddress);
    });
  });

  setupRedisSubscriptions(io);

  app.get("/healthcheck", getHealthCheck);

  return app;
}
