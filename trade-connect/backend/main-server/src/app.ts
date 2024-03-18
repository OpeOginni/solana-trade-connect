import dotenv from "dotenv";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import express, { Express, Request, Response } from "express";

import companyRouter from "./routes/auth.route";
import tradeRouter from "./routes/trade.route";
import { getGrpcServer } from "../../grpc/dist";
import { TradeServiceHandlers } from "../../grpc/dist/proto/chat_main/TradeService";
import { initializeTradeSchema } from "./types/trade.types";

dotenv.config();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const corsOptions: CorsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default async function buildRestServer() {
  const app: Express = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(bodyParser.json());

  app.get("/", (req: Request, res: Response) => {
    res.send({ server: "Express + TypeScript Server" });
  });

  // ROUTES
  app.use("/api/v1/companies", companyRouter);

  app.use("/api/v1/trades", tradeRouter);

  return app;
}
