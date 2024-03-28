use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount}
};
use errors::EscrowErrors;

pub mod errors;

declare_id!("Eg2okp1SgJrF6Qf1s95gZ11rgga5hdkrLWSRh4mQ8wpH");

#[program]
pub mod escrow_simple {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        escrow_id: String,
        trader_a: Pubkey,
        trader_b: Pubkey,
        a_mint_tokens: Vec<Pubkey>,
        b_mint_tokens: Vec<Pubkey>
    ) -> Result<()> {

        let escrow_account = &mut ctx.accounts.escrow_account;

        let bump = ctx.bumps.escrow_account;

        // prevent initialization or reinitialization of in-progress escrow
        // require!(escrow_account.get_state() != Status::InProgress, EscrowErrors::InitializationFailed);

        escrow_account.init_escrow(
            escrow_id.clone(), 
            trader_a, 
            trader_b, 
            a_mint_tokens,
            b_mint_tokens,
            bump
        );

        // set 

        Ok(())
    }


    pub fn deposit_individual(ctx: Context<Deposit>) -> Result<()> {

        let escrow_account = &mut ctx.accounts.escrow_account;

        // security checks
        //require!(escrow_account.state == Status::Initialized, );
        

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::TransferChecked {
                from: ctx.accounts.initializer_ata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.vault_ata.to_account_info(),
                authority: ctx.accounts.initializer.to_account_info(),
            },
        );

        token::transfer_checked(cpi_ctx, 1, 0)
    }

    // escrow 
    pub fn withdraw_individual(ctx: Context<Withdraw>) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::TransferChecked {
                from: ctx.accounts.vault_ata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.initializer_ata.to_account_info(),
                authority: ctx.accounts.escrow_account.to_account_info(),
            },
        );

        token::transfer_checked(cpi_ctx, 1, 0)
    }

    // escrow sends funds back to original owners
    pub fn cancel_individual(ctx: Context<Cancel>) -> Result<()> {

        // require!() to make sure that the initializer was the previous owner of the NFT
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::TransferChecked {
                from: ctx.accounts.vault_ata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.initializer_ata.to_account_info(),
                authority: ctx.accounts.escrow_account.to_account_info(),
            },
        );

        token::transfer_checked(cpi_ctx, 1, 0)
    }

}

#[derive(Accounts)]
#[instruction(
    escrow_id: String,
    trader_a: Pubkey,
    trader_b: Pubkey,
    a_mint_tokens: Vec<Pubkey>,
    b_mint_tokens: Vec<Pubkey>
)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        seeds = [
            b"user-escrow".as_ref(),
            escrow_id.as_bytes(), 
            trader_a.key().as_ref(),
            trader_b.key().as_ref(),
        ],
        bump,
        payer = admin, 
        space = Escrow::LEN,
        rent_exempt = enforce
    )]
    pub escrow_account: Account<'info, Escrow>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    escrow_id: String,
    trader_a: Pubkey,
    trader_b: Pubkey,
)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            b"user-escrow".as_ref(),
            escrow_id.as_bytes(), 
            trader_a.key().as_ref(),
            trader_b.key().as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = Escrow::LEN,
        realloc::payer = initializer,
        realloc::zero = true,
        constraint = initializer.key() == trader_a || initializer.key() == trader_b,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_account
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = initializer
    )]
    pub initializer_ata: Account<'info, TokenAccount>,

    pub assoicated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    escrow_id: String,
    trader_a: Pubkey,
    trader_b: Pubkey,
)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            b"user-escrow".as_ref(),
            escrow_id.as_bytes(), 
            trader_a.key().as_ref(),
            trader_b.key().as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = Escrow::LEN,
        realloc::payer = initializer,
        realloc::zero = true,
        constraint = initializer.key() == trader_a || initializer.key() == trader_b,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_account
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = initializer
    )]
    pub initializer_ata: Account<'info, TokenAccount>,

    pub assoicated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    escrow_id: String,
    trader_a: Pubkey,
    trader_b: Pubkey,
)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            b"user-escrow".as_ref(),
            escrow_id.as_bytes(), 
            trader_a.key().as_ref(),
            trader_b.key().as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = Escrow::LEN,
        realloc::payer = initializer,
        realloc::zero = true,
        constraint = initializer.key() == trader_a || initializer.key() == trader_b,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_account
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = initializer
    )]
    pub initializer_ata: Account<'info, TokenAccount>,

    pub assoicated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Escrow {
    escrow_id: String,
    trader_a: Pubkey,
    trader_b: Pubkey,
    trader_a_mint: Vec<Pubkey>,
    trader_b_mint: Vec<Pubkey>,
    state: Status,
    bump: u8,
}

impl Escrow {
    // including the 8 byte discriminator
    // TODO: Figure max byte size for Strings (optimization)
    pub const LEN: usize = 8 + (4 + 32) + 32 + 32 + (4 + 32 * 5) + (4 + 32 * 5) + (1 + 4 + 32);

    pub fn init_escrow(
        &mut self,
        escrow_id: String, 
        actor_1: Pubkey, 
        actor_2: Pubkey,
        actor_1_mint_tokens: Vec<Pubkey>,
        actor_2_mint_tokens: Vec<Pubkey>,
        bump: u8
    ) {
        self.escrow_id = escrow_id.clone();
        self.trader_a = actor_1.clone();
        self.trader_a_mint = actor_1_mint_tokens.clone();
        self.trader_b = actor_2.clone();
        self.trader_b_mint = actor_2_mint_tokens.clone();
        self.state = Status::Initialized;
        self.bump = bump;
    }
    
    pub fn get_state(&self) -> Status {
        self.state
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum Status {
    Initialized,
    InProgress,
    Deposited,
    Cancelled,
    Finalized,
}