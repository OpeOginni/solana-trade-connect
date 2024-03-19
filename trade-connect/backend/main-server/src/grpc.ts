import dotenv from "dotenv";
import { getGrpcClient, getGrpcServer } from "../../grpc/dist";
import { initializeTradeSchema, updateTradeItemsSchema, updateTradeStatusSchema } from "./types/trade.types";
import { TradeServiceHandlers } from "../../grpc/dist/proto/chat_main/TradeService";

const { server: grpcServer, grpcPackage } = getGrpcServer();

dotenv.config();

const CHAT_GRPC_PORT = parseInt(process.env.CHAT_GRPC_PORT || "8081");

const CHAT_GRPC_HOST = process.env.CHAT_GRPC_HOST || "0.0.0.0";

const grpcClient = getGrpcClient(CHAT_GRPC_HOST, CHAT_GRPC_PORT);

export async function initCompanyInfoGRPC(companyId: string, accessKey: string) {
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
    CreateTrade: (req, res) => {
      const dto = initializeTradeSchema.parse(req.request);
      console.log(dto);

      console.log("CALLED Create Trade");
      console.log("CREATING THE TRADE");
      res(null, { success: true });
      // console.log(req, res);
    },
    UpdateTradeItems: (req, res) => {
      const dto = updateTradeItemsSchema.parse(req.request);
      console.log(dto);

      console.log("CALLED Update Trade");
      console.log("UPDATING THE TRASE");
      // RETURN FLASE SUCCESS IF error occurs
      res(null, { success: true, tradeId: dto.tradeId });
    },
    AcceptTrade: (req, res) => {
      const dto = updateTradeStatusSchema.parse(req.request);
      console.log(dto);

      console.log("CALLED ACCEPT Trade");
      console.log("ACCEPTING THE TRADE");
      // RETURN FLASE SUCCESS IF error occurs
      res(null, { success: true, tradeId: dto.tradeId });
    },
    RejectTrade: (req, res) => {
      const dto = updateTradeStatusSchema.parse(req.request);
      console.log(dto);

      console.log("CALLED Reject Trade");
      console.log("CREATING THE TRADE");
      // RETURN FLASE SUCCESS IF error occurs
      res(null, { success: true });
    },
    CancleTrade: (req, res) => {
      const dto = updateTradeStatusSchema.parse(req.request);
      console.log(dto);

      console.log("CALLED Cancle Trade");
      // RETURN FLASE SUCCESS IF error occurs
      res(null, { success: true });
    },
  } as TradeServiceHandlers);

  return grpcServer;
}
