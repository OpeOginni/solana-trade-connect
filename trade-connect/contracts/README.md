# Solana Escrow Program

1. Build the program   
`anchor build`

2. Test
`anchor test`

## Actors (Signers)
- Admin: the wallet that the Trade Connect team owns. The wallet also is the owner of the Escrow Program, and the owner of all the Vault Accounts.

Admin is used to `initialize()`, facilitate `withdraw()`, facilitate `cancel()`, and to `updateDepositStatus()` and `updateWithdrawalStatus()`

- Traders
    - Trader A: the wallet of Trader A.
    - Trader B: the wallet of Trader B.

Traders are used to `deposit()`.

## Program Breakdown
If two users would like to trade NFTs. The Admin(Signer) will call the `initialize` instruction in the `escrow-simple` program. When called, the `initialize` instruciton will initialize the following:

- `Escrow` account
- Trader A's `UserEscrowState` account
- Trader B's `UserEscrowState` account

The `Escrow` account holds the related `escrow-id`, the PDA(Program Derived Address) of both `UserEscrowState` accounts for each respective trader, and the "master state" of the escrow. The `UserEscrowState` holds all the information of a particular Trader that is needed to facilitate a trade. This includes the `escrow-id`, the trader's pubkey, the list of token mint pubkey's for the NFTs they would like to trade, and the user's state.  
  
After the `Escrow` and both `UserEscrowState`s are initialized. The Traders(Signers) need to both call the `deposit()` function on their end to deposit the NFTs into the Escrow's Vault. Once all the NFTs are deposited, the Admin needs to update the state of the `Escrow` and `UserEscrowState` accounts, by calling the `updateDespoitStatus()` instruction. This will set the "master state" to `Deposited`, so that we can enable withdrawals.

Since our vaults own the NFTs, the admin will need to call the `withdraw` instruction in order to facilitate the withdrawals. The admin will also need to construct the list of Recipient Associated Token Accounts, based on the sender's list of Mint Account Pubkeys. After the list of Recipient Associated Token Accounts are initialized, we need to conver them into the `AccountMeta` type:

```
export interface AccountMeta {
    pubkey: PublicKey,
    isWritable: boolean,
    isSigner: boolean,
}
```

The `AccountMeta` type is the type that `ctx.remaining_accounts` uses. So before we call the `updateWithdrawalStatus()` function we need to convert the list of Recipient Associated Token Accounts to the a list of `AccountMeta` types (`AccountMeta[]`). We pass this list as the remaining_accounts when invoking the `withdraw` instruction.   
  
After invoking the `withdraw` functions the admin needs to call the `updateWithdrawlStatus()` function to finalize the escrow transaction.

## Client side prerequisites

1. List of Trader A Mint Pubkeys
`let mint_a_pubkeys: PublicKey[] = [...]`

2. List of Trader B Mint Pubkeys
`let mint_b_pubkeys: PublicKey[] = [...]`

3. Trader A Wallet
`let trader_a_wallet;`

3. Trader B Wallet
`let trader_b_wallet;`

4. Admin Wallet
`let admin_wallet;`

# Guide for interacting with Program from Client

## Obtain the Provider connection and Admin Wallet
```
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowSimple } from "../target/types/escrow_simple";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

import * as web3 from "@solana/web3.js";

import * as splToken from '@solana/spl-token';

import * as utils from '../scripts/utils';

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.EscrowSimple as Program<EscrowSimple>;

const admin_signer = (provider.wallet as NodeWallet).payer; 
```

## Obtain the Trader's wallets
```
const trader_a = ______;

const trader_b = ______;
```

## Obtain the Mint Pubkeys
```
// obtain the mint pubkeys

const mint_accounts_a = _______;
const mint_accounts_b = _______;
```

## Obtain the PDAs
```
const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), Buffer.from(MOCK_ESCROW_ID)], 
    program.programId
);

const [trader_a_state] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('user-state'), Buffer.from(MOCK_ESCROW_ID), trader_a.publicKey.toBuffer()], 
    program.programId
);

const [trader_b_state] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('user-state'), Buffer.from(MOCK_ESCROW_ID), trader_b.publicKey.toBuffer()], 
    program.programId
);
```

## Create ATA's

1. Obtain Trader ATA's
```
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
const trader_a_ata: splToken.Account[] = await utils.create_mutiple_associated_token_accounts(ata_params_a);

// create ata for trader_a
const trader_b_ata: splToken.Account[] = await utils.create_mutiple_associated_token_accounts(ata_params_b);
```

