import { getGrpcServer } from "../../../grpc/dist";
import { TradeServiceHandlers } from "../../../grpc/dist/proto/chat_main/TradeService";
import { initializeTradeSchema } from "../types/trade.types";

const { server, grpcPackage, grpc } = getGrpcServer();

server.addService(grpcPackage.TradeService.service, {
  CreateTrade: (req, res) => {
    const dto = initializeTradeSchema.parse(req.request);
    console.log(dto);

    console.log("CALLED Create Trade");
    console.log("CREATING THE TRADE");
    res(null, { success: true });
    // console.log(req, res);
  },
} as TradeServiceHandlers);

export default { server, grpc };
