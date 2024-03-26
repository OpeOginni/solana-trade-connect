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
import { NewMessageInputDto } from "../types/chat.types";

export async function createTrade(socket: Socket, newTrade: InitializeTradeDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  newTrade.companyId = companyId;
  newTrade.tradeCreatorAddress = userAddress;
  const trade = initializeTradeSchema.parse(newTrade);

  const response = await createTradeGRPC(trade);

  const newMessage: NewMessageInputDto = {
    fromAddress: trade.tradeCreatorAddress,
    toAddress: trade.tradeRecipientAddress,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, newMessage);
}

export async function updateTrade(socket: Socket, updatedItems: UpdateTradeItemsDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;
  const update = updateTradeItemsSchema.parse(updatedItems);

  const response = await updateTradeItemsGRPC(update);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, newMessage);
}

export async function acceptTrade(socket: Socket, updatedItems: UpdateTradeStatusDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;
  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await acceptTradeGRPC(update);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, newMessage);
}

export async function rejectTrade(socket: Socket, updatedItems: UpdateTradeStatusDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;

  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await rejectTradeGRPC(update);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, newMessage);
}

export async function cancleTrade(socket: Socket, updatedItems: UpdateTradeStatusDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;
  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await cancleTradeGRPC(update);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
  };

  await sendMessage(socket, newMessage);
}
