use anchor_lang::error_code;

#[error_code]
pub enum EscrowErrors {
    #[msg("")]
    PermissionDenied,
    #[msg("Error: EscrowAccount state is still in progress")]
    UpdateStateDenied,
    #[msg("Error: ExchangeDenied both users need to deposit")]
    ExchangeDenied,
}