import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import companyRouter from "./routes/auth.route";
import tradeRouter from "./routes/trade.route";

const port = process.env.PORT || 3000;

const app: Express = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send({ server: "Express + TypeScript Server" });
});

// ROUTES
app.use("/api/v1/companies", companyRouter);

app.use("/api/v1/trades", tradeRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// MOVING TO GRPC to communicate with chat server
// https://www.youtube.com/watch?v=iq2z7xw8VmE&list=PLGi7TVtAk-vM_hDcXKcLEGSkDtc64myjD&index=2
