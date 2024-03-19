import { Socket } from "socket.io";

import {
  InitializeTradeDto,
  UpdateTradeItemsDto,
  UpdateTradeStatusDto,
  initializeTradeSchema,
  updateTradeItemsSchema,
  updateTradeStatusSchema,
} from "../types/trade.types";
import { acceptTradeGRPC, cancleTradeGRPC, createTradeGRPC, rejectTradeGRPC, updateTradeItemsGRPC } from "../grpc";
import { sendMessage } from "./messages.websocket";
import { NewMessageInputDto } from "../types/message.types";

export async function createTrade(socket: Socket, companyId: string, userAddress: string, newTrade: InitializeTradeDto) {
  newTrade.companyId = companyId;
  newTrade.tradeCreatorAddress = userAddress;
  const trade = initializeTradeSchema.parse(newTrade);

  const response = await createTradeGRPC(trade);

  const newMessage: NewMessageInputDto = {
    toAddress: trade.tradeRecipientAddress,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, companyId, userAddress, newMessage);
}

export async function updateTrade(socket: Socket, companyId: string, userAddress: string, updatedItems: UpdateTradeItemsDto) {
  updatedItems.updaterAddress = userAddress;
  const update = updateTradeItemsSchema.parse(updatedItems);

  const response = await updateTradeItemsGRPC(update);

  const newMessage: NewMessageInputDto = {
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, companyId, update.updaterAddress, newMessage);
}

export async function acceptTrade(socket: Socket, companyId: string, userAddress: string, updatedItems: UpdateTradeStatusDto) {
  updatedItems.updaterAddress = userAddress;
  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await acceptTradeGRPC(update);

  const newMessage: NewMessageInputDto = {
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, companyId, userAddress, newMessage);
}

export async function rejectTrade(socket: Socket, companyId: string, userAddress: string, updatedItems: UpdateTradeStatusDto) {
  updatedItems.updaterAddress = userAddress;

  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await rejectTradeGRPC(update);

  const newMessage: NewMessageInputDto = {
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, companyId, update.updaterAddress, newMessage);
}

export async function cancleTrade(socket: Socket, companyId: string, userAddress: string, updatedItems: UpdateTradeStatusDto) {
  updatedItems.updaterAddress = userAddress;
  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await cancleTradeGRPC(update);

  const newMessage: NewMessageInputDto = {
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, companyId, update.updaterAddress, newMessage);
}
