use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

pub fn convert_account_info_to_buffer(account_info: &AccountInfo) -> Result<Vec<u8>, std::io::Error> {
    let account_data = account_info.try_borrow_data()?;
    let account = TokenAccount::try_from_slice(&account_data)?;

    let mut account_buffer = Vec::new();
    account.serialize(&mut account_buffer)?;

    Ok(account_buffer)
}