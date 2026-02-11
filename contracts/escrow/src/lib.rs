#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Escrow(u64),
}

#[derive(Clone)]
#[contracttype]
pub struct EscrowData {
    pub buyer: Address,
    pub seller: Address,
    pub arbiter: Address,
    pub amount: i128,
    pub token: Address,
    pub released: bool,
    pub refunded: bool,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow
    /// Returns the escrow ID
    pub fn create_escrow(
        env: Env,
        buyer: Address,
        seller: Address,
        arbiter: Address,
        amount: i128,
        token: Address,
    ) -> u64 {
        buyer.require_auth();

        // Generate escrow ID based on ledger sequence
        let escrow_id = env.ledger().sequence();

        // Create escrow data
        let escrow = EscrowData {
            buyer: buyer.clone(),
            seller,
            arbiter,
            amount,
            token: token.clone(),
            released: false,
            refunded: false,
        };

        // Store escrow
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        // Transfer tokens from buyer to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        escrow_id
    }

    /// Release funds to seller
    pub fn release(env: Env, escrow_id: u64) {
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        // Only buyer or arbiter can release
        if env.invoker() != escrow.buyer && env.invoker() != escrow.arbiter {
            panic!("Not authorized");
        }

        if escrow.released {
            panic!("Already released");
        }

        if escrow.refunded {
            panic!("Already refunded");
        }

        // Require auth from caller
        env.invoker().require_auth();

        // Mark as released
        escrow.released = true;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        // Transfer to seller
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.seller, &escrow.amount);
    }

    /// Refund to buyer
    pub fn refund(env: Env, escrow_id: u64) {
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        // Only seller or arbiter can refund
        if env.invoker() != escrow.seller && env.invoker() != escrow.arbiter {
            panic!("Not authorized");
        }

        if escrow.released {
            panic!("Already released");
        }

        if escrow.refunded {
            panic!("Already refunded");
        }

        // Require auth from caller
        env.invoker().require_auth();

        // Mark as refunded
        escrow.refunded = true;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        // Transfer back to buyer
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.buyer, &escrow.amount);
    }

    /// Get escrow details
    pub fn get_escrow(env: Env, escrow_id: u64) -> EscrowData {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found")
    }
}

#[cfg(test)]
mod test;
