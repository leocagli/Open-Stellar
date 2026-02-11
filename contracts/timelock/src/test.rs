#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract_address = e.register_stellar_asset_contract(admin.clone());
    (
        token::Client::new(e, &contract_address),
        token::StellarAssetClient::new(e, &contract_address),
    )
}

#[test]
fn test_create_and_claim_order() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TimeLockContract);
    let client = TimeLockContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    // Create token
    let (token, token_admin) = create_token_contract(&env, &creator);
    token_admin.mint(&creator, &1000);

    // Set current time
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create order with unlock time in future
    let unlock_time = 2000;
    let order_id = client.create_order(&creator, &beneficiary, &100, &token.address, &unlock_time);

    // Verify order was created
    let order = client.get_order(&order_id);
    assert_eq!(order.creator, creator);
    assert_eq!(order.beneficiary, beneficiary);
    assert_eq!(order.amount, 100);
    assert_eq!(order.unlock_time, unlock_time);
    assert_eq!(order.claimed, false);

    // Verify not claimable yet
    assert_eq!(client.is_claimable(&order_id), false);

    // Advance time
    env.ledger().with_mut(|li| {
        li.timestamp = 2000;
    });

    // Verify now claimable
    assert_eq!(client.is_claimable(&order_id), true);

    // Claim order
    client.claim(&order_id);

    // Verify order was claimed
    let order = client.get_order(&order_id);
    assert_eq!(order.claimed, true);

    // Verify beneficiary received funds
    assert_eq!(token.balance(&beneficiary), 100);
}

#[test]
fn test_cancel_order() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TimeLockContract);
    let client = TimeLockContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    // Create token
    let (token, token_admin) = create_token_contract(&env, &creator);
    token_admin.mint(&creator, &1000);

    let initial_creator_balance = token.balance(&creator);

    // Set current time
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create order
    let unlock_time = 2000;
    let order_id = client.create_order(&creator, &beneficiary, &100, &token.address, &unlock_time);

    // Cancel order before unlock time
    client.cancel(&order_id);

    // Verify order was cancelled
    let order = client.get_order(&order_id);
    assert_eq!(order.claimed, true);

    // Verify creator received refund
    assert_eq!(token.balance(&creator), initial_creator_balance);
}

#[test]
#[should_panic(expected = "Funds are still locked")]
fn test_cannot_claim_before_unlock_time() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TimeLockContract);
    let client = TimeLockContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    // Create token
    let (token, token_admin) = create_token_contract(&env, &creator);
    token_admin.mint(&creator, &1000);

    // Set current time
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create order
    let unlock_time = 2000;
    let order_id = client.create_order(&creator, &beneficiary, &100, &token.address, &unlock_time);

    // Try to claim before unlock time (should panic)
    client.claim(&order_id);
}
