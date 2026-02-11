#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract_address = e.register_stellar_asset_contract(admin.clone());
    (
        token::Client::new(e, &contract_address),
        token::StellarAssetClient::new(e, &contract_address),
    )
}

#[test]
fn test_create_and_release_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let arbiter = Address::generate(&env);

    // Create token
    let (token, token_admin) = create_token_contract(&env, &buyer);
    token_admin.mint(&buyer, &1000);

    // Create escrow
    let escrow_id = client.create_escrow(&buyer, &seller, &arbiter, &100, &token.address);

    // Verify escrow was created
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.buyer, buyer);
    assert_eq!(escrow.seller, seller);
    assert_eq!(escrow.amount, 100);
    assert_eq!(escrow.released, false);

    // Release escrow
    client.release(&escrow_id);

    // Verify escrow was released
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.released, true);

    // Verify seller received funds
    assert_eq!(token.balance(&seller), 100);
}

#[test]
fn test_refund_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let arbiter = Address::generate(&env);

    // Create token
    let (token, token_admin) = create_token_contract(&env, &buyer);
    token_admin.mint(&buyer, &1000);

    let initial_buyer_balance = token.balance(&buyer);

    // Create escrow
    let escrow_id = client.create_escrow(&buyer, &seller, &arbiter, &100, &token.address);

    // Refund escrow
    client.refund(&escrow_id);

    // Verify escrow was refunded
    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.refunded, true);

    // Verify buyer received refund
    assert_eq!(token.balance(&buyer), initial_buyer_balance);
}
