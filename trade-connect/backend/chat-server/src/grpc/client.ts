import dotenv from "dotenv";
import { getGrpcClient } from "../../../grpc/dist";
import { InitializeTradeDto } from "../types/trade.types";

dotenv.config();

const GRPC_PORT = parseInt(process.env.GRPC_PORT || "8082");
const GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

const grpcClient = getGrpcClient(GRPC_HOST, GRPC_PORT);

export async function createTrade(dto: InitializeTradeDto) {
  grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log(result);
  });
}

// export async function updateTrade(dto: InitializeTradeDto) {
//   grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
//     if (err) {
//       console.error(err);
//       throw err;
//     }
//     console.log(result);
//   });
// }

// export async function acceptTrade(dto: InitializeTradeDto) {
//   grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
//     if (err) {
//       console.error(err);
//       throw err;
//     }
//     console.log(result);
//   });
// }

// export async function declineTrade(dto: InitializeTradeDto) {
//   grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
//     if (err) {
//       console.error(err);
//       throw err;
//     }
//     console.log(result);
//   });
// }

// export async function cancleTrade(dto: InitializeTradeDto) {
//   grpcClient.tradeServiceClient.CreateTrade(dto, (err, result) => {
//     if (err) {
//       console.error(err);
//       throw err;
//     }
//     console.log(result);
//   });
// }
