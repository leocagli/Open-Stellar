#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Order(u64),
}

#[derive(Clone)]
#[contracttype]
pub struct TimeLockOrder {
    pub creator: Address,
    pub beneficiary: Address,
    pub amount: i128,
    pub token: Address,
    pub unlock_time: u64,
    pub claimed: bool,
}

#[contract]
pub struct TimeLockContract;

#[contractimpl]
impl TimeLockContract {
    /// Create a time-locked order using claimable balance concept
    /// Returns the order ID
    pub fn create_order(
        env: Env,
        creator: Address,
        beneficiary: Address,
        amount: i128,
        token: Address,
        unlock_time: u64,
    ) -> u64 {
        creator.require_auth();

        // Verify unlock time is in the future
        let current_time = env.ledger().timestamp();
        if unlock_time <= current_time {
            panic!("Unlock time must be in the future");
        }

        // Generate order ID
        let order_id = env.ledger().sequence();

        // Create order data
        let order = TimeLockOrder {
            creator: creator.clone(),
            beneficiary,
            amount,
            token: token.clone(),
            unlock_time,
            claimed: false,
        };

        // Store order
        env.storage()
            .persistent()
            .set(&DataKey::Order(order_id), &order);

        // Transfer tokens from creator to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&creator, &env.current_contract_address(), &amount);

        order_id
    }

    /// Claim the time-locked funds (can only be done after unlock_time)
    pub fn claim(env: Env, order_id: u64) {
        let mut order: TimeLockOrder = env
            .storage()
            .persistent()
            .get(&DataKey::Order(order_id))
            .expect("Order not found");

        // Verify beneficiary is calling
        if env.invoker() != order.beneficiary {
            panic!("Only beneficiary can claim");
        }

        order.beneficiary.require_auth();

        // Verify unlock time has passed
        let current_time = env.ledger().timestamp();
        if current_time < order.unlock_time {
            panic!("Funds are still locked");
        }

        // Verify not already claimed
        if order.claimed {
            panic!("Already claimed");
        }

        // Mark as claimed
        order.claimed = true;
        env.storage()
            .persistent()
            .set(&DataKey::Order(order_id), &order);

        // Transfer to beneficiary
        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(
            &env.current_contract_address(),
            &order.beneficiary,
            &order.amount,
        );
    }

    /// Cancel order before unlock time (only creator can cancel)
    pub fn cancel(env: Env, order_id: u64) {
        let mut order: TimeLockOrder = env
            .storage()
            .persistent()
            .get(&DataKey::Order(order_id))
            .expect("Order not found");

        // Verify creator is calling
        if env.invoker() != order.creator {
            panic!("Only creator can cancel");
        }

        order.creator.require_auth();

        // Verify not claimed
        if order.claimed {
            panic!("Already claimed");
        }

        // Verify unlock time has not passed
        let current_time = env.ledger().timestamp();
        if current_time >= order.unlock_time {
            panic!("Cannot cancel after unlock time");
        }

        // Mark as claimed to prevent further actions
        order.claimed = true;
        env.storage()
            .persistent()
            .set(&DataKey::Order(order_id), &order);

        // Refund to creator
        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(&env.current_contract_address(), &order.creator, &order.amount);
    }

    /// Get order details
    pub fn get_order(env: Env, order_id: u64) -> TimeLockOrder {
        env.storage()
            .persistent()
            .get(&DataKey::Order(order_id))
            .expect("Order not found")
    }

    /// Check if order is claimable
    pub fn is_claimable(env: Env, order_id: u64) -> bool {
        let order: TimeLockOrder = env
            .storage()
            .persistent()
            .get(&DataKey::Order(order_id))
            .expect("Order not found");

        let current_time = env.ledger().timestamp();
        !order.claimed && current_time >= order.unlock_time
    }
}

#[cfg(test)]
mod test;
