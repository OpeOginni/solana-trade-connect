// use anchor_lang::prelude::*;
// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token::{self, Mint, Token, TokenAccount}
// };
// use errors::EscrowErrors;

// pub mod errors;

// declare_id!("2R5c5WvbM2iURA3wCZBBzBMy7ZLtVFNpDDKzz4ntjpQL");

// // escrow-id: pda of [escrow_id + trader_a_address + trader_b_address]

// #[program]
// pub mod escrow_program {
//     use super::*;

//     // initializes the Escrow Account
//     // initializes the list of Token Accounts for Transfer
//     pub fn initialize(
//             ctx: Context<Initialize>,
//             escrow_id: String,
//             sender: Pubkey,
//             recipient: Pubkey,
//             sender_mint_tokens: Vec<Pubkey>,
//             recipient_mint_tokens: Vec<Pubkey>
//         ) -> Result<()> {

//         let sender_escrow_account = &mut ctx.accounts.sender_escrow_account;
//         let recipient_escrow_account = &mut ctx.accounts.recipient_escrow_account;

//         // prevent initialization or reinitialization of in-progress escrow
//         require!(!sender_escrow_account.is_in_progress() || !recipient_escrow_account.is_in_progress(), EscrowErrors::UpdateStateDenied);

//         sender_escrow_account.init_escrow(
//             recipient_escrow_account,
//             escrow_id.clone(), 
//             sender, 
//             recipient, 
//             sender_mint_tokens,
//             recipient_mint_tokens
//         );

//         Ok(())
//     }

//     // signer (auth) call
//     pub fn deposit_to_vault(ctx: Context<DepositToVault>, escrow_id: String) -> Result<()> {

//         let provided_remaining_accounts = &mut ctx.remaining_accounts.iter();
//         // expect: 1. Owner Token Account, 2. Mint Account, 3. Vault Token Account

//         //let owner_token_account: AccountInfo;

//         let mut i = 0;
//         while i < ctx.remaining_accounts.len() {
//             i += 3;

//             let owner_token_account_info = next_account_info(provided_remaining_accounts)?;
//             let mint_account_info = next_account_info(provided_remaining_accounts)?;
//             let vault_token_account_info = next_account_info(provided_remaining_accounts)?;


        
//             // TODO: perform account validation
//             // validate that owner is signer
//             // validate that mint account in owned by owner
//             //etc.

//             let cpi_ctx = CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::TransferChecked {
//                     from: owner_token_account.clone(),
//                     mint: mint.clone(),
//                     to: vault.clone(),
//                     authority: ctx.accounts.authority.to_account_info(),
//                 },
//             );
    
//             // throw error if fail
//             token::transfer_checked(cpi_ctx, 1, 0);

//         }

//         //Pubkey::find_program_address(seeds, program_id);
//         //Pubkey::create_program_address(seeds, ctx.program_id);

//         // change state in UserEscrowAccount 
//         let user_escrow_account = &mut ctx.accounts.user_escrow_account;
//         user_escrow_account.update_state(Status::Deposited);

//         Ok(())
//     }

//     // pub fn exchange(ctx: Context<Exchange>, escrow_id: String, recipient_1: Pubkey, recipient_2: Pubkey) -> Result<()> {

//     //     let recipient_1_escrow_account = &mut ctx.accounts.recipient_1_escrow_account;
//     //     let recipient_2_escrow_account = &mut ctx.accounts.recipient_2_escrow_account;

//     //     require!(
//     //         recipient_1_escrow_account.get_state() == Status::Deposited 
//     //             && recipient_2_escrow_account.get_state() == Status::Deposited,
//     //         EscrowErrors::ExchangeDenied
//     //     );

//     //     let provided_remaining_accounts = &mut ctx.remaining_accounts.iter();
//     //     // expect: 1. Recipient Token Account, 2. Mint Account, 3. Vault Token Account

//     //     let mut i = 0;
//     //     while i < ctx.remaining_accounts.len() {
//     //         i += 3;

//     //         let recipient_token_account_info = next_account_info(provided_remaining_accounts)?;
//     //         let mint_account_info = next_account_info(provided_remaining_accounts)?;
//     //         let vault_token_account_info = next_account_info(provided_remaining_accounts)?;

//     //         // TODO: perform account validation
//     //         // validate that owner is signer
//     //         // validate that mint account in owned by owner
//     //         // validate recipient accounts
//     //         //etc.

//     //         let cpi_ctx = CpiContext::new(
//     //             ctx.accounts.token_program.to_account_info(),
//     //             token::TransferChecked {
//     //                 from: vault_token_account_info.clone(),
//     //                 mint: mint_account_info.clone(),
//     //                 to: recipient_token_account_info.clone(),
//     //                 authority: ctx.accounts.admin.to_account_info(),
//     //             },
//     //         );
    
//     //         // throw error if fail
//     //         token::transfer_checked(cpi_ctx, 1, 0);
//     //     }

//     //     // change state in UserEscrowAccount 
//     //     let recipient_1_escrow_account = &mut ctx.accounts.recipient_1_escrow_account;
//     //     let recipient_2_escrow_account = &mut ctx.accounts.recipient_2_escrow_account;
//     //     recipient_1_escrow_account.update_state(Status::Finalized);
//     //     recipient_2_escrow_account.update_state(Status::Finalized);

//     //     Ok(())
//     // }

// }

// // [escrow_id + trader_key + token_key + bump]

// #[derive(Accounts)]
// #[instruction(
//     escrow_id:String,
//     sender: Pubkey,
//     recipient: Pubkey,
//     sender_mint_tokens: Vec<Pubkey>,
//     recipient_mint_tokens: Vec<Pubkey>,
// )]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub admin: Signer<'info>,

