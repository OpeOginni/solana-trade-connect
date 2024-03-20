import express from "express";
import { Server } from "socket.io";
import http from "http";
import helmet from "helmet";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";

import { getHealthCheck } from "./controllers/health-check.controller";
import { disconnectUser, initializeUser, sendMessage } from "./websocket/messages.websocket";
import { NewMessageDto } from "./types/message.types";
import { setupRedisSubscriptions } from "./redis/redisSubscription";
import { acceptTrade, cancleTrade, createTrade, rejectTrade, updateTrade } from "./websocket/trades.websocket";
import { InitializeTradeDto, UpdateTradeItemsDto, UpdateTradeStatusDto } from "./types/trade.types";
import socketErrorHandler from "./lib/emitError";
import { verifyUserToken } from "./lib/auth";

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
  app.use(cors(corsOptions));

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: corsOptions,
  });

  io.use((socket, next) => {
    // Added the headers for test with POSTMAN

    const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
    try {
      const decoded = verifyUserToken(token);
      socket.data.user = decoded;
    } catch (e) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Client Connected");

    await initializeUser(socket);

    // MESSAGE
    io.on("new_message", async (newMessage: NewMessageDto) => {
      try {
        await sendMessage(socket, newMessage);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    // TRADE
    io.on("create_trade", async (newTrade: InitializeTradeDto) => {
      try {
        await createTrade(socket, newTrade);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("update_trade_items", async (update: UpdateTradeItemsDto) => {
      try {
        await updateTrade(socket, update);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("accept_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await acceptTrade(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("reject_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await rejectTrade(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("cancle_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await cancleTrade(socket, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    // DISCONNECT
    io.on("disconnect", async () => {
      console.log("Client Disconnected");

      await disconnectUser(socket);
    });
  });

  setupRedisSubscriptions(io);

  app.get("/healthcheck", getHealthCheck);

  return app;
}
