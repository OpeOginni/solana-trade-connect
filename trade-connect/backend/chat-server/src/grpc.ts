import dotenv from "dotenv";
import { getGrpcClient, getGrpcServer } from "../../grpc/dist";
import { InitializeTradeDto, initializeTradeSchema } from "./types/trade.types";
import { CompanyServiceHandlers } from "../../grpc/dist/proto/chat_main/CompanyService";
import { saveCompanySchema } from "./types/company.types";
import { initializeCompany } from "./controllers/websocket.controller";

const { server: grpcServer, grpc, grpcPackage } = getGrpcServer();

dotenv.config();

const MAIN_GRPC_PORT = parseInt(process.env.GRPC_PORT || "8080");

const MAIN_GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

const grpcClient = getGrpcClient(MAIN_GRPC_HOST, MAIN_GRPC_PORT);

export async function createTrade(dto: InitializeTradeDto) {
  grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log(result);
  });
}

export async function getGRPCServer() {
  // GRPC SERVER SETUP
  grpcServer.addService(grpcPackage.CompanyService.service, {
    InitCompanyInfo: async (req, res) => {
      const dto = saveCompanySchema.parse(req.request);
      console.log(dto);
      await initializeCompany(dto);

      console.log("Has Created the Company Info to Redis");
      res(null, { success: true });
    },
  } as CompanyServiceHandlers);

  return grpcServer;
}
