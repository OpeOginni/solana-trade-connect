import { 
    Keypair, 
    Connection, 
    PublicKey, 
    Signer,
    Transaction, 
    SystemProgram, 
    TransactionSignature} from "@solana/web3.js";

import * as splToken from '@solana/spl-token';
import { web3 } from "@coral-xyz/anchor";

export interface AccountMeta {
    pubkey: PublicKey,
    isWritable: boolean,
    isSigner: boolean,
}

export interface IMintTokenAccount {
    connection: Connection, 
    payer: Signer, 
    authority: PublicKey, 
    freezeAuthority: PublicKey,
}

export interface IAssociatedTokenAccounts {
    connection: Connection, 
    payer: Signer, 
    mint_accounts: PublicKey[],
    owner: PublicKey
}

export interface IMintToAta {
    mint_account: PublicKey,
    associated_token_account: splToken.Account
}

export async function create_mint_nft_accounts(
        param: IMintTokenAccount,
        num_of_mint_accounts: number,
    ): Promise<PublicKey[]> {


    const mintAccounts: PublicKey[] = [];

    for (let i = 0; i < num_of_mint_accounts; i++) {
        const mintAccount = await splToken.createMint(
            param.connection,
            param.payer,
            param.authority,
            param.freezeAuthority,
            0
        );
        mintAccounts.push(mintAccount);
    }

    return mintAccounts;
}

export async function create_mutiple_associated_token_accounts(
        params: IAssociatedTokenAccounts,
    ): Promise<splToken.Account[]> {

    let mint_accounts = params.mint_accounts;

    let associated_token_accounts = await Promise.all(mint_accounts.map(async (account) => {
        return await splToken.getOrCreateAssociatedTokenAccount(
            params.connection,
            params.payer,
            account,
            params.owner,
            false,
        );
    }));

    return associated_token_accounts;
}

// mints NFT to User's ATA,
export async function mint_multiple_nfts(
    connection: Connection,
    payer: Signer,
    accounts: IMintToAta[],
): Promise<string[]> {
    let transaction_signatures = await Promise.all(accounts.map(async (account) => {
        return await splToken.mintTo(
            connection,
            payer,
            account.mint_account,
            account.associated_token_account.address,
            payer,
            1
        );
    }));

    return transaction_signatures;
}

export async function coupleMintToAtaInterface(
        mint_accounts: PublicKey[],
        associated_token_accounts: splToken.Account[]
    ): Promise<IMintToAta[]> {

    let coupled_accounts: IMintToAta[];

    try {
        // check to see if they are the same length
        if (mint_accounts.length != associated_token_accounts.length) {
            throw new Error("Mint Accounts and ATAs arrays are not same length");
        }
        else {
            coupled_accounts = await Promise.all(mint_accounts.map((mint_account, index) => {
                return {
                    mint_account,
                    associated_token_account: associated_token_accounts[index]
                } as IMintToAta;
            }));
        }
    } catch(err) {
        console.log(err);
    }

    return coupled_accounts;
}

export async function ata_to_remaining_accounts(
    associated_token_accounts: splToken.Account[]
): Promise<AccountMeta[]> {

let remaining_accounts = await Promise.all(associated_token_accounts.map((ata, index) => {
            return {
                pubkey: ata.address,
                isWritable: false,
                isSigner: false
            } as AccountMeta;
        }));

return remaining_accounts;
}

export async function mutliple_freeze_mint(
    connection: Connection,
    payer: Signer,
    accounts: IMintToAta[],
    new_mint_owner: PublicKey
): Promise<string[]> {

    let transaction_signatures = await Promise.all(accounts.map(async (account) => {

        let transaction = new Transaction();
        
        transaction.add(
            // freeze mint
            splToken.createSetAuthorityInstruction(
                account.mint_account,
                payer.publicKey,
                splToken.AuthorityType.MintTokens,
                null,
            ),
            // set authority to trader
            // splToken.createSetAuthorityInstruction(
            //     account.mint_account,
            //     payer.publicKey,
            //     splToken.AuthorityType.AccountOwner,
            //     new_mint_owner,
            // )
        );

        return await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
    }));

    return transaction_signatures;
}

// export async function deposit_batch_nfts(
//     connection: Connection,
//     depositor: Signer,
//     accounts: IMintToAta[],
// ): Promise<string[]> {
//     let transaction_signatures = await Promise.all(accounts.map(async (account) => {

//         let transaction = new Transaction();
        
//         transaction.add(
//             // freeze mint
//             splToken.createSetAuthorityInstruction(
//                 account.mint_account,
//                 depositor.publicKey,
//                 splToken.AuthorityType.MintTokens,
//                 null,
//             ),
//             // set authority to trader
//             // splToken.createSetAuthorityInstruction(
//             //     account.mint_account,
//             //     payer.publicKey,
//             //     splToken.AuthorityType.AccountOwner,
//             //     new_mint_owner,
//             // )
//         );

//         return await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
//     }));

//     return transaction_signatures;
// }