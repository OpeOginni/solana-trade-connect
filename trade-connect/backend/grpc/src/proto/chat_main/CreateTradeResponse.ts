// Original file: src/proto/grpcServices.proto

import type { Trade as _chat_main_Trade, Trade__Output as _chat_main_Trade__Output } from '../chat_main/Trade';

export interface CreateTradeResponse {
  'success'?: (boolean);
  'tradeId'?: (string);
  'trade'?: (_chat_main_Trade | null);
}

export interface CreateTradeResponse__Output {
  'success'?: (boolean);
  'tradeId'?: (string);
  'trade'?: (_chat_main_Trade__Output);
}
