import { status } from "@grpc/grpc-js";

import db from "../db";
import CustomError from "../lib/customError";
import { TradeStatus } from "../types/enums";
import { InitializeTradeDto, UpdateTradeItemsDto, UpdateTradeStatusDto } from "../types/trade.types";

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

  return acceptedTrade;
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
