// Original file: src/proto/grpcServices.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateTradeRequest as _chat_main_CreateTradeRequest, CreateTradeRequest__Output as _chat_main_CreateTradeRequest__Output } from '../chat_main/CreateTradeRequest';
import type { CreateTradeResponse as _chat_main_CreateTradeResponse, CreateTradeResponse__Output as _chat_main_CreateTradeResponse__Output } from '../chat_main/CreateTradeResponse';

export interface TradeServiceClient extends grpc.Client {
  CreateTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  CreateTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  CreateTrade(argument: _chat_main_CreateTradeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  CreateTrade(argument: _chat_main_CreateTradeRequest, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface TradeServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateTrade: grpc.handleUnaryCall<_chat_main_CreateTradeRequest__Output, _chat_main_CreateTradeResponse>;
  
}

export interface TradeServiceDefinition extends grpc.ServiceDefinition {
  CreateTrade: MethodDefinition<_chat_main_CreateTradeRequest, _chat_main_CreateTradeResponse, _chat_main_CreateTradeRequest__Output, _chat_main_CreateTradeResponse__Output>
}
