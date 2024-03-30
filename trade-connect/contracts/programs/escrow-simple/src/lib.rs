use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount},
};
use errors::EscrowErrors;
pub mod errors;

declare_id!("Cdazu59QUTfZquTMHZZMkdUQzqiHPGdxNb6dNjCB7VGb");

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
        let escrow_bump = ctx.bumps.escrow_account;

        let trader_a_state = &mut ctx.accounts.trader_a_state;
        let trader_a_bump = ctx.bumps.trader_a_state;

        let trader_b_state = &mut ctx.accounts.trader_b_state;
        let trader_b_bump = ctx.bumps.trader_b_state;

        let user_a_seeds = &[b"user-state", trader_a.as_ref(), &[trader_a_bump]];
        let user_b_seeds = &[b"user-state", trader_b.as_ref(), &[trader_b_bump]];

        let (trader_a_pda, _bump_a) = Pubkey::find_program_address(user_a_seeds, ctx.program_id);
        let (trader_b_pda, _bump_b) = Pubkey::find_program_address(user_b_seeds, ctx.program_id);
        
        // prevent initialization or reinitialization of in-progress escrow
        // require!(escrow_account.get_state() != Status::InProgress, EscrowErrors::InitializationFailed);

        // init trader A
        trader_a_state.init_user_escrow_state(
            escrow_id.clone(), 
            trader_a, 
            a_mint_tokens,
            trader_a_bump
        );

        // init trader B
        trader_b_state.init_user_escrow_state(
            escrow_id.clone(), 
            trader_b, 
            b_mint_tokens,
            trader_b_bump
        );

        // init shared escrow account
        escrow_account.init_escrow(
            escrow_id.clone(), 
            trader_a_pda, 
            trader_b_pda, 
            escrow_bump
        );

        Ok(())
    }


    pub fn deposit_individual(
        ctx: Context<Deposit>,
        escrow_id: String,
    ) -> Result<()> {

        let escrow_account = &ctx.accounts.escrow_account;

        // security checks
        require!(escrow_account.escrow_state == Status::Initialized, EscrowErrors::PermissionDenied);
        
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
    pub fn withdraw_individual(
        ctx: Context<Withdraw>,
        escrow_id: String,
    ) -> Result<()> {

        let escrow_account = &ctx.accounts.escrow_account;

        require!(escrow_account.escrow_state == Status::Deposited, EscrowErrors::WithdrawalFailed);

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
    pub fn cancel_individual(
        ctx: Context<Cancel>,
        escrow_id: String,
    ) -> Result<()> {

        let trader_state: &mut Account<'_, UserEscrowState> = &mut ctx.accounts.trader_state;

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

    // this is not optimized. can be imrpved greatly but im trying to rush atm
    // pass in the vault accounts in remaining accounts
    pub fn update_trader_deposit_status(ctx: Context<UpdateDepositStatus>, _depositor: Pubkey, _trader_b: Pubkey) -> Result<()> {
        
        let escrow_account = &mut ctx.accounts.escrow_account;
        
        let depositor_state: &mut Account<'_, UserEscrowState> = &mut ctx.accounts.depositor_state;
        let trader_b_state: &mut Account<'_, UserEscrowState> = &mut ctx.accounts.trader_b_state;

        assert!(escrow_account.escrow_state == Status::Initialized);
        assert!(depositor_state.state != UserStatus::Deposited);

        //let admin_key = &ctx.accounts.admin.key();
        let mint_keys =  depositor_state.trader_mint.clone();

        // ensure that length of vectors are the same
        require!(
            &ctx.remaining_accounts.len() == &mint_keys.len(),
            EscrowErrors::RemainingAccountsNotSufficient
        );

        for (account_info, mint_pubkey) in ctx.remaining_accounts.iter().zip(mint_keys.iter()) {

            // deserialize the AccountInfo into type TokenAccount
            // let buf = &mut &account_info.try_borrow_mut_data()?[..];

            // borrow the account data from the AccountInfo using try_borrow_mut_data
            let data = account_info.try_borrow_mut_data()?;
            //create a mutable reference buf to a mutable slice of the borrowed account data
            let buf = &mut &data[..];
            let token_account = TokenAccount::try_deserialize(buf)?;

            // get the derived token address
            // let derived_vault = anchor_spl::associated_token::get_associated_token_address(admin_key, mint_pubkey);

            assert!(!token_account.is_frozen());
            assert!(token_account.mint == *mint_pubkey);
            assert!(token_account.amount == 1 as u64);
        }

        // update escrow state if deposited
        depositor_state.state = UserStatus::Deposited;

        if depositor_state.state == UserStatus::Deposited && trader_b_state.state == UserStatus::Deposited {
            escrow_account.escrow_state = Status::Deposited;
        }

        Ok(())
    }

    pub fn update_trader_withdrawal_status(ctx: Context<UpdateWithdrawalStatus>, _recipient: Pubkey, _sender: Pubkey) -> Result<()> {

        let escrow_account = &mut ctx.accounts.escrow_account;

        let recipient = &mut ctx.accounts.recipient_state;
        let sender = &mut ctx.accounts.sender_state;

        assert!(escrow_account.escrow_state == Status::Deposited);
        assert!(recipient.state != UserStatus::Withdrew);

        let verify_mint_keys =  sender.trader_mint.clone();

        // ensure that length of vectors are the same
        require!(
            &ctx.remaining_accounts.len() == &verify_mint_keys.len(),
            EscrowErrors::RemainingAccountsNotSufficient
        );

        for (account_info, mint_pubkey) in ctx.remaining_accounts.iter().zip(verify_mint_keys.iter()) {

            // deserialize the AccountInfo into type TokenAccount
            // let buf = &mut &account_info.try_borrow_mut_data()?[..];

            // borrow the account data from the AccountInfo using try_borrow_mut_data
            let data = account_info.try_borrow_mut_data()?;
            //create a mutable reference buf to a mutable slice of the borrowed account data
            let buf = &mut &data[..];
            let token_account = TokenAccount::try_deserialize(buf)?;

            // get the derived token address
            // let derived_vault = anchor_spl::associated_token::get_associated_token_address(admin_key, mint_pubkey);

            assert!(!token_account.is_frozen());
            // verifies if the ata account is the same as the sender's mint key
            assert!(token_account.mint == *mint_pubkey);
            // verifies that the balance is 1 
            assert!(token_account.amount == 1 as u64);
        }

        // update escrow state if deposited
        recipient.state = UserStatus::Withdrew;

        // update global state
        if recipient.state == UserStatus::Withdrew && sender.state == UserStatus::Withdrew {
            escrow_account.escrow_state = Status::Finalized;
        }

        Ok(())
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
            b"escrow".as_ref(),
            escrow_id.as_bytes(),
        ],
        bump,
        payer = admin, 
        space = Escrow::LEN,
        rent_exempt = enforce
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        init,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            trader_a.key().as_ref(),
        ],
        bump,
        payer = admin, 
        space = UserEscrowState::LEN,
    )]
    pub trader_a_state: Account<'info, UserEscrowState>,

    #[account(
        init,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            trader_b.key().as_ref(),
        ],
        bump,
        payer = admin, 
        space = UserEscrowState::LEN,
    )]
    pub trader_b_state: Account<'info, UserEscrowState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    escrow_id: String,
)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        seeds = [
            b"escrow".as_ref(),
            escrow_id.as_bytes(),
        ],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            initializer.key().as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = initializer,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == trader_state.escrow_id && initializer.key() == trader_state.trader,
    )]
    pub trader_state: Account<'info, UserEscrowState>,

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
)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        seeds = [
            b"escrow".as_ref(),
            escrow_id.as_bytes(),
        ],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            initializer.key().as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = initializer,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == trader_state.escrow_id && initializer.key() == trader_state.trader,
    )]
    pub trader_state: Account<'info, UserEscrowState>,

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
)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        seeds = [
            b"escrow".as_ref(),
            escrow_id.as_bytes(),
        ],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            initializer.key().as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = initializer,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == trader_state.escrow_id && initializer.key() == trader_state.trader,
    )]
    pub trader_state: Account<'info, UserEscrowState>,

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
    _depositor: Pubkey,
    _trader_b: Pubkey
)]
pub struct UpdateDepositStatus<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [
            b"escrow".as_ref(),
            escrow_id.as_bytes(),
        ],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            _depositor.as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = admin,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == depositor_state.escrow_id && _depositor == depositor_state.trader,
    )]
    pub depositor_state: Account<'info, UserEscrowState>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            _trader_b.as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = admin,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == trader_b_state.escrow_id && _trader_b == trader_b_state.trader,
    )]
    pub trader_b_state: Account<'info, UserEscrowState>,

    pub assoicated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    escrow_id: String,
    _recipient: Pubkey,
    _sender: Pubkey,
)]
pub struct UpdateWithdrawalStatus<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [
            b"escrow".as_ref(),
            escrow_id.as_bytes(),
        ],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            _recipient.as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = admin,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == recipient_state.escrow_id && _recipient == recipient_state.trader,
    )]
    pub recipient_state: Account<'info, UserEscrowState>,

    #[account(
        mut,
        seeds = [
            b"user-state".as_ref(),
            escrow_id.as_bytes(), 
            _sender.as_ref(),
        ],
        bump = escrow_account.bump,
        realloc = UserEscrowState::LEN,
        realloc::payer = admin,
        realloc::zero = true,
        constraint = escrow_account.escrow_id == sender_state.escrow_id && _sender == sender_state.trader,
    )]
    pub sender_state: Account<'info, UserEscrowState>,

    pub assoicated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserEscrowState {
    escrow_id: String,
    trader: Pubkey,
    trader_mint: Vec<Pubkey>,
    state: UserStatus,
    bump: u8,
}

