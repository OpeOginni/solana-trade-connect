import dotenv from "dotenv";

import buildRestServer from "./app";
import { getGrpcServer } from "../../grpc/dist";
import { TradeServiceHandlers } from "../../grpc/dist/proto/chat_main/TradeService";
import { initializeTradeSchema } from "./types/trade.types";

dotenv.config();

const { server: grpcServer, grpc, grpcPackage } = getGrpcServer();

const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || "0.0.0.0";

const GRPC_PORT = parseInt(process.env.GRPC_PORT || "8080");
const GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

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
} as TradeServiceHandlers);

async function main() {
  const app = await buildRestServer();

  try {
    app.listen(PORT, HOST, () => {
      console.log(`Main Server started at http://${HOST}:${PORT}`);
    });

    grpcServer.bindAsync(`${GRPC_HOST}:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        throw err;
      }
      console.log(`Main gRPC server started on ${GRPC_HOST}:${GRPC_PORT}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
