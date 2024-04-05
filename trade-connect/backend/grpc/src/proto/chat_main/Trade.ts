// Original file: src/proto/grpcServices.proto


export interface Trade {
  'id'?: (string);
  'tradeCreatorAddress'?: (string);
  'tradeCreatorSwapItems'?: (string)[];
  'tradeRecipientAddress'?: (string);
  'tradeRecipientSwapItems'?: (string)[];
  'lastUpdatedBy'?: (string);
  'status'?: (string);
}

export interface Trade__Output {
  'id'?: (string);
  'tradeCreatorAddress'?: (string);
  'tradeCreatorSwapItems'?: (string)[];
  'tradeRecipientAddress'?: (string);
  'tradeRecipientSwapItems'?: (string)[];
  'lastUpdatedBy'?: (string);
  'status'?: (string);
}
