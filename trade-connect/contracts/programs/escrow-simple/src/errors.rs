use anchor_lang::error_code;

#[error_code]
pub enum EscrowErrors {
    #[msg("")]
    PermissionDenied,
    #[msg("Error: Initialization failed")]
    InitializationFailed,
}