//     #[account(
//         init,
//         seeds = [
//             b"user-escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             sender.key().as_ref(),
//         ],
//         bump,
//         payer = admin, 
//         space = UserEscrowAccount::LEN,
//         rent_exempt = enforce
//     )]
//     pub sender_escrow_account: Account<'info, UserEscrowAccount>,

//     #[account(
//         init,
//         seeds = [
//             b"user-escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             recipient.key().as_ref(),
//         ],
//         bump,
//         payer = admin, 
//         space = UserEscrowAccount::LEN,
//         rent_exempt = enforce
//     )]
//     pub recipient_escrow_account: Account<'info, UserEscrowAccount>,

//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(
//     escrow_id:String,
//     trader_a: Pubkey,
//     trader_b: Pubkey,
//     status: Status,
// )]
// pub struct UpdateEscrowState <'info> {
//     #[account(
//         mut,
//         seeds = [
//             b"escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             trader_a.key().as_ref(),
//         ],
//         bump,
//         realloc = UserEscrowAccount::LEN,
//         realloc::payer = admin,
//         realloc::zero = true,
//     )]
//     pub escrow_account: Account<'info, UserEscrowAccount>,
//     #[account(mut)]
//     pub admin: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(
//     escrow_id:String,
//     participant: Pubkey,
// )]
// pub struct CloseEscrowAccount <'info> {
//     #[account(
//         mut,
//         seeds = [
//             b"escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             participant.key().as_ref(),
//         ],
//         bump,
//         close = admin,
//     )]
//     pub participant_escrow_account: Account<'info, UserEscrowAccount>,
//     #[account(mut)]
//     pub admin: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(
//     escrow_id:String,
// )]
// pub struct DepositToVault <'info> {

//     #[account(mut)]
//     pub authority: Signer<'info>,

//     // escrow account
//     #[account(
//         mut,
//         seeds = [
//             b"escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             authority.key().as_ref(),
//         ],
//         bump,
//         realloc = UserEscrowAccount::LEN,
//         realloc::payer = authority,
//         realloc::zero = true,
//     )]
//     pub user_escrow_account: Account<'info, UserEscrowAccount>,

//     pub associated_token_program: Program<'info, AssociatedToken>,
//     #[account(address = token::ID)]
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(
//     escrow_id:String,
//     recipient_1: Pubkey,
//     recipient_2: Pubkey,
// )]
// pub struct Exchange <'info> {

//     #[account(mut)]
//     pub admin: Signer<'info>,

//     // escrow account
//     #[account(
//         mut,
//         seeds = [
//             b"user-escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             recipient_1.key().as_ref(),
//         ],
//         bump,
//         realloc = UserEscrowAccount::LEN,
//         realloc::payer = admin,
//         realloc::zero = true,
//     )]
//     pub recipient_1_escrow_account: Account<'info, UserEscrowAccount>,

//     #[account(
//         mut,
//         seeds = [
//             b"user-escrow".as_ref(),
//             escrow_id.as_bytes(), 
//             recipient_2.key().as_ref(),
//         ],
//         bump,
//         realloc = UserEscrowAccount::LEN,
//         realloc::payer = admin,
//         realloc::zero = true,
//     )]
//     pub recipient_2_escrow_account: Account<'info, UserEscrowAccount>,

//     pub associated_token_program: Program<'info, AssociatedToken>,
//     #[account(address = token::ID)]
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
// pub enum Status {
//     Initialized,
//     Deposited,
//     Cancelled,
//     Finalized,
// }

// #[account]
// pub struct UserEscrowAccount {
//     // 4 + length of string in bytes [4 + len()]
//     escrow_id: String,
//     // owner Pubkey [32]
//     owner_key: Pubkey,
//     // trader tokens [4 + 32 * length]
//     owner_mint_tokens: Vec<Pubkey>,
//     // recipient key
//     recipient_key: Pubkey,
//     // 1 + Largest Variant Size [1 + 4 + len()]
//     status: Status,
// }

// impl UserEscrowAccount {
//     // including the 8 byte discriminator
//     // TODO: Figure max byte size for Strings (optimization)
//     pub const LEN: usize = 8 + (4 + 32) + 32 + 32 + (4 + 32 * 5) + (1 + 4 + 32);

//     pub fn init_escrow(
//             &mut self, 
//             recipient_acc: &mut UserEscrowAccount, 
//             escrow_id: String, 
//             actor_1: Pubkey, 
//             actor_2: Pubkey,
//             actor_1_mint_tokens: Vec<Pubkey>,
//             actor_2_mint_tokens: Vec<Pubkey>,
//         ) {
//         // initialize actor 1
//         self.escrow_id = escrow_id.clone();
//         self.owner_key = actor_1.clone();
//         self.owner_mint_tokens = actor_1_mint_tokens.clone();
//         self.recipient_key = actor_2.clone();
//         self.status = Status::Initialized;

//         // initialize actor 2
//         recipient_acc.escrow_id = escrow_id.clone();
//         recipient_acc.owner_key = actor_2.clone();
//         recipient_acc.owner_mint_tokens = actor_2_mint_tokens.clone();
//         recipient_acc.recipient_key = actor_1.clone();
//         recipient_acc.status = Status::Initialized;
//     }

//     pub fn get_state(&self) -> Status {
//         self.status
//     }

//     pub fn update_state(&mut self, state: Status) {
//         self.status = state;
//     }

//     pub fn is_in_progress(&self) -> bool {
//         self.status == Status::Initialized
//     }
// }


