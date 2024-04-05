// Original file: src/proto/grpcServices.proto

import type { Trade as _chat_main_Trade, Trade__Output as _chat_main_Trade__Output } from '../chat_main/Trade';

export interface UpdateTradeStatusResponse {
  'success'?: (boolean);
  'tradeId'?: (string);
  'otherUserAddress'?: (string);
  'serializedTransactions'?: ({[key: string]: string});
  'trade'?: (_chat_main_Trade | null);
}

export interface UpdateTradeStatusResponse__Output {
  'success'?: (boolean);
  'tradeId'?: (string);
  'otherUserAddress'?: (string);
  'serializedTransactions'?: ({[key: string]: string});
  'trade'?: (_chat_main_Trade__Output);
}
