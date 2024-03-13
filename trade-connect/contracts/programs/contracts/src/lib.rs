use anchor_lang::prelude::*;

declare_id!("2WU9NRgMxVsFCt1B2V9btRsXDXg1QoqfAbqqnJVFVDFU");

#[program]
pub mod contracts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
