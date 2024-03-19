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
import socketErrorHandler from "./utils/emitError";

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

  // socket IO middlewares (socket has access to requests using `socket.request`)
  io.use((socket, next) => {});

  io.on("connection", async (socket) => {
    console.log("Client Connected");

    // We might decide to get this from a JWT that is sent with the ORIGINAL connection websocket request
    const companyId = socket.handshake.query.companyId as string;
    const userAddress = socket.handshake.query.userAddress as string;

    await initializeUser(socket, companyId, userAddress);

    // MESSAGE
    io.on("new_message", async (newMessage: NewMessageDto) => {
      try {
        await sendMessage(socket, companyId, userAddress, newMessage);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    // TRADE
    io.on("create_trade", async (newTrade: InitializeTradeDto) => {
      try {
        await createTrade(socket, companyId, userAddress, newTrade);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("update_trade_items", async (update: UpdateTradeItemsDto) => {
      try {
        await updateTrade(socket, companyId, userAddress, update);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("accept_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await acceptTrade(socket, companyId, userAddress, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("reject_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await rejectTrade(socket, companyId, userAddress, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    io.on("cancle_trade", async (dto: UpdateTradeStatusDto) => {
      try {
        await cancleTrade(socket, companyId, userAddress, dto);
      } catch (err: any) {
        socketErrorHandler(socket, err);
      }
    });

    // DISCONNECT
    io.on("disconnect", async () => {
      console.log("Client Disconnected");

      await disconnectUser(socket, companyId, userAddress);
    });
  });

  setupRedisSubscriptions(io);

  app.get("/healthcheck", getHealthCheck);

  return app;
}
