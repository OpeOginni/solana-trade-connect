import dotenv from "dotenv";

import { getGrpcClient, getGrpcServer } from "../../grpc/dist";
import { CreateTradeResponse__Output } from "../../grpc/dist/proto/chat_main/CreateTradeResponse";
import { UpdateTradeItemsResponse__Output } from "../../grpc/dist/proto/chat_main/UpdateTradeItemsResponse";
import { UpdateTradeStatusResponse__Output } from "../../grpc/dist/proto/chat_main/UpdateTradeStatusResponse";
import { CompanyServiceHandlers } from "../../grpc/dist/proto/chat_main/CompanyService";

import { InitializeTradeDto, UpdateTradeItemsDto, UpdateTradeStatusDto } from "./types/trade.types";
import { saveCompanySchema } from "./types/company.types";
import { initializeCompany } from "./websocket/messages.websocket";

const { server: grpcServer, grpc, grpcPackage } = getGrpcServer();

dotenv.config();

const MAIN_GRPC_PORT = parseInt(process.env.GRPC_PORT || "8080");

const MAIN_GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

const grpcClient = getGrpcClient(MAIN_GRPC_HOST, MAIN_GRPC_PORT);

export async function createTradeGRPC(dto: InitializeTradeDto): Promise<CreateTradeResponse__Output> {
  return new Promise((resolve, reject) => {
    grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else if (!result) {
        reject(new Error("Result is undefined"));
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

export async function updateTradeItemsGRPC(dto: UpdateTradeItemsDto): Promise<UpdateTradeItemsResponse__Output> {
  return new Promise((resolve, reject) => {
    grpcClient.tradeServiceClient.UpdateTradeItems(dto, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else if (!result) {
        reject(new Error("Result is undefined"));
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

export async function acceptTradeGRPC(dto: UpdateTradeStatusDto): Promise<UpdateTradeStatusResponse__Output> {
  return new Promise((resolve, reject) => {
    grpcClient.tradeServiceClient.AcceptTrade(dto, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else if (!result) {
        reject(new Error("Result is undefined"));
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

export async function rejectTradeGRPC(dto: UpdateTradeStatusDto): Promise<UpdateTradeStatusResponse__Output> {
  return new Promise((resolve, reject) => {
    grpcClient.tradeServiceClient.RejectTrade(dto, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else if (!result) {
        reject(new Error("Result is undefined"));
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

export async function cancleTradeGRPC(dto: UpdateTradeStatusDto): Promise<UpdateTradeStatusResponse__Output> {
  return new Promise((resolve, reject) => {
    grpcClient.tradeServiceClient.CancleTrade(dto, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else if (!result) {
        reject(new Error("Result is undefined"));
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

export async function _getGRPCServer() {
  // GRPC SERVER SETUP
  grpcServer.addService(grpcPackage.CompanyService.service, {
    InitCompanyInfo: async (req, res) => {
      try {
        const dto = saveCompanySchema.parse(req.request);
        console.log(dto);

        await initializeCompany(dto);

        res(null, { success: true });
      } catch (err: any) {
        console.error(err);
        res(err, null);
      }
    },
  } as CompanyServiceHandlers);

  return grpcServer;
}
