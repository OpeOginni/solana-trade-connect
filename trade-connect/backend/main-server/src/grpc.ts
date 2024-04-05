import dotenv from "dotenv";
import * as grpc from "@grpc/grpc-js";
import { getGrpcClient, getGrpcServer } from "../../grpc/dist";
import { initializeTradeSchema, updateTradeItemsSchema, updateTradeStatusSchema } from "./types/trade.types";
import { TradeServiceHandlers } from "../../grpc/dist/proto/chat_main/TradeService";
import {
  initializeTradeService,
  updateTradeItemsService,
  rejectTradeService,
  cancleTradeService,
  acceptTradeService,
} from "./services/trade.service";
import grpcErrorHandler from "./lib/grpcErrorHandler";
import CustomError from "./lib/customError";

const { server: grpcServer, grpcPackage } = getGrpcServer();

dotenv.config();

const CHAT_GRPC_PORT = parseInt(process.env.CHAT_GRPC_PORT || "8081");

const CHAT_GRPC_HOST = process.env.CHAT_GRPC_HOST || "0.0.0.0";

const grpcClient = getGrpcClient(CHAT_GRPC_HOST, CHAT_GRPC_PORT);

export async function initCompanyInfoGRPC(companyId: string, accessKey: string) {
  console.log({
    companyId,
    accessKey,
  });
  grpcClient.companyServiceClient.InitCompanyInfo(
    {
      companyId,
      accessKey,
    },
    (err, result) => {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log(result);
    }
  );
}

export async function _getGRPCServer() {
  // GRPC SERVER SETUP
  grpcServer.addService(grpcPackage.TradeService.service, {
    CreateTrade: async (req, res) => {
      try {
        const dto = initializeTradeSchema.parse(req.request);
        console.log(dto);

        const response = await initializeTradeService(dto);

        res(null, { success: true, tradeId: response.id, trade: response });
      } catch (err: any) {
        console.error(err);
        return grpcErrorHandler(res, err);
      }
    },
    UpdateTradeItems: async (req, res) => {
      try {
        const dto = updateTradeItemsSchema.parse(req.request);
        console.log(dto);

        const response = await updateTradeItemsService(dto);

        res(null, { success: true, tradeId: response.id, trade: response });
      } catch (err: any) {
        console.error(err);
        return grpcErrorHandler(res, err);
      }
    },
    AcceptTrade: async (req, res) => {
      try {
        const dto = updateTradeStatusSchema.parse(req.request);
        console.log(dto);

        const response = await acceptTradeService(dto);

        if (!response.transactions.success) throw new CustomError("Trade Error", "Trade Failed", 500);

        const serializedTransactions = response.transactions;
        const trade = response.acceptedTrade;

        // make a key value map

        // Returns a map of transactions for each participant of a trade
        const transactionsMap = {
          [trade.tradeCreatorAddress]: serializedTransactions.transactions.tradeCreatorTransation,
          [trade.tradeRecipientAddress]: serializedTransactions.transactions.tradeRecipientTransaction,
        };

        res(null, { success: true, tradeId: dto.tradeId, serializedTransactions: transactionsMap, trade: trade });
      } catch (err: any) {
        console.error(err);
        return grpcErrorHandler(res, err);
      }
    },
    RejectTrade: async (req, res) => {
      try {
        const dto = updateTradeStatusSchema.parse(req.request);
        console.log(dto);

        const response = await rejectTradeService(dto);

        res(null, { success: true, tradeId: response.id, trade: response });
      } catch (err: any) {
        console.error(err);
        return grpcErrorHandler(res, err);
      }
    },
    CancleTrade: async (req, res) => {
      try {
        const dto = updateTradeStatusSchema.parse(req.request);
        console.log(dto);

        const response = await cancleTradeService(dto);

        res(null, { success: true, tradeId: response.id, trade: response });
      } catch (err: any) {
        console.error(err);
        return grpcErrorHandler(res, err);
      }
    },
  } as TradeServiceHandlers);

  return grpcServer;
}
