import { Connection, PublicKey, Signer } from "@solana/web3.js";

import { Account, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

export interface AccountMeta {
  pubkey: PublicKey;
  isWritable: boolean;
  isSigner: boolean;
}

export interface IMintTokenAccount {
  connection: Connection;
  payer: Signer;
  authority: PublicKey;
  freezeAuthority: PublicKey;
}

export interface IAssociatedTokenAccounts {
  connection: Connection;
  payer: Signer;
  mint_accounts: PublicKey[];
  owner: PublicKey;
}

export interface IMintToAta {
  mint_account: PublicKey;
  associated_token_account: Account;
}

export async function create_mutiple_associated_token_accounts(params: IAssociatedTokenAccounts): Promise<Account[]> {
  let mint_accounts = params.mint_accounts;

  let associated_token_accounts = await Promise.all(
    mint_accounts.map(async (account) => {
      return await getOrCreateAssociatedTokenAccount(params.connection, params.payer, account, params.owner, false);
    })
  );

  return associated_token_accounts;
}

export async function coupleMintToAtaInterface(mint_accounts: PublicKey[], associated_token_accounts: Account[]): Promise<IMintToAta[]> {
  let coupled_accounts: IMintToAta[] = [];

  try {
    // check to see if they are the same length
    if (mint_accounts.length != associated_token_accounts.length) {
      throw new Error("Mint Accounts and ATAs arrays are not same length");
    } else {
      coupled_accounts = await Promise.all(
        mint_accounts.map((mint_account, index) => {
          return {
            mint_account,
            associated_token_account: associated_token_accounts[index],
          } as IMintToAta;
        })
      );
    }
  } catch (err) {
    console.log(err);
  }

  return coupled_accounts;
}

export async function ata_to_remaining_accounts(associated_token_accounts: Account[]): Promise<AccountMeta[]> {
  let remaining_accounts = await Promise.all(
    associated_token_accounts.map((ata, index) => {
      return {
        pubkey: ata.address,
        isWritable: false,
        isSigner: false,
      } as AccountMeta;
    })
  );

  return remaining_accounts;
}
