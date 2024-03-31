import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowSimple } from "../target/types/escrow_simple";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

import { Keypair, Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

import * as splToken from '@solana/spl-token';

import * as utils from '../scripts/utils';
import { assert, expect } from "chai";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const MOCK_ESCROW_ID = "escrow-id";

describe("Escrow Program Unit Tests", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EscrowSimple as Program<EscrowSimple>;

  // both admin_wallet and admin_signer have the same pubkey, they just are different types
  const admin_wallet = (program.provider as anchor.AnchorProvider).wallet;
  const admin_signer = (provider.wallet as NodeWallet).payer;

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
      payer: admin_signer,
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
      payer: admin_signer,
      mint_accounts: mint_accounts_a,
      owner: trader_a.publicKey,
    }

    let ata_params_b: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: admin_signer,
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
        admin_signer,
        mint_to_ata_a,
      );

    console.log(`transaction_signatures_a :: `, transaction_signatures_a);

    const transaction_signatures_b = await utils.mint_multiple_nfts(
      provider.connection,
      admin_signer,
      mint_to_ata_b,
    );

    console.log(`transaction_signatures_b :: `, transaction_signatures_b);

    // //////////////////////////////////
    // // Freeze Mint and Set Authority to traders
    // //////////////////////////////////
    let freeze_a = await utils.mutliple_freeze_mint(
      provider.connection,
      admin_signer,
      mint_to_ata_a,
      trader_a.publicKey
    );
    console.log(`freeze_a :: `, freeze_a);

    let freeze_b =await utils.mutliple_freeze_mint(
      provider.connection,
      admin_signer,
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
      admin: admin_signer.publicKey,
    })
    .signers([admin_signer])
    .rpc({skipPreflight:true});
    
    console.log("Your transaction signature", tx);

    // expect 
  });

  it("Trader A Deposits token into vault", async () => {

    await Promise.all(trader_a_ata.map(async (trader_ata, index) => {

      const traderAtaBalanceBefore = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        trader_a.publicKey,
      ).then((account) => Number(account.amount));

      const vault_ata = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        admin_signer.publicKey,
      );
  
      const vaultAtaBalanceBefore = Number(vault_ata.amount);

      expect(trader_ata.mint.toBase58() === vault_ata.mint.toBase58()).to.be.true;

      const tx = await program.methods.depositIndividual(
        MOCK_ESCROW_ID,
      )
      .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_a.publicKey,
        mint: vault_ata.mint,
        escrowAccount: escrowPda,
        traderState: trader_a_state,
        vaultAta: vault_ata.address,
        initializerAta: trader_ata.address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      })
      .signers([admin_signer, trader_a])
      .rpc();

      // Get the balances of the relevant token accounts after the instruction
      const traderAtaBalanceAfter = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        trader_a.publicKey,
      ).then((account) => Number(account.amount));

      const vaultAtaBalanceAfter = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        admin_signer.publicKey,
      ).then((account) => Number(account.amount));

      // Assert that the token transfer was successful
      assert.strictEqual(
        traderAtaBalanceBefore - traderAtaBalanceAfter,
        vaultAtaBalanceAfter - vaultAtaBalanceBefore
      );
    }));
  }); // Trader A Deposits token into vault

  it("Trader B Deposits token into vault", async () => {

    await Promise.all(trader_b_ata.map(async (trader_ata, index) => {

      const traderAtaBalanceBefore = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        trader_b.publicKey,
      ).then((account) => Number(account.amount));

      const vault_ata = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        admin_signer.publicKey,
      );
  
      const vaultAtaBalanceBefore = Number(vault_ata.amount);

      expect(trader_ata.mint.toBase58() === vault_ata.mint.toBase58()).to.be.true;

      const tx = await program.methods.depositIndividual(
        MOCK_ESCROW_ID,
      )
      .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_b.publicKey,
        mint: vault_ata.mint,
        escrowAccount: escrowPda,
        traderState: trader_b_state,
        vaultAta: vault_ata.address,
        initializerAta: trader_ata.address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      })
      .signers([admin_signer, trader_b])
      .rpc();

      // Get the balances of the relevant token accounts after the instruction
      const traderAtaBalanceAfter = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        trader_b.publicKey,
      ).then((account) => Number(account.amount));

      const vaultAtaBalanceAfter = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        trader_ata.mint,
        admin_signer.publicKey,
      ).then((account) => Number(account.amount));

      // Assert that the token transfer was successful
      assert.strictEqual(
        traderAtaBalanceBefore - traderAtaBalanceAfter,
        vaultAtaBalanceAfter - vaultAtaBalanceBefore
      );
    }));
  }); // Trader B Deposits token into vault

  it("Admin Updates Deposit State", async() => {
    
    // get the list of vault atas
    let vault_params_a: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: admin_signer,
      mint_accounts: mint_accounts_a,
      owner: admin_signer.publicKey,
    }

    let vault_params_b: utils.IAssociatedTokenAccounts = {
      connection: provider.connection,
      payer: admin_signer,
      mint_accounts: mint_accounts_b,
      owner: admin_signer.publicKey,
    }

    vaults_a_ata = await utils.create_mutiple_associated_token_accounts(vault_params_a);
    vaults_b_ata = await utils.create_mutiple_associated_token_accounts(vault_params_b);

    // convert list of vault ata to remaining accounts
    const a_remaining_accounts = await utils.ata_to_remaining_accounts(vaults_a_ata);

    console.log()

    //update for A 
    const tx_a = await program.methods.updateTraderDepositStatus(
      MOCK_ESCROW_ID,
      trader_a.publicKey,
      trader_b.publicKey
    )
    .accounts({
      admin: admin_signer.publicKey,
      escrowAccount: escrowPda,
      depositorState: trader_a_state,
      withdrawerState: trader_b_state,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .signers([admin_signer])
    .remainingAccounts(a_remaining_accounts)
    .rpc();

    //update for B
    const b_remaining_accounts = await utils.ata_to_remaining_accounts(vaults_b_ata);

    const tx_b = await program.methods.updateTraderDepositStatus(
      MOCK_ESCROW_ID,
      trader_b.publicKey,
      trader_a.publicKey
    )
    .accounts({
      admin: admin_signer.publicKey,
      escrowAccount: escrowPda,
      depositorState: trader_b_state,
      withdrawerState: trader_a_state,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .signers([admin_signer])
    .remainingAccounts(b_remaining_accounts)
    .rpc();
  })

  // TODO: create test where update does not happen and trader a withdraw fails
  // example: Trader A depsoits but Trader B has not,
  // example: Trader A and Trader B both deposit but UpdateState was not called
  it("Trader A Withdraws token from vault (receiving Trader B's NFTs)", async () => {

    // iterate through B mint accounts
    await Promise.all(mint_accounts_b.map(async (mint_account, index) => {

      const vault_ata = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        mint_account,
        admin_signer.publicKey,
      );

      const vaultAtaBalanceBefore = Number(vault_ata.amount);

      const recipient_ata = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        mint_account,
        trader_a.publicKey,
      );

      const recipientAtaBalanceBefore = Number(recipient_ata.amount);

      const tx = await program.methods.withdrawIndividual(
        MOCK_ESCROW_ID,
      )
      .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_a.publicKey,
        mint: mint_account,
        escrowAccount: escrowPda,
        traderState: trader_a_state,
        vaultAta: vault_ata.address,
        initializerAta: recipient_ata.address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      })
      .signers([admin_signer, trader_a])
      .rpc();

      // Get the balances of the relevant token accounts after the instruction
      const vaultAtaBalanceAfter = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        mint_account,
        admin_signer.publicKey,
      ).then((account) => Number(account.amount));

      const recipientAtaBalanceAfter = await splToken.getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin_signer,
        mint_account,
        trader_a.publicKey,
      ).then((account) => Number(account.amount));

      // Assert that the token transfer was successful
      assert.strictEqual(
        vaultAtaBalanceBefore - vaultAtaBalanceAfter,
        recipientAtaBalanceAfter - recipientAtaBalanceBefore
      );
    }));
  }); // Trader B Deposits token into vault
});