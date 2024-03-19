import dotenv from "dotenv";
import buildServer from "./app";
import { getGrpcServer } from "../../grpc/dist";
import { CompanyServiceHandlers } from "../../grpc/dist/proto/chat_main/CompanyService";
import { saveCompanySchema } from "./types/company.types";
import { getGRPCServer } from "./grpc";

dotenv.config();

const { server: grpcServer, grpc } = getGrpcServer();

const PORT = parseInt(process.env.PORT || "3001");
const HOST = process.env.HOST || "0.0.0.0";

const GRPC_PORT = parseInt(process.env.GRPC_PORT || "8081");
const GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

async function main() {
  const app = await buildServer();
  const grpcServer = await getGRPCServer();

  try {
    app.listen(PORT, HOST, () => {
      console.log(`Chat Server started at http://${HOST}:${PORT}`);
    });

    grpcServer.bindAsync(`${GRPC_HOST}:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        throw err;
      }
      console.log(`Chat gRPC server started on ${GRPC_HOST}:${GRPC_PORT}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
