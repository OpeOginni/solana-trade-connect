export type TransactionChannelDto = {
  companyId: string;
  serializedTransaction: string;
  otherTraderAddress: string;
};

export type NewMessageDto = {
  message: string;
  fromAddress: string;
  toAddress: string;
  timestamp: string;
  isTrade: boolean;
  tradeDetails?: {
    status: string;
    tradeCreatorAddress: string;
    tradeCreatorSwapItems: string[];
    tradeRecipientAddress: string;
    tradeRecipientSwapItems: string[];
    lastUpdatedBy: string;
  };
};
