import { status } from "@grpc/grpc-js";

import db from "../db";
import CustomError from "../lib/customError";
import { TradeStatus } from "../types/enums";
import { InitializeTradeDto, UpdateTradeItemsDto, UpdateTradeStatusDto } from "../types/trade.types";
import { Trade } from "@prisma/client";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createTransactionToTradeItems } from "./transaction.service";

export async function initializeTradeService(dto: InitializeTradeDto) {
  const newTrade = await db.trade.create({
    data: {
      companyId: dto.companyId,
      tradeCreatorAddress: dto.tradeCreatorAddress,
      tradeCreatorSwapItems: dto.tradeCreatorSwapItems,
      tradeRecipientAddress: dto.tradeRecipientAddress,
      tradeRecipientSwapItems: dto.tradeRecipientSwapItems,
      lastUpdatedBy: dto.tradeCreatorAddress,
    },
  });

  return newTrade;
}

export async function updateTradeItemsService(dto: UpdateTradeItemsDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (trade.tradeCreatorAddress !== dto.updaterAddress || trade.tradeRecipientAddress !== dto.updaterAddress)
    throw new CustomError("Unauthorized Address", "This address cannot edit this trade", status.PERMISSION_DENIED);

  const udatedTrade = await db.trade.update({
    where: {
      id: dto.tradeId,
    },
    data: {
      lastUpdatedBy: dto.updaterAddress,
      tradeCreatorSwapItems: dto.tradeCreatorSwapItems,
      tradeRecipientSwapItems: dto.tradeRecipientSwapItems,
    },
  });

  return udatedTrade;
}

export async function acceptTradeService(dto: UpdateTradeStatusDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (trade.tradeCreatorAddress !== dto.updaterAddress || trade.tradeRecipientAddress !== dto.updaterAddress)
    throw new CustomError("Unauthorized Address", "This address cannot edit this trade", status.PERMISSION_DENIED);

  if (trade.lastUpdatedBy === dto.updaterAddress)
    throw new CustomError("Trade Error", "This address cannot accept the Trade", status.PERMISSION_DENIED);

  const acceptedTrade = await db.trade.update({
    where: {
      id: dto.tradeId,
    },
    data: {
      status: TradeStatus.ACCEPTED,
    },
  });

  const transactions = await acceptTradeSolanaService(trade);

  return { acceptedTrade, transactions };
}

export async function rejectTradeService(dto: UpdateTradeStatusDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (trade.tradeCreatorAddress !== dto.updaterAddress || trade.tradeRecipientAddress !== dto.updaterAddress)
    throw new CustomError("Unauthorized Address", "This address cannot edit this trade", status.PERMISSION_DENIED);

  // The Rejecter must be the other user
  if (trade.lastUpdatedBy === dto.updaterAddress)
    throw new CustomError("Trade Error", "This address cannot reject the Trade", status.PERMISSION_DENIED);

  const rejectedTrade = await db.trade.update({
    where: {
      id: dto.tradeId,
    },
    data: {
      status: TradeStatus.REJECTED,
    },
  });

  return rejectedTrade;
}

export async function cancleTradeService(dto: UpdateTradeStatusDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (trade.tradeCreatorAddress !== dto.updaterAddress || trade.tradeRecipientAddress !== dto.updaterAddress)
    throw new CustomError("Unauthorized Address", "This address cannot edit this trade", status.PERMISSION_DENIED);

  // The caller must be the lastUpdated user
  if (trade.lastUpdatedBy !== dto.updaterAddress)
    throw new CustomError("Trade Error", "This address cannot cancle the Trade", status.PERMISSION_DENIED);

  const cancledTrade = await db.trade.update({
    where: {
      id: dto.tradeId,
    },
    data: {
      status: TradeStatus.CANCELLED,
    },
  });

  return cancledTrade;
}

export async function acceptTradeSolanaService(trade: Trade) {
  const tradeCreatorSwapItemsPublicKeys = trade.tradeCreatorSwapItems.map((item) => new PublicKey(item));
  const tradeRecipientSwapItemsPublicKeys = trade.tradeRecipientSwapItems.map((item) => new PublicKey(item));

  // Create Each User Transaction and send back the encoded base58 transaction
  const tradeCreatorTransation = await createTransactionToTradeItems(
    new PublicKey(trade.tradeCreatorAddress),
    trade.id,
    tradeCreatorSwapItemsPublicKeys
  );

  const tradeRecipientTransaction = await createTransactionToTradeItems(
    new PublicKey(trade.tradeRecipientAddress),
    trade.id,
    tradeRecipientSwapItemsPublicKeys
  );

  return {
    success: true,
    transactions: {
      tradeCreatorTransation: tradeCreatorTransation.transactionBase58,
      tradeRecipientTransaction: tradeRecipientTransaction.transactionBase58,
    },
  };
}
