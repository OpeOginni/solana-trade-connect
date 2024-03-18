import dotenv from "dotenv";
import buildServer from "./app";
import { getGrpcServer } from "../../grpc/dist";
import { CompanyServiceHandlers } from "../../grpc/dist/proto/chat_main/CompanyService";
import { saveCompanySchema } from "./types/company.types";

dotenv.config();

const { server: grpcServer, grpc, grpcPackage } = getGrpcServer();

const PORT = parseInt(process.env.PORT || "3001");
const HOST = process.env.HOST || "0.0.0.0";

const GRPC_PORT = parseInt(process.env.GRPC_PORT || "8081");
const GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

// GRPC SERVER SETUP
grpcServer.addService(grpcPackage.CompanyService.service, {
  InitCompanyInfo: (req, res) => {
    const dto = saveCompanySchema.parse(req.request);
    console.log(dto);

    console.log("CALLED Init Company Function");
    console.log("Has Created the Company Info to Redis");
    res(null, { success: true });
  },
} as CompanyServiceHandlers);

async function main() {
  const app = await buildServer();

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
