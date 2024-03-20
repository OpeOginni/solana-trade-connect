// Original file: src/proto/grpcServices.proto


export interface CreateTradeRequest {
  'companyId'?: (string);
  'tradeCreatorAddress'?: (string);
  'tradeCreatorSwapItems'?: (string)[];
  'tradeRecipientAddress'?: (string);
  'tradeRecipientSwapItems'?: (string)[];
}

export interface CreateTradeRequest__Output {
  'companyId'?: (string);
  'tradeCreatorAddress'?: (string);
  'tradeCreatorSwapItems'?: (string)[];
  'tradeRecipientAddress'?: (string);
  'tradeRecipientSwapItems'?: (string)[];
}
