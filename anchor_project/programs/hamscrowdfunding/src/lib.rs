use anchor_lang::prelude::*;
use crate::errors::Errors;

pub mod errors;

declare_id!("58ap7CEpy5CZWdvoeaGCdfgUxSR3HGXouXoPKtodSPPk");

#[program]
pub mod hamscrowdfunding {

    use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

    use super::*;

    pub fn create_campaign(_ctx: Context<CreateCampaign>, _title: String,_target: u64) -> Result<()> {
        let campaign = &mut _ctx.accounts.campaign;
        campaign.title = _title;
        campaign.creator = _ctx.accounts.creator.key();
        campaign.target = _target;
        campaign.collected = 0;
        Ok(())
    }

    pub fn contribute(_ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let campaign = &mut _ctx.accounts.campaign;
        let user = &mut _ctx.accounts.user;
        let system_program = &_ctx.accounts.system_program;

        require!( (**user.to_account_info().lamports.borrow()/LAMPORTS_PER_SOL) > amount , 
           Errors::InsufficientFunds
        );
        require!(campaign.target >= (campaign.collected + amount), Errors::MoreFunds);

        let transfer_inst = anchor_lang::solana_program::system_instruction::transfer(&user.key(), &campaign.key(), amount * LAMPORTS_PER_SOL);

        anchor_lang::solana_program::program::invoke(
            &transfer_inst,
            &[
                user.to_account_info(),
                campaign.to_account_info(),
                system_program.to_account_info(),
            ],
        )?;
        campaign.collected += amount;
        Ok(())
    }

    pub fn withdraw(_ctx: Context<Withdraw>) -> Result<()>{
        let campaign = &mut _ctx.accounts.campaign;
        let user = &mut _ctx.accounts.creator;

        require!(user.key() == campaign.creator, Errors::InvalidOwner);
        require!(campaign.target == campaign.collected, Errors::InsufficientFund);


        Ok(())
    }


}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateCampaign<'info>{
    #[account(
        init,
        seeds = [title.as_bytes(), creator.key().as_ref()],
        bump,
        payer=creator,
        space= 8 + 32 + 4 + title.len() + 8 + 8
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info,System>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut,
    close=creator)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub creator: Signer<'info>
}

#[account]
pub struct Campaign{
    pub creator: Pubkey,
    pub title: String,
    pub target: u64,
    pub collected: u64
}