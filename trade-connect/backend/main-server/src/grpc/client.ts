import dotenv from "dotenv";
import { getGrpcClient } from "../../../grpc/dist";

dotenv.config();

const GRPC_PORT = parseInt(process.env.GRPC_PORT || "8082");

const GRPC_HOST = process.env.GRPC_HOST || "0.0.0.0";

const grpcClient = getGrpcClient(GRPC_HOST, GRPC_PORT);

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
