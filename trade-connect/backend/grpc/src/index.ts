import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/grpcServices";
import { CompanyServiceHandlers } from "./proto/chat_main/CompanyService";
import { TradeServiceHandlers } from "./proto/chat_main/TradeService";
const PROTO_FILE = "./proto/grpcServices.proto";

const packageDef = protoLoader.loadSync(path.resolve(__dirname, "../src", PROTO_FILE));
const grpcObj = grpc.loadPackageDefinition(packageDef) as unknown as ProtoGrpcType;
const grpcPackage = grpcObj.chat_main;

export function getGrpcClient(host: string, serverPort: number) {
  const companyServiceClient = new grpcObj.chat_main.CompanyService(`${host}:${serverPort}`, grpc.credentials.createInsecure());

  const tradeServiceClient = new grpcObj.chat_main.TradeService(`${host}:${serverPort}`, grpc.credentials.createInsecure());

  return { companyServiceClient, tradeServiceClient };
}

export function getGrpcServer() {
  const server = new grpc.Server();

  return { server, grpc, grpcPackage };
}
