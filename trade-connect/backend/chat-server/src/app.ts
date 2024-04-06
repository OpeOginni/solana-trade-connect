import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import helmet from "helmet";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";

import { getHealthCheck } from "./controllers/health-check.controller";
import { disconnectUser, initializeUser, sendMessage, getRecentChats } from "./websocket/messages.websocket";
import { NewMessageDto } from "./types/chat.types";
import { setupRedisSubscriptions } from "./redis/redisSubscription";
import { acceptTrade, cancleTrade, createTrade, rejectTrade, signedDepositTransaction, updateTrade } from "./websocket/trades.websocket";
import { InitializeTradeDto, UpdateTradeItemsDto, UpdateTradeStatusDto } from "./types/trade.types";
import socketErrorHandler from "./lib/emitError";
import { verifyUserToken } from "./lib/auth";
import { getUserChat } from "./controllers/chat.controller";
import chatRouter from "./routes/chat.route";
import companyRouter from "./routes/auth.route";
import authRouter from "./routes/auth.route";
import { SignedDepositTransactionDto } from "./types/transaction.types";
dotenv.config();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const corsOptions: CorsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default async function buildServer() {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  // app.use(cors(corsOptions));
  app.use(cors());

  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: ["*"],
      methods: ["GET", "POST"],
      allowedHeaders: ["token"],
      // credentials: true,
    },
  });

  io.use((socket, next) => {
    // Added the headers for test with POSTMAN

    const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
    try {
      const decoded = verifyUserToken(token);
      socket.data.user = decoded;
      next();
    } catch (e) {
      console.log(e);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Client Connected");

    await initializeUser(socket);

    // MESSAGE
    socket.on("new_message", async (newMessage: NewMessageDto, callback) => {
      try {
        const message = await sendMessage(socket, newMessage);
        callback(message);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    socket.on("get_recent_chats", async () => {
      try {
        await getRecentChats(socket);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    // TRADE
    socket.on("create_trade", async (newTrade: InitializeTradeDto, callback) => {
      try {
        const message = await createTrade(socket, newTrade);
        callback(message);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    socket.on("update_trade_items", async (update: UpdateTradeItemsDto) => {
      try {
        await updateTrade(socket, update);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    socket.on("accept_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await acceptTrade(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    socket.on("reject_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await rejectTrade(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    socket.on("cancle_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await cancleTrade(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    socket.on("signed_deposit", async (dto: SignedDepositTransactionDto) => {
      try {
        await signedDepositTransaction(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log("Client Disconnected");

      await disconnectUser(socket);
    });
  });

  await setupRedisSubscriptions(io);

  app.use("/api/v1/chats", chatRouter);

  app.use("/api/v1/auth", authRouter);

  app.get("/healthcheck", getHealthCheck);

  return server;
}
