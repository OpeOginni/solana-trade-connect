import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowSimple } from "../target/types/escrow_simple";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

import { Keypair, Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

import * as splToken from '@solana/spl-token';

import * as utils from '../scripts/utils';
import { expect } from "chai";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const MOCK_ESCROW_ID = "A1";

describe("Escrow Program Unit Tests", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EscrowSimple as Program<EscrowSimple>;

  console.log(program.programId);

  const program_owner = (program.provider as anchor.AnchorProvider).wallet;
  
  // payer
  const payer = (provider.wallet as NodeWallet).payer;

  let trader_a = anchor.web3.Keypair.generate();
  let trader_b = anchor.web3.Keypair.generate();

  let trader_a_state: PublicKey;
  let trader_b_state: PublicKey;

  let mint_accounts_a: PublicKey[];
  let mint_accounts_b: PublicKey[];

  // ATAs that contain the mint token
  let trader_a_ata: splToken.Account[];
  let trader_b_ata: splToken.Account[];

  // vault ata for each user's NFTs
  let vaults_a_ata: splToken.Account[];
  let vaults_b_ata: splToken.Account[];

  // ATAs that are initialized when the withdrawal process happens
  let withdrawal_trader_a_ata: splToken.Account[];
  let withdrawal_trader_b_ata: splToken.Account[];

  let escrowPda: anchor.web3.PublicKey;
  
  before("Bootstrap Test Suite", async () => {
    // await provider.connection.requestAirdrop(buyer.publicKey, 1*LAMPORTS_PER_SOL);

    // to get pda and bump needed to index the data we want on-chain
    [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), Buffer.from(MOCK_ESCROW_ID)], 
      program.programId
    );

    [trader_a_state] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('user-state'), Buffer.from(MOCK_ESCROW_ID), trader_a.publicKey.toBuffer()], 
      program.programId
    );

    [trader_b_state] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('user-state'), Buffer.from(MOCK_ESCROW_ID), trader_b.publicKey.toBuffer()], 
      program.programId
    );

    // //////////////////////////////////
    // // Initialize Mint Token Accounts
    // //////////////////////////////////
    let mint_account: utils.IMintTokenAccount = {
      connection: provider.connection,
      payer: payer,
      authority: provider.wallet.publicKey,
      freezeAuthority: provider.wallet.publicKey,
    }

    mint_accounts_a = await utils.create_mint_nft_accounts(mint_account, 2);
    mint_accounts_b = await utils.create_mint_nft_accounts(mint_account, 2);

    console.log(`mint_accounts_a :: `, mint_accounts_a);
    console.log("");
    console.log(`mint_accounts_b :: `, mint_accounts_b);
    console.log("");

    //////////////////////////////////
    // Initialize Associated Token Accounts
    //////////////////////////////////
    let ata_params_a: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: payer,
      mint_accounts: mint_accounts_a,
      owner: trader_a.publicKey,
    }

    let ata_params_b: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: payer,
      mint_accounts: mint_accounts_b,
      owner: trader_b.publicKey,
    }

    // create ata for trader_a
    trader_a_ata = await utils.create_mutiple_associated_token_accounts(ata_params_a);
    console.log(`trader_a_ata :: `, trader_a_ata);
    console.log("");

    // create ata for trader_a
    trader_b_ata = await utils.create_mutiple_associated_token_accounts(ata_params_b);
    console.log(`trader_b_ata :: `, trader_b_ata);
    console.log("");

    // //////////////////////////////////
    // // Mint NFTs
    // //////////////////////////////////
    const mint_to_ata_a = await utils.coupleMintToAtaInterface(mint_accounts_a, trader_a_ata);
    const mint_to_ata_b = await utils.coupleMintToAtaInterface(mint_accounts_b, trader_b_ata);

    const transaction_signatures_a = await utils.mint_multiple_nfts(
        provider.connection,
        payer,
        mint_to_ata_a,
      );

    console.log(`transaction_signatures_a :: `, transaction_signatures_a);

    const transaction_signatures_b = await utils.mint_multiple_nfts(
      provider.connection,
      payer,
      mint_to_ata_b,
    );

    console.log(`transaction_signatures_b :: `, transaction_signatures_b);

    // //////////////////////////////////
    // // Freeze Mint and Set Authority to traders
    // //////////////////////////////////
    let freeze_a = await utils.mutliple_freeze_mint(
      provider.connection,
      payer,
      mint_to_ata_a,
      trader_a.publicKey
    );
    console.log(`freeze_a :: `, freeze_a);

    let freeze_b =await utils.mutliple_freeze_mint(
      provider.connection,
      payer,
      mint_to_ata_b,
      trader_b.publicKey
    );
    console.log(`freeze_b :: `, freeze_b);
  })

  // how do we check what has been initialized?
  it("Escrow is initialized!", async () => {

    const payload = {
      escrow_id: MOCK_ESCROW_ID,
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
      escrowAccount: escrowPda,
      traderAState: trader_a_state,
      traderBState: trader_b_state,
      admin: program_owner.publicKey,
    })
    .signers([payer])
    .rpc({skipPreflight:true});
    
    console.log("Your transaction signature", tx);

    // expect 
  });

  it("Trader A Deposits token into vault", async () => {
    //////////////////////////////////
    // Initialize Associated Token Accounts (Escrow Vaults)
    //////////////////////////////////
    let ata_params_a_vaults: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: payer,
      mint_accounts: mint_accounts_a,
      owner: program_owner.publicKey,
    }

    // create ata for trader_a
    vaults_a_ata = await utils.create_mutiple_associated_token_accounts(ata_params_a_vaults);
    console.log(`vaults_a_ata :: `, vaults_a_ata);
    console.log("");

    // expect(trader_a_ata[0].mint == vaults_a_ata[0].mint).to.be.true;

    // // use the vaults as account params when depositing
    // const tx = await program.methods.depositIndividual(
    //   MOCK_ESCROW_ID,
    // )
    // .accounts({
    //   initializer: trader_a.publicKey,
    //   mint: vaults_a_ata[0].mint,
    //   escrowAccount: escrowPda,
    //   traderState: trader_a_state,
    //   vaultAta: vaults_a_ata[0].address,
    //   initializerAta: trader_a_ata[0].address
    // })
    // .signers([trader_a])
    // .rpc({skipPreflight:true});
  })

});