impl UserEscrowState {
    pub const LEN: usize = 8 + (4 + 32) + 32 + (4 + 32 * 5) + (1 + 4 + 32) + 1;

    pub fn init_user_escrow_state(
        &mut self,
        escrow_id: String, 
        actor: Pubkey, 
        actor_mint_tokens: Vec<Pubkey>,
        bump: u8
    ) {
        self.escrow_id = escrow_id.clone();
        self.trader = actor.clone();
        self.trader_mint = actor_mint_tokens.clone();
        self.state = UserStatus::Initialized;
        self.bump = bump;
    }
}

#[account]
pub struct Escrow {
    escrow_id: String,
    user_state_account_1: Pubkey,
    user_state_account_2: Pubkey,
    escrow_state: Status,
    bump: u8,
}

impl Escrow {
    // including the 8 byte discriminator
    // TODO: Figure max byte size for Strings (optimization)
    pub const LEN: usize = 8 + (4 + 32) + 32 + 32 + (1 + 4 + 32) + 1;

    pub fn init_escrow(
        &mut self,
        escrow_id: String, 
        user_state_account_1: Pubkey, 
        user_state_account_2: Pubkey,
        bump: u8
    ) {
        self.escrow_id = escrow_id.clone();
        self.user_state_account_1 = user_state_account_1.clone();
        self.user_state_account_2 = user_state_account_2.clone();
        self.escrow_state = Status::Initialized;
        self.bump = bump;
    }
    
    pub fn get_state(&self) -> Status {
        self.escrow_state
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum UserStatus {
    Initialized,
    Deposited,
    Cancelled,
    Withdrew,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy)]
pub enum Status {
    Initialized,
    Deposited,
    Cancelled,
    Finalized,
}