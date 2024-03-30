import { status } from "@grpc/grpc-js";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, setProvider, Program } from "@project-serum/anchor";

import db from "../db";
import CustomError from "../lib/customError";
import { TradeStatus } from "../types/enums";
import { InitializeTradeDto, UpdateTradeItemsDto, UpdateTradeStatusDto } from "../types/trade.types";
import { Trade } from "@prisma/client";

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

  const transactions = await acceptTradeSolanaService(trade)

  return {acceptedTrade, transactions};
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
  const adminWallet = Keypair.fromSecretKey(Buffer.from(process.env.SOLANA_ADMIN_PRIVATE_KEY!, "base64"));

  const connection = new Connection(process.env.SOLANA_DEVNET_RPC_URL!, "confirmed");

  setProvider(AnchorProvider.env());

  const idl = require("../lib/idl.json");
  const programId = new PublicKey(process.env.SOLANA_PROGRAM_ID!);

  const program = new Program(idl, programId);

  await program.methods?.init()?.rpc?.();

  const tradeCreatorAddress = trade.tradeCreatorAddress;
  const tradeRecipientAddress = trade.tradeRecipientAddress;

  return {
    success: true,
    transactions: {
      tradeCreatorTransation: "",
      tradeRecipientTransaction: "",
    },
  };
}
