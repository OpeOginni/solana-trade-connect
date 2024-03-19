// Original file: src/proto/grpcServices.proto


export interface UpdateTradeItemsRequest {
  'tradeId'?: (string);
  'updaterAddress'?: (string);
  'tradeCreatorSwapItems'?: (string)[];
  'tradeRecipientSwapItems'?: (string)[];
}

export interface UpdateTradeItemsRequest__Output {
  'tradeId'?: (string);
  'updaterAddress'?: (string);
  'tradeCreatorSwapItems'?: (string)[];
  'tradeRecipientSwapItems'?: (string)[];
}
