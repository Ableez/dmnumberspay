#![no_std]

use core::{
    convert::{From, Into},
    marker::Copy,
    result::Result::{self, Ok, Err},
    option::Option::{self, Some},
};

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, Vec, Map, BytesN, Bytes, String,
    crypto::Hash, Error as SdkError, TryFromVal,
};

// Constants
const WEEK_OF_LEDGERS: u32 = 60 * 60 * 24 / 5 * 7;
const EVENT_TAG: Symbol = symbol_short!("SWALLET");
const ADMIN_SIGNER_COUNT: Symbol = symbol_short!("ASCOUNT");

// Data structures
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenInfo {
    pub address: Address,
    pub symbol: String,
    pub decimals: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Signature {
    pub authenticator_data: Bytes,
    pub client_data_json: Bytes,
    pub id: Bytes,
    pub signature: BytesN<64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Owner,
    Tokens,
    WalletRegistry,
}

pub trait TokenInterface {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
    fn balance(env: Env, id: Address) -> i128;
}

#[contract]
pub struct PasskeyWalletTransfer;

#[contractimpl]
impl PasskeyWalletTransfer {
    // Initialize the contract
    pub fn initialize(
        env: Env,
        owner: Address,
        supported_tokens: Vec<TokenInfo>,
    ) -> Result<(), SdkError> {
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(SdkError::from_contract_error(6)); // AlreadyInitialized
        }

        owner.require_auth();
        
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Tokens, &supported_tokens);
        
        // Initialize empty wallet registry
        let wallet_registry = Map::<Address, Map<Address, i128>>::new(&env);
        env.storage().instance().set(&DataKey::WalletRegistry, &wallet_registry);
        
        let max_ttl = env.storage().max_ttl();
        env.storage().instance().extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);
        
        Ok(())
    }

    // Register a new wallet in the system
    pub fn register_wallet(env: Env, wallet_address: Address) -> Result<(), SdkError> {
        env.current_contract_address().require_auth();
        
        let mut registry: Map<Address, Map<Address, i128>> = 
            env.storage().instance().get(&DataKey::WalletRegistry).unwrap_or(Map::new(&env));
        
        if !registry.contains_key(wallet_address.clone()) {
            let empty_balances = Map::<Address, i128>::new(&env);
            registry.set(wallet_address.clone(), empty_balances);
            env.storage().instance().set(&DataKey::WalletRegistry, &registry);
        }
        
        let max_ttl = env.storage().max_ttl();
        env.storage().instance().extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);
        
        Ok(())
    }

    // Transfer tokens between wallets
    pub fn transfer(
        env: Env,
        from_wallet: Address,
        to_wallet: Address,
        token: Address,
        amount: i128,
    ) -> Result<(), SdkError> {
        if amount <= 0 {
            return Err(SdkError::from_contract_error(3)); // InvalidAmount
        }
        
        // Require auth from the sending wallet
        from_wallet.require_auth();
        
        // Verify token is supported
        Self::require_supported_token(&env, &token)?;
        
        // Get wallet registry
        let mut registry: Map<Address, Map<Address, i128>> = 
            env.storage().instance().get(&DataKey::WalletRegistry).unwrap();
        
        // Check if both wallets exist
        if !registry.contains_key(from_wallet.clone()) || !registry.contains_key(to_wallet.clone()) {
            return Err(SdkError::from_contract_error(7)); // WalletNotFound
        }
        
        // Get wallet balances
        let mut from_balances = registry.get(from_wallet.clone()).unwrap();
        let mut to_balances = registry.get(to_wallet.clone()).unwrap();
        
        // Check sender's balance
        let from_balance = from_balances.get(token.clone()).unwrap_or(0);
        if from_balance < amount {
            return Err(SdkError::from_contract_error(8)); // InsufficientBalance
        }
        
        // Update balances
        from_balances.set(token.clone(), from_balance - amount);
        let to_balance = to_balances.get(token.clone()).unwrap_or(0);
        to_balances.set(token.clone(), to_balance + amount);
        
        // Update registry
        registry.set(from_wallet.clone(), from_balances);
        registry.set(to_wallet.clone(), to_balances);
        
        // Save updated registry
        env.storage().instance().set(&DataKey::WalletRegistry, &registry);
        
        // Extend TTL
        let max_ttl = env.storage().max_ttl();
        env.storage().instance().extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);
        
        // Publish event
        env.events().publish(
            (EVENT_TAG, symbol_short!("transfer")), 
            (from_wallet, to_wallet, token, amount)
        );
        
        Ok(())
    }
    
    // Add a key to a wallet
    pub fn add(env: Env, id: Bytes, pk: BytesN<65>, admin: bool) -> Result<(), SdkError> {
        if env.storage().instance().has(&ADMIN_SIGNER_COUNT) {
            env.current_contract_address().require_auth();   
        } else {
            // First key must be admin
            let is_admin = true;
            
            let max_ttl = env.storage().max_ttl();
            env.storage().instance().set(&ADMIN_SIGNER_COUNT, &1u32);
            env.storage().persistent().set(&id, &pk);
            env.storage().persistent().extend_ttl(&id, max_ttl - WEEK_OF_LEDGERS, max_ttl);
            env.storage().instance().extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);
            
            env.events().publish((EVENT_TAG, symbol_short!("add"), id), (pk, is_admin));
            return Ok(());
        }

        let max_ttl = env.storage().max_ttl();

        if admin {
            if env.storage().temporary().has(&id) {
                env.storage().temporary().remove(&id);
            }

            let admin_count: u32 = env.storage().instance().get(&ADMIN_SIGNER_COUNT).unwrap_or(0);
            env.storage().instance().set(&ADMIN_SIGNER_COUNT, &(admin_count + 1));

            env.storage().persistent().set(&id, &pk);
            env.storage().persistent().extend_ttl(&id, max_ttl - WEEK_OF_LEDGERS, max_ttl);
        } else {
            if env.storage().persistent().has(&id) {
                let admin_count: u32 = env.storage().instance().get(&ADMIN_SIGNER_COUNT).unwrap();
                env.storage().instance().set(&ADMIN_SIGNER_COUNT, &(admin_count - 1));
                env.storage().persistent().remove(&id);
            }

            env.storage().temporary().set(&id, &pk);
            env.storage().temporary().extend_ttl(&id, max_ttl - WEEK_OF_LEDGERS, max_ttl);
        }

        env.storage().instance().extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);
        env.events().publish((EVENT_TAG, symbol_short!("add"), id), (pk, admin));

        Ok(())
    }

    // Remove a key from a wallet
    pub fn remove(env: Env, id: Bytes) -> Result<(), SdkError> {
        env.current_contract_address().require_auth();

        if env.storage().temporary().has(&id) {
            env.storage().temporary().remove(&id);
        } else if env.storage().persistent().has(&id) {
            let admin_count: u32 = env.storage().instance().get(&ADMIN_SIGNER_COUNT).unwrap();
            if admin_count <= 1 {
                return Err(SdkError::from_contract_error(9)); // Can't remove last admin key
            }
            env.storage().instance().set(&ADMIN_SIGNER_COUNT, &(admin_count - 1));
            env.storage().persistent().remove(&id);
        } else {
            return Err(SdkError::from_contract_error(10)); // NotAuthorized
        }

        let max_ttl = env.storage().max_ttl();
        env.storage().instance().extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);
        env.events().publish((EVENT_TAG, symbol_short!("remove"), id), ());

        Ok(())
    }

    // Authentication function
    pub fn __check_auth(
        env: Env,
        signature_payload: Hash<32>,
        signature: Signature,
        auth_contexts: Vec<soroban_sdk::auth::Context>,
    ) -> Result<(), SdkError> {
        let id = signature.id.clone();
        let max_ttl = env.storage().max_ttl();
        
        // Find the public key for this ID (try temporary first, then persistent)
        let pk = match env.storage().temporary().get(&id) {
            Some(pk) => {
                // Session keys can only sign certain operations
                for context in auth_contexts.iter() {
                    if let soroban_sdk::auth::Context::Contract(c) = context {
                        if c.contract == env.current_contract_address()
                        && (
                            c.fn_name != symbol_short!("remove")
                            || (
                                c.fn_name == symbol_short!("remove") 
                                && id != Bytes::try_from_val(&env, &c.args.get(0).unwrap_or_default()).unwrap_or(Bytes::new(&env))
                            )
                        )
                    {
                        return Err(SdkError::from_contract_error(11)); // NotPermitted
                        }
                    }
                }
                env.storage().temporary().extend_ttl(&id, max_ttl - WEEK_OF_LEDGERS, max_ttl);
                pk
            }
            None => {
                env.storage().persistent().extend_ttl(&id, max_ttl - WEEK_OF_LEDGERS, max_ttl);
                env.storage().persistent().get(&id).ok_or(SdkError::from_contract_error(12))?
            }
        };
        // TODO: Add actual signature verification logic here
        Ok(())
    }

    // Helper: Get wallet balancesupported
    pub fn get_balance(env: Env, wallet: Address, token: Address) -> Result<i128, SdkError> {
        Self::require_supported_token(&env, &token)?;
        let registry: Map<Address, Map<Address, i128>> = 
            env.storage().instance().get(&DataKey::WalletRegistry).unwrap();
        if !registry.contains_key(wallet.clone()) {
            return Err(SdkError::from_contract_error(7)); // WalletNotFound
        }
        let balances = registry.get(wallet).unwrap();
        Ok(balances.get(token).unwrap_or(0))
    }
    // Helper: Get supported tokens
    // Helper: Check if token is supported-> Vec<TokenInfo> {
    fn require_supported_token(env: &Env, token: &Address) -> Result<(), SdkError> {
        let supported_tokens: Vec<TokenInfo> = 
            env.storage().instance().get(&DataKey::Tokens).unwrap_or(Vec::new(env));
        for supported_token in supported_tokens.iter() {
            if supported_token.address == *token {
                return Ok(());
            }
        }
        Err(SdkError::from_contract_error(4)) // TokenNotSupported
    }
}