// Original file: src/proto/grpcServices.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { InitCompanyInfoRequest as _chat_main_InitCompanyInfoRequest, InitCompanyInfoRequest__Output as _chat_main_InitCompanyInfoRequest__Output } from '../chat_main/InitCompanyInfoRequest';
import type { InitCompanyInfoResponse as _chat_main_InitCompanyInfoResponse, InitCompanyInfoResponse__Output as _chat_main_InitCompanyInfoResponse__Output } from '../chat_main/InitCompanyInfoResponse';

export interface CompanyServiceClient extends grpc.Client {
  InitCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  InitCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  InitCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  InitCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  initCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  initCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  initCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  initCompanyInfo(argument: _chat_main_InitCompanyInfoRequest, callback: grpc.requestCallback<_chat_main_InitCompanyInfoResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface CompanyServiceHandlers extends grpc.UntypedServiceImplementation {
  InitCompanyInfo: grpc.handleUnaryCall<_chat_main_InitCompanyInfoRequest__Output, _chat_main_InitCompanyInfoResponse>;
  
}

export interface CompanyServiceDefinition extends grpc.ServiceDefinition {
  InitCompanyInfo: MethodDefinition<_chat_main_InitCompanyInfoRequest, _chat_main_InitCompanyInfoResponse, _chat_main_InitCompanyInfoRequest__Output, _chat_main_InitCompanyInfoResponse__Output>
}
