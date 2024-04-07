import dotenv from "dotenv";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import express, { Express, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

import companyRouter from "./routes/auth.route";
import tradeRouter from "./routes/trade.route";

dotenv.config();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const corsOptions: CorsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 50, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
});


export default async function buildRestServer() {
  const app: Express = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(limiter);

  app.get("/", (req: Request, res: Response) => {
    res.send({ server: "Express + TypeScript Server" });
  });

  // ROUTES
  app.use("/api/v1/companies", companyRouter);

  app.use("/api/v1/trades", tradeRouter);

  return app;
}
