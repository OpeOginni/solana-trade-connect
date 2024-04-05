import { Instruction, web3 } from "@project-serum/anchor";
import { Blockhash, PublicKey, Transaction } from "@solana/web3.js";
import { toSerializedTransactionDTO } from "../lib/transactionConverter";
import { SerializedTransactionDTO } from "../types/transaction.types";
import { program, adminWallet } from "../anchor";
import { IAssociatedTokenAccounts, ata_to_remaining_accounts, create_mutiple_associated_token_accounts } from "../anchor/utils";
import { Account, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import CustomError from "../lib/customError";
import { Trade } from "@prisma/client";
import db from "../db";

export async function createTransactionToTradeItems(
  traderPublicKey: PublicKey,
  tradeId: string,
  tradeItems: PublicKey[]
): Promise<SerializedTransactionDTO> {
  // Get the instruction from the anchor program
  // get achor program, etc

  const [escrowPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("escrow"), Buffer.from(tradeId)], program.programId);

  const [trader_state] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-state"), Buffer.from(tradeId), traderPublicKey.toBuffer()],
    program.programId
  );

  let ata_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeItems,
    owner: traderPublicKey,
  };

  const trader_ata: Account[] = await create_mutiple_associated_token_accounts(ata_params);

  let vault_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeItems,
    owner: adminWallet.publicKey,
  };

  const vaults_ata = await create_mutiple_associated_token_accounts(vault_params);

  if (!program.methods) throw new CustomError("Program not initialized", "Program not initialized", 500);
  if (!program.methods.depositIndividual) throw new CustomError("Method not found", "Method not found", 500);

  let userTradeInstruction = await program.methods
    ?.depositIndividual(tradeId)
    .accounts({
      admin: adminWallet.publicKey,
      initializer: traderPublicKey,
      mint: tradeItems[0],
      escrowAccount: escrowPda,
      traderState: trader_state,
      vaultAta: vaults_ata[0]!.address,
      initializerAta: trader_ata[0]!.address,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction()
    .catch((e) => {
      throw new CustomError("Error creating instruction", e, 500);
    });

  let latestBlockhash = await program.provider.connection.getLatestBlockhash("finalized").catch((e) => {
    throw new CustomError("Error Getting Latest Blockhash", e, 500);
  });

  const transaction = new Transaction();

  transaction.feePayer = adminWallet.publicKey;
  transaction.sign(adminWallet.payer);

  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.add(userTradeInstruction);

  return toSerializedTransactionDTO(transaction);
}
// https://github.com/serejke/solana-place/blob/9cdd214daa0759afb585c03d3a75af750ef89298/server/src/service/TransactionBuilderService.ts#L20

// THis gets sent everytime you get the SINGED TRANSACTION webhook from front end, telling us that a users
// has completely signed the trasnaction we sent previously
export async function updateDepositState(tradeId: string, addressThatSigned: string) {
  const trade = await db.trade.findFirst({
    where: {
      AND: [
        {
          id: tradeId,
        },
        {
          OR: [
            {
              tradeCreatorAddress: { contains: addressThatSigned },
            },
            {
              tradeRecipientAddress: { contains: addressThatSigned },
            },
          ],
        },
      ],
    },
  });

  if (!trade) throw new CustomError("Trade not found", "Trade not found", 404);

  const tradeCreatorSwapItemsPublicKeys = trade.tradeCreatorSwapItems.map((item) => new PublicKey(item));
  const tradeRecipientSwapItemsPublicKeys = trade.tradeRecipientSwapItems.map((item) => new PublicKey(item));

  const tradeCreatorPublicKey = new PublicKey(trade.tradeCreatorAddress);

  const tradeRecipientPublicKey = new PublicKey(trade.tradeRecipientAddress);

  const [trade_creator_state] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-state"), Buffer.from(tradeId), tradeCreatorPublicKey.toBuffer()],
    program.programId
  );

  const [trade_recipient_state] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-state"), Buffer.from(tradeId), tradeRecipientPublicKey.toBuffer()],
    program.programId
  );

  const [escrowPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("escrow"), Buffer.from(tradeId)], program.programId);

  if (!program.methods) throw new CustomError("Program not initialized", "Program not initialized", 500);
  if (!program.methods.updateTraderDepositStatus) throw new CustomError("Method not found", "Method not found", 500);

  let trade_creator_vault_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeCreatorSwapItemsPublicKeys,
    owner: adminWallet.publicKey,
  };

  const trade_creator_vaults_ata = await create_mutiple_associated_token_accounts(trade_creator_vault_params);
  const trade_creator_remaining_accounts = await ata_to_remaining_accounts(trade_creator_vaults_ata);

  // You have to update the status of both the trade creator and the trade recipient in both ways as each in the
  // depositor state and withdraw statee
  await program.methods
    .updateTraderDepositStatus(tradeId, tradeCreatorPublicKey, tradeRecipientPublicKey)
    .accounts({
      payer: adminWallet.publicKey,
      escrowAccount: escrowPda,
      depositorState: trade_creator_state,
      withdrawerState: trade_recipient_state,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([adminWallet.payer])
    .remainingAccounts(trade_creator_remaining_accounts)
    .rpc()
    .catch((e) => {
      throw new CustomError("Error Updating Trader Deposit Status", e, 500);
    });

  // Thats why we run it twice

  let trade_recipient_vault_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeRecipientSwapItemsPublicKeys,
    owner: adminWallet.publicKey,
  };

  const trade_recipient_vaults_ata = await create_mutiple_associated_token_accounts(trade_recipient_vault_params);
  const trade_recipient_remaining_accounts = await ata_to_remaining_accounts(trade_recipient_vaults_ata);

  await program.methods
    .updateTraderDepositStatus(tradeId, tradeRecipientPublicKey, tradeCreatorPublicKey)
    .accounts({
      payer: adminWallet.publicKey,
      escrowAccount: escrowPda,
      depositorState: trade_recipient_state,
      withdrawerState: trade_creator_state,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([adminWallet.payer])
    .remainingAccounts(trade_recipient_remaining_accounts)
    .rpc()
    .catch((e) => {
      throw new CustomError("Error Updating Trader Deposit Status", e, 500);
    });

  if (addressThatSigned === trade.tradeCreatorAddress) {
    await db.trade.update({
      where: {
        id: tradeId,
      },
      data: {
        creatorDeposited: true,
      },
    });
  } else if (addressThatSigned === trade.tradeRecipientAddress) {
    await db.trade.update({
      where: {
        id: tradeId,
      },
      data: {
        recipientDeposited: true,
      },
    });
  }

  if (!program.account.escrow) throw new CustomError("Program not initialized", "Program not initialized", 500);

  const escrowState = await program.account.escrow.fetch(escrowPda);
  console.log("escrow state");
  console.log(escrowState);

  if (escrowState.escrowState.hasOwnProperty("deposited") === true) {
    await withdrawEscrow(tradeId, trade, tradeCreatorSwapItemsPublicKeys, tradeRecipientSwapItemsPublicKeys);
  }

  // const fecthedTrade = await db.trade.findUnique({
  //   where: {
  //     id: tradeId,
  //   },
  // });

  // if (!fecthedTrade) throw new CustomError("Trade not found", "Trade not found", 404);

  // if (fecthedTrade.creatorDeposited && fecthedTrade.recipientDeposited) {
  //   await withdrawEscrow(tradeId, trade, tradeCreatorSwapItems, tradeRecipientSwapItems);
  // }

  return { success: true };
}

export async function withdrawEscrow(tradeId: string, trade: Trade, tradeCreatorSwapItems: PublicKey[], tradeRecipientSwapItems: PublicKey[]) {
  const [escrowPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("escrow"), Buffer.from(tradeId)], program.programId);

  const tradeCreatorPublicKey = new PublicKey(trade.tradeCreatorAddress);

  const tradeRecipientPublicKey = new PublicKey(trade.tradeRecipientAddress);

  const [trade_creator_state] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-state"), Buffer.from(tradeId), tradeCreatorPublicKey.toBuffer()],
    program.programId
  );

  const [trade_recipient_state] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-state"), Buffer.from(tradeId), tradeRecipientPublicKey.toBuffer()],
    program.programId
  );

  let recipient_ata_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeRecipientSwapItems,
    owner: new PublicKey(trade.tradeRecipientAddress),
  };

  const recipient_ata: Account[] = await create_mutiple_associated_token_accounts(recipient_ata_params);

  let creator_ata_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeCreatorSwapItems,
    owner: new PublicKey(trade.tradeCreatorAddress),
  };

  const creator_ata: Account[] = await create_mutiple_associated_token_accounts(creator_ata_params);

  let creator_vault_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeCreatorSwapItems,
    owner: adminWallet.publicKey,
  };

  const creator_vaults_ata = await create_mutiple_associated_token_accounts(creator_vault_params);

  let recipient_vault_params: IAssociatedTokenAccounts = {
    connection: program.provider.connection,
    payer: adminWallet.payer,
    mint_accounts: tradeRecipientSwapItems,
    owner: adminWallet.publicKey,
  };

  const recipient_vaults_ata = await create_mutiple_associated_token_accounts(recipient_vault_params);

  if (!program.methods) throw new CustomError("Program not initialized", "Program not initialized", 500);
  if (!program.methods.withdrawIndividual) throw new CustomError("Method not found", "Method not found", 500);

  await program.methods
    .withdrawIndividual(tradeId)
    .accounts({
      admin: adminWallet.publicKey,
      initializer: new PublicKey(trade.tradeCreatorAddress),
      mint: tradeRecipientSwapItems[0],
      escrowAccount: escrowPda,
      traderState: trade_creator_state,
      vaultAta: recipient_vaults_ata[0]!.address,
      initializerAta: creator_ata[0]!.address,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([adminWallet.payer])
    .rpc()
    .catch((e) => {
      throw new CustomError("Error Withdrawing", e, 500);
    });

  await program.methods
    .withdrawIndividual(tradeId)
    .accounts({
      admin: adminWallet.publicKey,
      initializer: new PublicKey(trade.tradeRecipientAddress),
      mint: tradeCreatorSwapItems[0],
      escrowAccount: escrowPda,
      traderState: trade_recipient_state,
      vaultAta: creator_vaults_ata[0]!.address,
      initializerAta: recipient_ata[0]!.address,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([adminWallet.payer])
    .rpc()
    .catch((e) => {
      throw new CustomError("Error Withdrawing", e, 500);
    });

  return { success: true };
}
