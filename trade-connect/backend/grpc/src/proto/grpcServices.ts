import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CompanyServiceClient as _chat_main_CompanyServiceClient, CompanyServiceDefinition as _chat_main_CompanyServiceDefinition } from './chat_main/CompanyService';
import type { TradeServiceClient as _chat_main_TradeServiceClient, TradeServiceDefinition as _chat_main_TradeServiceDefinition } from './chat_main/TradeService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  chat_main: {
    CompanyService: SubtypeConstructor<typeof grpc.Client, _chat_main_CompanyServiceClient> & { service: _chat_main_CompanyServiceDefinition }
    CreateTradeRequest: MessageTypeDefinition
    CreateTradeResponse: MessageTypeDefinition
    InitCompanyInfoRequest: MessageTypeDefinition
    InitCompanyInfoResponse: MessageTypeDefinition
    TradeService: SubtypeConstructor<typeof grpc.Client, _chat_main_TradeServiceClient> & { service: _chat_main_TradeServiceDefinition }
    UpdateTradeItemsRequest: MessageTypeDefinition
    UpdateTradeItemsResponse: MessageTypeDefinition
    UpdateTradeStatusRequest: MessageTypeDefinition
    UpdateTradeStatusResponse: MessageTypeDefinition
  }
}

