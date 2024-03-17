import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import helmet from "helmet";
import dotenv from "dotenv";
import { getHealthCheck } from "./controllers/health-check.controller";
import cors, { CorsOptions } from "cors";
import Redis from "ioredis";
import { disconnectUser, initializeUser, sendMessage } from "./controllers/websocket.controller";
import { NewMessageDto } from "./types/websocket.types";
dotenv.config();

const PORT = parseInt(process.env.PORT || "3001");
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

const ONLINE_COUNT_UPDATED_CHANNEL = "company-online-count-updated";
const COMPANY_ONLINE_COUNT_UPDATED_CHANNEL = (companyId: string) => `company:${companyId}:online-count-updated`;
const NEW_MESSAGE_CHANNEL = "chat:new-message";
const USER_NEW_MESSAGE_CHANNEL = (companyId: string, userAddress: string) => `chat:new-message:${companyId}:${userAddress}`;

if (!UPSTASH_REDIS_REST_URL) {
  console.error("UPSTASH_REDIS_REST_URL is required");
  process.exit(1);
}

// If we set encypted to true
// const publisher = new Redis(UPSTASH_REDIS_REST_URL, {
//   tls: {
//     rejectUnauthorized: true,
//   },
// });

const publisher = new Redis(UPSTASH_REDIS_REST_URL);
const subscriber = new Redis(UPSTASH_REDIS_REST_URL);

const corsOptions: CorsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

async function buildServer() {
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

    await initializeUser(socket, publisher, companyId, userAddress);

    io.on("new_message", async (newMessage: NewMessageDto) => {
      await sendMessage(publisher, socket, companyId, userAddress, newMessage);
    });

    io.on("disconnect", async () => {
      console.log("Client Disconnected");

      await disconnectUser(socket, publisher, companyId, userAddress);
    });
  });

  subscriber.subscribe(ONLINE_COUNT_UPDATED_CHANNEL, (err, count) => {
    if (err) {
      console.error(`Error Subscribing to ${ONLINE_COUNT_UPDATED_CHANNEL}`, err);
      return;
    }

    console.log(`${count} clients subscribed to ${ONLINE_COUNT_UPDATED_CHANNEL} channel`);
  });

  subscriber.subscribe(NEW_MESSAGE_CHANNEL, (err, count) => {
    if (err) {
      console.error(`Error Subscribing to ${NEW_MESSAGE_CHANNEL}`, err);
      return;
    }

    console.log(`${count} clients subscribed to ${NEW_MESSAGE_CHANNEL} channel`);
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
      const { companyId, recipientAddress, senderAddress, message } = JSON.parse(text); // Parse the JSON string

      // The specific user from a specific CompanyId will be listening to get newMessages (only get sent when they are online)
      io.emit(USER_NEW_MESSAGE_CHANNEL(companyId, recipientAddress), {
        sender: senderAddress,
        message: message,
      });
    }
  });

  app.get("/healthcheck", getHealthCheck);

  return app;
}

async function main() {
  const app = await buildServer();

  try {
    app.listen(PORT, HOST, () => {
      console.log(`Server started at http://${HOST}:${PORT}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
