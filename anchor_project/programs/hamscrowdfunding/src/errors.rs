use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Cannot contribute, InsufficientFunds")]
    InsufficientFunds,
    #[msg("Cannot withdraw, Only owner is allowed to withdraw Funds")]
    InvalidOwner,
    #[msg("Cannot withdraw, Target not yet reached!")]
    InsufficientFund,
    #[msg("Cannot contribute, More Fund than Needed")]
    MoreFunds

}