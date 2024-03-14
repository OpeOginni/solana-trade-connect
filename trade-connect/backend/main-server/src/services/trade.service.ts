import db from "../db";
import CustomError from "../lib/customError";
import { TradeStatus } from "../types/enums";
import {
  AcceptTradeDto,
  InitializeTradeDto,
  UpdateTradeItemsDto,
} from "../types/trade.types";

export async function initializeTradeService(dto: InitializeTradeDto) {
  const newTrade = await db.trade.create({
    data: dto,
  });

  return newTrade;
}

export async function updateTradeItemsService(dto: UpdateTradeItemsDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (
    trade.tradeCreatorAddress !== dto.updaterAddress ||
    trade.tradeRecipientAddress !== dto.updaterAddress
  )
    throw new CustomError(
      "Unauthorized Address",
      "This address cannot edit this trade",
      401
    );

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

export async function acceptTradeService(dto: AcceptTradeDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (
    trade.tradeCreatorAddress !== dto.updaterAddress ||
    trade.tradeRecipientAddress !== dto.updaterAddress
  )
    throw new CustomError(
      "Unauthorized Address",
      "This address cannot edit this trade",
      401
    );

  if (trade.lastUpdatedBy === dto.updaterAddress)
    throw new CustomError(
      "Trade Error",
      "This address cannot accept the Trade",
      401
    );

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

export async function rejectTradeService(dto: AcceptTradeDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (
    trade.tradeCreatorAddress !== dto.updaterAddress ||
    trade.tradeRecipientAddress !== dto.updaterAddress
  )
    throw new CustomError(
      "Unauthorized Address",
      "This address cannot edit this trade",
      401
    );

  // The Rejecter must be the other user
  if (trade.lastUpdatedBy === dto.updaterAddress)
    throw new CustomError(
      "Trade Error",
      "This address cannot reject the Trade",
      401
    );

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

export async function cancleTradeService(dto: AcceptTradeDto) {
  const trade = await db.trade.findUniqueOrThrow({
    where: {
      id: dto.tradeId,
    },
  });

  if (
    trade.tradeCreatorAddress !== dto.updaterAddress ||
    trade.tradeRecipientAddress !== dto.updaterAddress
  )
    throw new CustomError(
      "Unauthorized Address",
      "This address cannot edit this trade",
      401
    );

  // The caller must be the lastUpdated user
  if (trade.lastUpdatedBy !== dto.updaterAddress)
    throw new CustomError(
      "Trade Error",
      "This address cannot cancle the Trade",
      401
    );

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
