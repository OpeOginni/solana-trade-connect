import base58 from "bs58";
import { Transaction } from "@solana/web3.js";
import { SerializedTransactionDTO } from "../types/transaction.types";

export function toSerializedTransactionDTO(transaction: Transaction): SerializedTransactionDTO {
  const base58Buffer = base58.encode(transaction.serializeMessage());
  return { transactionBase58: base58Buffer };
}
