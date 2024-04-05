// Original file: src/proto/grpcServices.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateTradeRequest as _chat_main_CreateTradeRequest, CreateTradeRequest__Output as _chat_main_CreateTradeRequest__Output } from '../chat_main/CreateTradeRequest';
import type { CreateTradeResponse as _chat_main_CreateTradeResponse, CreateTradeResponse__Output as _chat_main_CreateTradeResponse__Output } from '../chat_main/CreateTradeResponse';
import type { SignedDepositTransactionRequest as _chat_main_SignedDepositTransactionRequest, SignedDepositTransactionRequest__Output as _chat_main_SignedDepositTransactionRequest__Output } from '../chat_main/SignedDepositTransactionRequest';
import type { SignedDepositTransactionResponse as _chat_main_SignedDepositTransactionResponse, SignedDepositTransactionResponse__Output as _chat_main_SignedDepositTransactionResponse__Output } from '../chat_main/SignedDepositTransactionResponse';
import type { UpdateTradeItemsRequest as _chat_main_UpdateTradeItemsRequest, UpdateTradeItemsRequest__Output as _chat_main_UpdateTradeItemsRequest__Output } from '../chat_main/UpdateTradeItemsRequest';
import type { UpdateTradeItemsResponse as _chat_main_UpdateTradeItemsResponse, UpdateTradeItemsResponse__Output as _chat_main_UpdateTradeItemsResponse__Output } from '../chat_main/UpdateTradeItemsResponse';
import type { UpdateTradeStatusRequest as _chat_main_UpdateTradeStatusRequest, UpdateTradeStatusRequest__Output as _chat_main_UpdateTradeStatusRequest__Output } from '../chat_main/UpdateTradeStatusRequest';
import type { UpdateTradeStatusResponse as _chat_main_UpdateTradeStatusResponse, UpdateTradeStatusResponse__Output as _chat_main_UpdateTradeStatusResponse__Output } from '../chat_main/UpdateTradeStatusResponse';

export interface TradeServiceClient extends grpc.Client {
  AcceptTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  AcceptTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  AcceptTrade(argument: _chat_main_UpdateTradeStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  AcceptTrade(argument: _chat_main_UpdateTradeStatusRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  acceptTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  acceptTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  acceptTrade(argument: _chat_main_UpdateTradeStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  acceptTrade(argument: _chat_main_UpdateTradeStatusRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  
  CancleTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  CancleTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  CancleTrade(argument: _chat_main_UpdateTradeStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  CancleTrade(argument: _chat_main_UpdateTradeStatusRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  cancleTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  cancleTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  cancleTrade(argument: _chat_main_UpdateTradeStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  cancleTrade(argument: _chat_main_UpdateTradeStatusRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  
  CreateTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  CreateTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  CreateTrade(argument: _chat_main_CreateTradeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  CreateTrade(argument: _chat_main_CreateTradeRequest, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  createTrade(argument: _chat_main_CreateTradeRequest, callback: grpc.requestCallback<_chat_main_CreateTradeResponse__Output>): grpc.ClientUnaryCall;
  
  RejectTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  RejectTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  RejectTrade(argument: _chat_main_UpdateTradeStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  RejectTrade(argument: _chat_main_UpdateTradeStatusRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  rejectTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  rejectTrade(argument: _chat_main_UpdateTradeStatusRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  rejectTrade(argument: _chat_main_UpdateTradeStatusRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  rejectTrade(argument: _chat_main_UpdateTradeStatusRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeStatusResponse__Output>): grpc.ClientUnaryCall;
  
  SignedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  SignedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  SignedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  SignedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  signedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  signedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  signedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  signedDepositTransaction(argument: _chat_main_SignedDepositTransactionRequest, callback: grpc.requestCallback<_chat_main_SignedDepositTransactionResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  UpdateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  UpdateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  UpdateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  updateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  updateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  updateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  updateTradeItems(argument: _chat_main_UpdateTradeItemsRequest, callback: grpc.requestCallback<_chat_main_UpdateTradeItemsResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface TradeServiceHandlers extends grpc.UntypedServiceImplementation {
  AcceptTrade: grpc.handleUnaryCall<_chat_main_UpdateTradeStatusRequest__Output, _chat_main_UpdateTradeStatusResponse>;
  
  CancleTrade: grpc.handleUnaryCall<_chat_main_UpdateTradeStatusRequest__Output, _chat_main_UpdateTradeStatusResponse>;
  
  CreateTrade: grpc.handleUnaryCall<_chat_main_CreateTradeRequest__Output, _chat_main_CreateTradeResponse>;
  
  RejectTrade: grpc.handleUnaryCall<_chat_main_UpdateTradeStatusRequest__Output, _chat_main_UpdateTradeStatusResponse>;
  
  SignedDepositTransaction: grpc.handleUnaryCall<_chat_main_SignedDepositTransactionRequest__Output, _chat_main_SignedDepositTransactionResponse>;
  
  UpdateTradeItems: grpc.handleUnaryCall<_chat_main_UpdateTradeItemsRequest__Output, _chat_main_UpdateTradeItemsResponse>;
  
}

export interface TradeServiceDefinition extends grpc.ServiceDefinition {
  AcceptTrade: MethodDefinition<_chat_main_UpdateTradeStatusRequest, _chat_main_UpdateTradeStatusResponse, _chat_main_UpdateTradeStatusRequest__Output, _chat_main_UpdateTradeStatusResponse__Output>
  CancleTrade: MethodDefinition<_chat_main_UpdateTradeStatusRequest, _chat_main_UpdateTradeStatusResponse, _chat_main_UpdateTradeStatusRequest__Output, _chat_main_UpdateTradeStatusResponse__Output>
  CreateTrade: MethodDefinition<_chat_main_CreateTradeRequest, _chat_main_CreateTradeResponse, _chat_main_CreateTradeRequest__Output, _chat_main_CreateTradeResponse__Output>
  RejectTrade: MethodDefinition<_chat_main_UpdateTradeStatusRequest, _chat_main_UpdateTradeStatusResponse, _chat_main_UpdateTradeStatusRequest__Output, _chat_main_UpdateTradeStatusResponse__Output>
  SignedDepositTransaction: MethodDefinition<_chat_main_SignedDepositTransactionRequest, _chat_main_SignedDepositTransactionResponse, _chat_main_SignedDepositTransactionRequest__Output, _chat_main_SignedDepositTransactionResponse__Output>
  UpdateTradeItems: MethodDefinition<_chat_main_UpdateTradeItemsRequest, _chat_main_UpdateTradeItemsResponse, _chat_main_UpdateTradeItemsRequest__Output, _chat_main_UpdateTradeItemsResponse__Output>
}
