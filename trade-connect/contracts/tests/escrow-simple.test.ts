import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowSimple } from "../target/types/escrow_simple";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

import { Keypair, Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

import * as splToken from '@solana/spl-token';

import * as utils from '../scripts/utils';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

describe("Escrow Program Unit Tests", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EscrowProgram as Program<EscrowSimple>;

  const escrow_keypair = (program.provider as anchor.AnchorProvider).wallet;
  
  // admin
  const admin = (provider.wallet as NodeWallet).payer;

  let trader_a = anchor.web3.Keypair.generate();
  let trader_b = anchor.web3.Keypair.generate();

  let mint_accounts_a: PublicKey[];
  let mint_accounts_b: PublicKey[];

  // ATAs that contain the mint token
  let trader_a_ata: splToken.Account[];
  let trader_b_ata: splToken.Account[];

  // vault ata for each user's NFTs
  let vault_a_ata: splToken.Account[];
  let vault_b_ata: splToken.Account[];

  // ATAs that are initialized when the withdrawal process happens
  let withdrawal_trader_a_ata: splToken.Account[];
  let withdrawal_trader_b_ata: splToken.Account[];

  let escrowPda: anchor.web3.PublicKey;
  
  before("Bootstrap", async () => {
    // await provider.connection.requestAirdrop(buyer.publicKey, 1*LAMPORTS_PER_SOL);

    // to get pda and bump needed to index the data we want on-chain
    [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('escrow-id'), provider.wallet.publicKey.toBuffer()], 
      program.programId
    );

    //////////////////////////////////
    // Initialize Mint Token Accounts
    //////////////////////////////////
    let mint_account: utils.IMintTokenAccount = {
      connection: provider.connection,
      payer: admin,
      authority: provider.wallet.publicKey,
      freezeAuthority: provider.wallet.publicKey,
    }

    mint_accounts_a = await utils.create_mint_nft_accounts(mint_account, 2);
    mint_accounts_b = await utils.create_mint_nft_accounts(mint_account, 2);

    console.log(`mint_accounts_a :: `, mint_accounts_a);
    console.log(`mint_accounts_b :: `, mint_accounts_b);

    //////////////////////////////////
    // Initialize Associated Token Accounts
    //////////////////////////////////
    let ata_params_a: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: admin,
      mint_accounts: mint_accounts_a,
      owner: trader_a.publicKey,
    }

    let ata_params_b: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: admin,
      mint_accounts: mint_accounts_b,
      owner: trader_b.publicKey,
    }

    // create ata for trader_a
    trader_a_ata = await utils.create_mutiple_associated_token_accounts(ata_params_a);
    console.log(`trader_a_ata :: `, trader_a_ata);

    // create ata for trader_a
    trader_b_ata = await utils.create_mutiple_associated_token_accounts(ata_params_b);
    console.log(`trader_b_ata :: `, trader_b_ata);

    //////////////////////////////////
    // Mint NFTs
    //////////////////////////////////
    const mint_to_ata_a = await utils.coupleMintToAtaInterface(mint_accounts_a, trader_a_ata);
    const mint_to_ata_b = await utils.coupleMintToAtaInterface(mint_accounts_b, trader_b_ata);

    const transaction_signatures_a = await utils.mint_multiple_nfts(
        provider.connection,
        admin,
        mint_to_ata_a,
      );

    console.log(`transaction_signatures_a :: `, transaction_signatures_a);

    const transaction_signatures_b = await utils.mint_multiple_nfts(
      provider.connection,
      admin,
      mint_to_ata_b,
    );

    console.log(`transaction_signatures_b :: `, transaction_signatures_b);

    //////////////////////////////////
    // Freeze Mint and Set Authority to traders
    //////////////////////////////////
    await utils.mutliple_freeze_mint(
      provider.connection,
      admin,
      mint_to_ata_a,
      trader_a.publicKey
    );

    await utils.mutliple_freeze_mint(
      provider.connection,
      admin,
      mint_to_ata_b,
      trader_b.publicKey
    );
  })

  it("Escrow is initialized!", async () => {

    const payload = {
      escrow_id: "escrow-id",
      trader_a: trader_a.publicKey,
      trader_b: trader_b.publicKey,
      trader_a_tokens: [trader_a.publicKey, trader_b.publicKey],
      trader_b_tokens: [trader_b.publicKey, trader_a.publicKey],
    };

    // Add your test here.
    const tx = await program.methods.initialize(
      payload.escrow_id,
      payload.trader_a,
      payload.trader_b,
      payload.trader_a_tokens,
      payload.trader_b_tokens,
    )
    .accounts({
      escrowAccount: escrow_keypair.publicKey,
      admin: admin.publicKey,
    })
    .signers([admin])
    .rpc();
    
    console.log("Your transaction signature", tx);
  });
});