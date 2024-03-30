use anchor_lang::error_code;

#[error_code]
pub enum EscrowErrors {
    #[msg("")]
    PermissionDenied,
    #[msg("Error: Initialization failed")]
    InitializationFailed,
    #[msg("Error: Cannot Withdraw, until all tokens are deposited into their respective Vault ATAs")]
    WithdrawalFailed,
    #[msg("Error: The number of remaining accounts is insufficient to update.")]
    RemainingAccountsNotSufficient,
    #[msg("Error: The oreder of remaining accounts is not valid to update.")]
    OrderIsNotValid,
    #[msg("Error: Trader is not included in escrow")]
    TraderNotIncluded,
    
}