2. Create Vault ATA's
// note there should be a way to do this inside the instruction itself.
// but for now this will work
```
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

const vaults_a_ata = await utils.create_mutiple_associated_token_accounts(vault_params_a);
const vaults_b_ata = await utils.create_mutiple_associated_token_accounts(vault_params_b);
```

3. Create Recipient ATA's 
```
// note the mint_accounts is the list of B
let recipient_a_params: utils.IAssociatedTokenAccounts = {
    connection: provider.connection,
    payer: admin_signer,
    mint_accounts: mint_accounts_b,
    owner: trader_a.publicKey,
}

// note the mint_accounts is the list of A
let recipient_b_params: utils.IAssociatedTokenAccounts = {
    connection: provider.connection,
    payer: admin_signer,
    mint_accounts: mint_accounts_a,
    owner: trader_b.publicKey,
}

const recipient_a_ata = await utils.create_mutiple_associated_token_accounts(recipient_a_params);
const recipient_b_ata = await utils.create_mutiple_associated_token_accounts(recipient_b_params);
```

## Deposit
```
// for Trader A
await Promise.all(trader_a_ata.map(async (trader_ata, index) => {
    const tx = await program.methods.depositIndividual(
        MOCK_ESCROW_ID,
    )
    .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_a.publicKey,
        mint: vault_a_ata[index].mint,
        escrowAccount: escrowPda,
        traderState: trader_a_state,
        vaultAta: vault_a_ata[index].address,
        initializerAta: trader_ata.address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .signers([admin_signer, trader_a])
    .rpc();
}));
```

```
// for Trader B
await Promise.all(trader_b_ata.map(async (trader_ata, index) => {
    const tx = await program.methods.depositIndividual(
        MOCK_ESCROW_ID,
    )
    .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_b.publicKey,
        mint: vault_b_ata[index].mint,
        escrowAccount: escrowPda,
        traderState: trader_b_state,
        vaultAta: vault_b_ata[index].address,
        initializerAta: trader_ata.address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .signers([admin_signer, trader_b])
    .rpc();
}));
```

## Update Deposit Status
```
// update state for A
const a_remaining_accounts = await utils.ata_to_remaining_accounts(vaults_a_ata);

await program.methods.updateTraderDepositStatus(
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


// update status for B
const b_remaining_accounts = await utils.ata_to_remaining_accounts(vaults_b_ata);

await program.methods.updateTraderDepositStatus(
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
```

## Withdraw
```
await Promise.all(mint_accounts_b.map(async (mint_account, index) => {

    const tx = await program.methods.withdrawIndividual(
        MOCK_ESCROW_ID,
    )
    .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_a.publicKey,
        mint: mint_account,
        escrowAccount: escrowPda,
        traderState: trader_a_state,
        vaultAta: vault_b_ata[index].address,
        initializerAta: recipient_a_ata[ata].address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .signers([admin_signer, trader_a])
    .rpc();
}));
```

```
await Promise.all(mint_accounts_a.map(async (mint_account, index) => {

    const tx = await program.methods.withdrawIndividual(
        MOCK_ESCROW_ID,
    )
    .accounts({
        admin: admin_signer.publicKey,
        initializer: trader_b.publicKey,
        mint: mint_account,
        escrowAccount: escrowPda,
        traderState: trader_b_state,
        vaultAta: vault_a_ata[index].address,
        initializerAta: recipient_b_ata[ata].address,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
    })
    .signers([admin_signer, trader_b])
    .rpc();
}));
```

## Finalize Escrow
```
// update withdrawal status for A 
const a_remaining_accounts = await utils.ata_to_remaining_accounts(recipient_a_ata);

await program.methods.updateTraderWithdrawalStatus(
    MOCK_ESCROW_ID,
    trader_a.publicKey,
    trader_b.publicKey
)
.accounts({
    admin: admin_signer.publicKey,
    escrowAccount: escrowPda,
    recipientState: trader_a_state,
    senderState: trader_b_state,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
})
.signers([admin_signer])
.remainingAccounts(a_remaining_accounts)
.rpc();

//update for B
const b_remaining_accounts = await utils.ata_to_remaining_accounts(recipient_b_ata);

await program.methods.updateTraderWithdrawalStatus(
    MOCK_ESCROW_ID,
    trader_b.publicKey,
    trader_a.publicKey
)
.accounts({
    admin: admin_signer.publicKey,
    escrowAccount: escrowPda,
    recipientState: trader_b_state,
    senderState: trader_a_state,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
})
.signers([admin_signer])
.remainingAccounts(b_remaining_accounts)
.rpc();
```