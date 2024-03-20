import { Request, Response } from "express";
import { updateTradeStatusSchema, initializeTradeSchema, updateTradeItemsSchema } from "../types/trade.types";
import {
  acceptTradeService,
  cancleTradeService,
  initializeTradeService,
  rejectTradeService,
  updateTradeItemsService,
} from "../services/trade.service";
import errorHandler from "../lib/errorHandler";

// export async function initializeTrade(req: Request, res: Response) {
//   try {
//     const dto = initializeTradeSchema.parse(req.body);

//     const trade = initializeTradeService(dto);

//     return res.status(200).json({ success: true, trade });
//   } catch (err: any) {
//     return errorHandler(err, req, res);
//   }
// }

// export async function updateTradeItems(req: Request, res: Response) {
//   try {
//     const dto = updateTradeItemsSchema.parse(req.body);

//     const updatedTrade = updateTradeItemsService(dto);

//     return res.status(200).json({ success: true, updatedTrade });
//   } catch (err: any) {
//     return errorHandler(err, req, res);
//   }
// }

// export async function acceptTrade(req: Request, res: Response) {
//   try {
//     // TODO: IF POSSIBLE
//     // GET request, sends in the tradeId in params
//     // and updaterAddress from middleware
//     const dto = updateTradeStatusSchema.parse({
//       tradeId: req.body.tradeId,
//       updaterAddress: res.locals.updaterAddress,
//     });

//     const acceptedTrade = await acceptTradeService(dto);

//     return res.status(200).json({ success: true, acceptedTrade });
//   } catch (err: any) {
//     return errorHandler(err, req, res);
//   }
// }

// export async function rejectTrade(req: Request, res: Response) {
//   try {
//     // TODO: IF POSSIBLE
//     // GET request, sends in the tradeId in params
//     // and updaterAddress from middleware
//     const dto = updateTradeStatusSchema.parse({
//       tradeId: req.body.tradeId,
//       updaterAddress: res.locals.updaterAddress,
//     });

//     const rejectedTrade = await rejectTradeService(dto);

//     return res.status(200).json({ success: true, rejectedTrade });
//   } catch (err: any) {
//     return errorHandler(err, req, res);
//   }
// }

// export async function cancleTrade(req: Request, res: Response) {
//   try {
//     // TODO: IF POSSIBLE
//     // GET request, sends in the tradeId in params
//     // and updaterAddress from middleware
//     const dto = updateTradeStatusSchema.parse({
//       tradeId: req.body.tradeId,
//       updaterAddress: res.locals.updaterAddress,
//     });

//     const cancledTrade = await cancleTradeService(dto);

//     return res.status(200).json({ success: true, cancledTrade });
//   } catch (err: any) {
//     return errorHandler(err, req, res);
//   }
// }
