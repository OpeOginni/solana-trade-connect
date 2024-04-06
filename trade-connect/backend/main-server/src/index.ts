import dotenv from "dotenv";

import buildRestServer from "./app";
import { getGrpcServer } from "../../grpc/dist";
import { _getGRPCServer } from "./grpc";

dotenv.config();

const { grpc } = getGrpcServer();

const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || "0.0.0.0";

const GRPC_PORT = parseInt(process.env.GRPC_PORT || "8080");
const GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

// GRPC SERVER SETUP

const SERVER_TYPE = process.env.SERVER_TYPE;

async function main() {
  const app = await buildRestServer();
  const grpcServer = await _getGRPCServer();

  try {
    if (SERVER_TYPE === "HTTP") {
      app.listen(PORT, HOST, () => {
        console.log(`Main Server started at http://${HOST}:${PORT}`);
      });
    } else if (SERVER_TYPE === "GRPC") {
      grpcServer.bindAsync(`${GRPC_HOST}:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
          throw err;
        }
        console.log(`Main gRPC server started on ${GRPC_HOST}:${GRPC_PORT}`);
      });
    } else {
      throw new Error("Invalid Server Type");
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
