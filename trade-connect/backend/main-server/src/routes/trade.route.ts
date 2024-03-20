import { Router } from "express";

import { accessKeyAuthMiddleware } from "../middlewares/auth.middleware";

const tradeRouter = Router();

tradeRouter.use(accessKeyAuthMiddleware);

// tradeRouter.post("/init", initializeTrade);

// tradeRouter.post("/updateItems", updateTradeItems);

// tradeRouter.post("/accept", acceptTrade);

// tradeRouter.post("/reject", rejectTrade);

// tradeRouter.post("/cancle", cancleTrade);

export default tradeRouter;
