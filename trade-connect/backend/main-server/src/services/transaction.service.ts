import { Instruction } from "@project-serum/anchor";
import { Blockhash, PublicKey, Transaction } from "@solana/web3.js";
import { toSerializedTransactionDTO } from "../lib/transactionConverter";
import { SerializedTransactionDTO } from "../types/transaction.types";

export async function createTransactionToTradeItems(feePayer: PublicKey, tradeId: string, tradeItems: string[]): Promise<SerializedTransactionDTO> {
  // Get the instruction from the anchor program
  // get achor program, etc

  let userTradeInstruction: Instruction;
  let latestBlockhash: Blockhash;

  const transaction = new Transaction();

  // const latestBlockhash = await this.anchorService.anchorProvider.connection.getLatestBlockhash("finalized").catch((e) => rethrowRpcError(e));

  transaction.feePayer = feePayer;
  transaction.recentBlockhash = latestBlockhash;
  transaction.add(userTradeInstruction);

  return toSerializedTransactionDTO(transaction);
}

// https://github.com/serejke/solana-place/blob/9cdd214daa0759afb585c03d3a75af750ef89298/server/src/service/TransactionBuilderService.ts#L20
