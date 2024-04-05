import { Socket } from "socket.io";

import {
  InitializeTradeDto,
  TransactionsMap,
  UpdateTradeItemsDto,
  UpdateTradeStatusDto,
  initializeTradeSchema,
  updateTradeItemsSchema,
  updateTradeStatusSchema,
} from "../types/trade.types";
import { acceptTradeGRPC, cancleTradeGRPC, createTradeGRPC, rejectTradeGRPC, updateTradeItemsGRPC } from "../grpc";
import { sendMessage } from "./messages.websocket";
import { NewMessageInputDto } from "../types/chat.types";
import CustomError from "../lib/customError";
import { publisher } from "../redis";
import { USER_TRANSACTION_CHANNEL } from "../redis/channels";

export async function createTrade(socket: Socket, newTrade: InitializeTradeDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  newTrade.companyId = companyId;
  newTrade.tradeCreatorAddress = userAddress;
  const trade = initializeTradeSchema.parse(newTrade);

  const response = await createTradeGRPC(trade);

  if (!response.trade) throw new CustomError("Trade Error", "Trade Not Created", 500);

  const newMessage: NewMessageInputDto = {
    fromAddress: trade.tradeCreatorAddress,
    toAddress: trade.tradeRecipientAddress,
    message: `[TRADE]:${response.tradeId}`,
    isTrade: true,
    tradeDetails: {
      tradeCreatorAddress: response.trade.tradeCreatorAddress!,
      tradeRecipientAddress: response.trade.tradeRecipientAddress!,
      tradeCreatorSwapItems: response.trade.tradeCreatorSwapItems!,
      tradeRecipientSwapItems: response.trade.tradeRecipientSwapItems!,
      lastUpdatedBy: response.trade.lastUpdatedBy!,
      status: response.trade.status!,
    },
  };

  await sendMessage(socket, newMessage);
}

export async function updateTrade(socket: Socket, updatedItems: UpdateTradeItemsDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;
  const update = updateTradeItemsSchema.parse(updatedItems);

  const response = await updateTradeItemsGRPC(update);

  if (!response.trade) throw new CustomError("Trade Error", "Trade Not Created", 500);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
    isTrade: true,
    tradeDetails: {
      tradeCreatorAddress: response.trade.tradeCreatorAddress!,
      tradeRecipientAddress: response.trade.tradeRecipientAddress!,
      tradeCreatorSwapItems: response.trade.tradeCreatorSwapItems!,
      tradeRecipientSwapItems: response.trade.tradeRecipientSwapItems!,
      lastUpdatedBy: response.trade.lastUpdatedBy!,
      status: response.trade.status!,
    },
  };

  await sendMessage(socket, newMessage);
}

export async function acceptTrade(socket: Socket, updatedItems: UpdateTradeStatusDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;
  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await acceptTradeGRPC(update);

  if (!response.trade) throw new CustomError("Trade Error", "Trade Not Created", 500);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
    isTrade: true,
    tradeDetails: {
      tradeCreatorAddress: response.trade.tradeCreatorAddress!,
      tradeRecipientAddress: response.trade.tradeRecipientAddress!,
      tradeCreatorSwapItems: response.trade.tradeCreatorSwapItems!,
      tradeRecipientSwapItems: response.trade.tradeRecipientSwapItems!,
      lastUpdatedBy: response.trade.lastUpdatedBy!,
      status: response.trade.status!,
    },
  };

  // const newTransaction = {
  //   fromAddress: userAddress,
  //   toAddress: response.otherUserAddress!,
  //   message: `[TRANSACTION]:${response.transaction}`,
  // };

  await sendMessage(socket, newMessage);
}

export async function rejectTrade(socket: Socket, updatedItems: UpdateTradeStatusDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;

  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await rejectTradeGRPC(update);

  if (!response.trade) throw new CustomError("Trade Error", "Trade Not Created", 500);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
    isTrade: true,
    tradeDetails: {
      tradeCreatorAddress: response.trade.tradeCreatorAddress!,
      tradeRecipientAddress: response.trade.tradeRecipientAddress!,
      tradeCreatorSwapItems: response.trade.tradeCreatorSwapItems!,
      tradeRecipientSwapItems: response.trade.tradeRecipientSwapItems!,
      lastUpdatedBy: response.trade.lastUpdatedBy!,
      status: response.trade.status!,
    },
  };

  await sendMessage(socket, newMessage);
}

export async function cancleTrade(socket: Socket, updatedItems: UpdateTradeStatusDto) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  updatedItems.updaterAddress = userAddress;
  const update = updateTradeStatusSchema.parse(updatedItems);

  const response = await cancleTradeGRPC(update);

  if (!response.trade) throw new CustomError("Trade Error", "Trade Not Created", 500);

  const newMessage: NewMessageInputDto = {
    fromAddress: userAddress,
    toAddress: response.otherUserAddress!,
    message: `[TRADE]:${response.tradeId}`,
    isTrade: true,
    tradeDetails: {
      tradeCreatorAddress: response.trade.tradeCreatorAddress!,
      tradeRecipientAddress: response.trade.tradeRecipientAddress!,
      tradeCreatorSwapItems: response.trade.tradeCreatorSwapItems!,
      tradeRecipientSwapItems: response.trade.tradeRecipientSwapItems!,
      lastUpdatedBy: response.trade.lastUpdatedBy!,
      status: response.trade.status!,
    },
  };

  await sendMessage(socket, newMessage);
}

export async function sendTransaction(socket: Socket, transactions: TransactionsMap, tradeCreatorAddress: string, tradeRecipientAddress: string) {
  const companyId = socket.data.user.companyId as string;
  const userAddress = socket.data.user.userAddress as string;

  let otherAddress: string = "";

  if (userAddress === tradeCreatorAddress) {
    otherAddress = tradeRecipientAddress;
  } else if (userAddress === tradeRecipientAddress) {
    otherAddress = tradeCreatorAddress;
  }

  const reciever = await publisher.hgetall(`company:${companyId}:user:${otherAddress}`);

  if (!reciever) {
    // Send Message User Doesnt exist
    // Reciever must be an address in that particular company ID
    console.log("User Doesnt Exist");
    throw new CustomError("User Error", "User Doesnt Exist", 404);
  }

  const traderSerializedTransaction = transactions[userAddress];

  const otherTraderSerializedTransaction = transactions[otherAddress];
  // Publish the transaction to the sender and recipient
  await publisher.publish(
    USER_TRANSACTION_CHANNEL(companyId, userAddress),
    JSON.stringify({ companyId, serializedTransaction: traderSerializedTransaction, otherTraderAddress: otherAddress })
  );

  await publisher.publish(
    USER_TRANSACTION_CHANNEL(companyId, otherAddress),
    JSON.stringify({ companyId, serializedTransaction: otherTraderSerializedTransaction, otherTraderAddress: userAddress })
  );
}
