#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub struct EscrowDeal {
    pub payer: Address,
    pub payee: Address,
    pub amount: i128,
    pub released: bool,
    pub disputed: bool,
    pub metadata: String,
}

#[contract]
pub struct StellarEscrow;

#[contractimpl]
impl StellarEscrow {
    pub fn create(env: Env, deal_id: u64, payer: Address, payee: Address, amount: i128, metadata: String) {
        payer.require_auth();
        let deal = EscrowDeal {
            payer,
            payee,
            amount,
            released: false,
            disputed: false,
            metadata,
        };
        env.storage().instance().set(&deal_id, &deal);
    }

    pub fn release(env: Env, deal_id: u64, payer: Address) {
        payer.require_auth();
        let mut deal: EscrowDeal = env.storage().instance().get(&deal_id).unwrap();
        if deal.payer != payer {
            panic!("only payer");
        }
        if deal.released || deal.disputed {
            panic!("invalid state");
        }
        deal.released = true;
        env.storage().instance().set(&deal_id, &deal);
    }

    pub fn dispute(env: Env, deal_id: u64, actor: Address) {
        actor.require_auth();
        let mut deal: EscrowDeal = env.storage().instance().get(&deal_id).unwrap();
        if actor != deal.payer && actor != deal.payee {
            panic!("forbidden");
        }
        if deal.released {
            panic!("already released");
        }
        deal.disputed = true;
        env.storage().instance().set(&deal_id, &deal);
    }

    pub fn get(env: Env, deal_id: u64) -> EscrowDeal {
        env.storage().instance().get(&deal_id).unwrap()
    }
}
