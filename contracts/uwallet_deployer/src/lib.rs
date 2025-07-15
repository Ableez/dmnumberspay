// NBSWallet.rs
#![no_std]

use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    symbol_short,
    token::{ self },
    Address,
    Bytes,
    BytesN,
    Env,
    Error as SdkError,
    Symbol,
    Vec,
};

mod base64_urls;

// Constants
const WEEK_OF_LEDGERS: u32 = ((60 * 60 * 24) / 5) * 7;
const EVENT_TAG: Symbol = symbol_short!("SMWALLET");
const MAX_DAILY_LIMIT: i128 = 10_000_0000000; // $10,000 with 7 decimals
const RECOVERY_DELAY: u64 = ((60 * 60 * 24) / 5) * 7; // 1 week in ledgers

// Error codes
const ERROR_ALREADY_INITIALIZED: u32 = 1;
const ERROR_NOT_INITIALIZED: u32 = 2;
const ERROR_INVALID_AMOUNT: u32 = 3;
const ERROR_INSUFFICIENT_BALANCE: u32 = 4;
const ERROR_DAILY_LIMIT_EXCEEDED: u32 = 5;
const ERROR_UNAUTHORIZED: u32 = 6;
const ERROR_INVALID_SIGNATURE: u32 = 7;
const ERROR_RECOVERY_PENDING: u32 = 8;
const ERROR_NO_RECOVERY_PENDING: u32 = 9;
const ERROR_TOKEN_NOT_ALLOWED: u32 = 10;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PasskeyCredential {
    pub id: Bytes,
    pub public_key: BytesN<65>,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WebAuthnSignature {
    pub authenticator_data: Bytes,
    pub client_data_json: Bytes,
    pub signature: BytesN<64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DailySpending {
    pub date: u64,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transaction {
    pub from: Address,
    pub to: Address,
    pub token: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub tx_hash: Bytes,
}

#[contracttype]
pub struct Signature {
    pub authenticator_data: Bytes,
    pub client_data_json: Bytes,
    pub signature: BytesN<64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RecoveryRequest {
    pub new_passkey: PasskeyCredential,
    pub requested_at: u64,
    pub expires_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum WalletType {
    Standard,         // Allow all tokens
    SavingsOnly,      // Restricted withdrawals, focused on savings
    StableCoinsOnly,  // Only accept stable coins
    Custom,           // Custom allowed token list
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Passkey,
    DailySpending,
    Recovery,
    TransactionHistory,
    Settings,
    AllowedTokens,
    WalletType,
    Owner,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WalletSettings {
    pub daily_limit: i128,
    pub recovery_enabled: bool,
    pub created_at: u64,
}

#[contract]
pub struct NBSWallet;

#[contractimpl]
impl NBSWallet {
    /// Initialize a new smart wallet with passkey
    pub fn initialize(
        env: Env,
        owner: Address,
        passkey_id: Bytes,
        public_key: BytesN<65>,
        daily_limit: Option<i128>,
        wallet_type: WalletType,
        allowed_tokens: Option<Vec<Address>>,
    ) -> Result<(), SdkError> {
        // Check if wallet is already initialized
        if env.storage().instance().has(&DataKey::Passkey) {
            return Err(SdkError::from_contract_error(ERROR_ALREADY_INITIALIZED));
        }

        // Create initial passkey credential
        let passkey = PasskeyCredential {
            id: passkey_id.clone(),
            public_key,
            created_at: env.ledger().timestamp(),
        };

        // Set wallet settings
        let settings = WalletSettings {
            daily_limit: daily_limit.unwrap_or(MAX_DAILY_LIMIT),
            recovery_enabled: true,
            created_at: env.ledger().timestamp(),
        };

        // Store data
        env.storage().instance().set(&DataKey::Passkey, &passkey);
        env.storage().instance().set(&DataKey::Settings, &settings);
        env.storage().instance().set(&DataKey::WalletType, &wallet_type);
        env.storage().instance().set(&DataKey::Owner, &owner);

        // Store allowed tokens if provided for custom wallet type
        if wallet_type == WalletType::Custom && allowed_tokens.is_some() {
            env.storage().instance().set(&DataKey::AllowedTokens, &allowed_tokens.unwrap());
        }

        // Initialize empty transaction history
        let history = Vec::<Transaction>::new(&env);
        env.storage().instance().set(&DataKey::TransactionHistory, &history);

        // Set TTL
        let max_ttl = env.storage().max_ttl();
        env.storage()
            .instance()
            .extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);

        // Emit event
        env.events().publish(
            (EVENT_TAG, symbol_short!("init")),
            (passkey_id, env.current_contract_address())
        );

        Ok(())
    }

    /// Check if a token is allowed in this wallet
    fn is_token_allowed(&self, env: &Env, token: &Address) -> bool {
        let wallet_type: WalletType = env.storage().instance().get(&DataKey::WalletType).unwrap();
        
        match wallet_type {
            WalletType::Standard => true, // All tokens allowed
            WalletType::SavingsOnly => true, // All tokens allowed but with withdrawal restrictions
            WalletType::StableCoinsOnly => {
                // Here you would implement logic to check if the token is a stable coin
                // For now, we'll use a simplified example of checking against a list
                let stable_coins = Vec::<Address>::new(env);
                // Populate with known stable coin addresses
                // stable_coins.push_back(known_stable_coin_1);
                // stable_coins.push_back(known_stable_coin_2);
                
                stable_coins.contains(token)
            },
            WalletType::Custom => {
                if let Some(allowed_tokens) = env.storage().instance().get::<DataKey, Vec<Address>>(&DataKey::AllowedTokens) {
                    allowed_tokens.contains(token)
                } else {
                    false
                }
            }
        }
    }

    pub fn deposit(env: Env, from: Address, token: Address, amount: i128) -> Result<(), SdkError> {
        if amount <= 0 {
            return Err(SdkError::from_contract_error(ERROR_INVALID_AMOUNT));
        }

        // Require wallet initialization
        if !env.storage().instance().has(&DataKey::Passkey) {
            return Err(SdkError::from_contract_error(ERROR_NOT_INITIALIZED));
        }

        // Check if token is allowed
        if !Self::is_token_allowed(&Self, &env, &token) {
            return Err(SdkError::from_contract_error(ERROR_TOKEN_NOT_ALLOWED));
        }

        // Depositor needs to authorize the deposit
        from.require_auth();

        let wallet_address = env.current_contract_address();

        // Transfer tokens from depositor to wallet
        token::Client::new(&env, &token).transfer(&from, &wallet_address, &amount);

        // Emit event
        env.events().publish((EVENT_TAG, symbol_short!("deposit")), (from, token, amount));

        Ok(())
    }

    /// Withdraw tokens from the wallet (requires passkey authentication)
    pub fn withdraw(
        env: Env,
        token: Address,
        amount: i128,
        destination: Address
    ) -> Result<(), SdkError> {
        if amount <= 0 {
            return Err(SdkError::from_contract_error(ERROR_INVALID_AMOUNT));
        }

        // Require wallet initialization
        if !env.storage().instance().has(&DataKey::Passkey) {
            return Err(SdkError::from_contract_error(ERROR_NOT_INITIALIZED));
        }

        // Check if this wallet type allows withdrawals
        let wallet_type: WalletType = env.storage().instance().get(&DataKey::WalletType).unwrap();
        if wallet_type == WalletType::SavingsOnly {
            // For savings wallets, implement additional restrictions
            // This could be time-based restrictions, approval requirements, etc.
            // For simplicity, we're just blocking withdrawals in this example
            return Err(SdkError::from_contract_error(ERROR_UNAUTHORIZED));
        }

        // Require authentication (handled by __check_auth)
        env.current_contract_address().require_auth();

        // Check daily spending limit
        Self::check_daily_limit(&env, amount)?;

        // Check balance
        let wallet_address = env.current_contract_address();
        let balance = token::Client::new(&env, &token).balance(&wallet_address);

        if balance < amount {
            return Err(SdkError::from_contract_error(ERROR_INSUFFICIENT_BALANCE));
        }

        // Transfer tokens
        token::Client::new(&env, &token).transfer(&wallet_address, &destination, &amount);

        // Update daily spending
        Self::update_daily_spending(&env, amount)?;

        // Emit event
        env.events().publish((EVENT_TAG, symbol_short!("withdraw")), (destination, token, amount));

        Ok(())
    }

    /// Send tokens to another wallet
    pub fn send(
        env: Env,
        to_wallet: Address,
        token: Address,
        amount: i128
    ) -> Result<(), SdkError> {
        if amount <= 0 {
            return Err(SdkError::from_contract_error(ERROR_INVALID_AMOUNT));
        }

        // Require authentication
        env.current_contract_address().require_auth();

        // Check wallet type restrictions for sending
        let wallet_type: WalletType = env.storage().instance().get(&DataKey::WalletType).unwrap();
        if wallet_type == WalletType::SavingsOnly {
            // Implement savings-specific restrictions
            // For this example, we'll allow sends but with stricter daily limits
            // In a real implementation, you might have different rules
        }

        // Check daily spending limit
        Self::check_daily_limit(&env, amount)?;

        // Check balance
        let wallet_address = env.current_contract_address();
        let balance = token::Client::new(&env, &token).balance(&wallet_address);

        if balance < amount {
            return Err(SdkError::from_contract_error(ERROR_INSUFFICIENT_BALANCE));
        }

        // Transfer tokens
        token::Client::new(&env, &token).transfer(&wallet_address, &to_wallet, &amount);

        // Update daily spending
        Self::update_daily_spending(&env, amount)?;

        // Record transaction
        Self::record_transaction(&env, wallet_address, to_wallet.clone(), token.clone(), amount)?;

        // Emit event
        env.events().publish((EVENT_TAG, symbol_short!("send")), (to_wallet, token, amount));

        Ok(())
    }

    /// Get token balance
    pub fn balance(env: Env, token: Address) -> i128 {
        let wallet_address = env.current_contract_address();
        token::Client::new(&env, &token).balance(&wallet_address)
    }

    /// Get wallet owner
    pub fn get_owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }

    /// Get wallet type
    pub fn get_wallet_type(env: Env) -> WalletType {
        env.storage().instance().get(&DataKey::WalletType).unwrap()
    }

    /// Update allowed tokens (for Custom wallet type)
    pub fn update_allowed_tokens(
        env: Env,
        tokens: Vec<Address>
    ) -> Result<(), SdkError> {
        // Require authentication
        env.current_contract_address().require_auth();
        
        let wallet_type: WalletType = env.storage().instance().get(&DataKey::WalletType).unwrap();
        if wallet_type != WalletType::Custom {
            return Err(SdkError::from_contract_error(ERROR_UNAUTHORIZED));
        }
        
        env.storage().instance().set(&DataKey::AllowedTokens, &tokens);
        
        Ok(())
    }

    /// Check if a token is allowed in this wallet (public)
    pub fn check_token_allowed(env: Env, token: Address) -> bool {
        Self::is_token_allowed(&Self, &env, &token)
    }

    /// Get current daily spending
    pub fn get_daily_spending(env: Env) -> i128 {
        let today = env.ledger().timestamp() / (24 * 60 * 60);

        if let Some(spending) = env
            .storage()
            .instance()
            .get::<DataKey, DailySpending>(&DataKey::DailySpending)
        {
            if spending.date == today {
                return spending.amount;
            }
        }

        0
    }

    // Helper functions
    fn check_daily_limit(env: &Env, amount: i128) -> Result<(), SdkError> {
        let settings: WalletSettings = env
            .storage()
            .instance()
            .get(&DataKey::Settings)
            .ok_or(SdkError::from_contract_error(ERROR_NOT_INITIALIZED))?;

        let current_spending = Self::get_daily_spending(env.clone());

        // For savings wallets, apply stricter limits
        let wallet_type: WalletType = env.storage().instance().get(&DataKey::WalletType).unwrap();
        let effective_limit = if wallet_type == WalletType::SavingsOnly {
            // Apply a 50% reduction to daily limit for savings wallets
            settings.daily_limit / 2
        } else {
            settings.daily_limit
        };

        if current_spending + amount > effective_limit {
            return Err(SdkError::from_contract_error(ERROR_DAILY_LIMIT_EXCEEDED));
        }

        Ok(())
    }

    fn update_daily_spending(env: &Env, amount: i128) -> Result<(), SdkError> {
        let today = env.ledger().timestamp() / (24 * 60 * 60);
        let current_spending = Self::get_daily_spending(env.clone());

        let new_spending = DailySpending {
            date: today,
            amount: current_spending + amount,
        };

        env.storage().instance().set(&DataKey::DailySpending, &new_spending);
        Ok(())
    }

    fn record_transaction(
        env: &Env,
        from: Address,
        to: Address,
        token: Address,
        amount: i128
    ) -> Result<(), SdkError> {
        let mut history: Vec<Transaction> = env
            .storage()
            .instance()
            .get(&DataKey::TransactionHistory)
            .unwrap_or(Vec::new(env));

        let tx = Transaction {
            from,
            to,
            token,
            amount,
            timestamp: env.ledger().timestamp(),
            tx_hash: Bytes::new(env), // TODO: Get actual transaction hash
        };

        history.push_back(tx);

        // Keep only last 50 transactions
        if history.len() > 50 {
            history.pop_front();
        }

        env.storage().instance().set(&DataKey::TransactionHistory, &history);
        Ok(())
    }
}