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
const EVENT_TAG: Symbol = symbol_short!("NBSWALLET");
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

// Data structures
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
pub enum DataKey {
    Passkey,
    DailySpending,
    Recovery,
    TransactionHistory,
    Settings,
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
    /// Initialize a new mobile banking wallet with passkey
    pub fn initialize(
        env: Env,
        passkey_id: Bytes,
        public_key: BytesN<65>,
        daily_limit: Option<i128>
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

    pub fn deposit(env: Env, from: Address, token: Address, amount: i128) -> Result<(), SdkError> {
        if amount <= 0 {
            return Err(SdkError::from_contract_error(ERROR_INVALID_AMOUNT));
        }

        // Require wallet initialization
        if !env.storage().instance().has(&DataKey::Passkey) {
            return Err(SdkError::from_contract_error(ERROR_NOT_INITIALIZED));
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

    /// Send tokens to another mobile wallet
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

    /// Update passkey (for device migration)
    pub fn update_passkey(
        env: Env,
        new_passkey_id: Bytes,
        new_public_key: BytesN<65>
    ) -> Result<(), SdkError> {
        // Require authentication with current passkey
        env.current_contract_address().require_auth();

        let new_passkey = PasskeyCredential {
            id: new_passkey_id.clone(),
            public_key: new_public_key,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Passkey, &new_passkey);

        // Extend TTL
        let max_ttl = env.storage().max_ttl();
        env.storage()
            .instance()
            .extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);

        // Emit event
        env.events().publish((EVENT_TAG, symbol_short!("put_key")), new_passkey_id);

        Ok(())
    }

    /// Initiate recovery process
    pub fn initiate_recovery(
        env: Env,
        new_passkey_id: Bytes,
        new_public_key: BytesN<65>
    ) -> Result<(), SdkError> {
        let settings: WalletSettings = env
            .storage()
            .instance()
            .get(&DataKey::Settings)
            .ok_or(SdkError::from_contract_error(ERROR_NOT_INITIALIZED))?;

        if !settings.recovery_enabled {
            return Err(SdkError::from_contract_error(ERROR_UNAUTHORIZED));
        }

        let new_passkey = PasskeyCredential {
            id: new_passkey_id.clone(),
            public_key: new_public_key,
            created_at: env.ledger().timestamp(),
        };

        let recovery_request = RecoveryRequest {
            new_passkey: new_passkey.clone(),
            requested_at: env.ledger().timestamp(),
            expires_at: env.ledger().timestamp() + RECOVERY_DELAY,
        };

        env.storage().instance().set(&DataKey::Recovery, &recovery_request);

        // Emit event
        env.events().publish((EVENT_TAG, symbol_short!("reco_init")), new_passkey_id);

        Ok(())
    }

    /// Complete recovery process
    pub fn complete_recovery(env: Env) -> Result<(), SdkError> {
        let recovery_request: RecoveryRequest = env
            .storage()
            .instance()
            .get(&DataKey::Recovery)
            .ok_or(SdkError::from_contract_error(ERROR_NO_RECOVERY_PENDING))?;

        if env.ledger().timestamp() < recovery_request.expires_at {
            return Err(SdkError::from_contract_error(ERROR_RECOVERY_PENDING));
        }

        // Update passkey
        env.storage().instance().set(&DataKey::Passkey, &recovery_request.new_passkey);

        // Remove recovery request
        env.storage().instance().remove(&DataKey::Recovery);

        // Emit event
        env.events().publish(
            (EVENT_TAG, symbol_short!("complete")),
            recovery_request.new_passkey.id
        );

        Ok(())
    }

    /// Get current daily spending
    pub fn get_daily_spending(env: Env) -> i128 {
        let today = env.ledger().timestamp() / (24 * 60 * 60);

        if
            let Some(spending) = env
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

    /// Get transaction history (last 50 transactions)
    pub fn get_transaction_history(env: Env) -> Vec<Transaction> {
        env.storage().instance().get(&DataKey::TransactionHistory).unwrap_or(Vec::new(&env))
    }

    /// WebAuthn signature verification
    pub fn __check_auth(env: Env, signature: WebAuthnSignature) -> Result<(), SdkError> {
        // Get current passkey
        let passkey: PasskeyCredential = env
            .storage()
            .instance()
            .get(&DataKey::Passkey)
            .ok_or(SdkError::from_contract_error(ERROR_NOT_INITIALIZED))?;

        // 1. Verify the signature against the public key
        // Create the client data hash (SHA-256 of the client_data_json)
        let client_data_hash = env.crypto().sha256(&signature.client_data_json);

        // Create the message that was signed (concatenate authenticator_data and client_data_hash)
        let mut message = Bytes::new(&env);
        message.append(&signature.authenticator_data);
        message.extend_from_array(&client_data_hash.to_array());

        // Hash the message to get the final verification data
        let verification_data = env.crypto().sha256(&message);

        // Verify the signature using secp256r1 (P-256)
        env.crypto().secp256r1_verify(
            &passkey.public_key,
            &verification_data,
            &signature.signature
        );

        // 2. Extract and verify the challenge from client_data_json
        // In a real implementation, we would properly parse the JSON
        // For now, we'll do a basic check that the client_data_json contains data
        if signature.client_data_json.len() == 0 {
            return Err(SdkError::from_contract_error(ERROR_INVALID_SIGNATURE));
        }

        // 3. Verify the authenticator_data
        // Check minimum length for authenticator_data
        if signature.authenticator_data.len() < 37 {
            return Err(SdkError::from_contract_error(ERROR_INVALID_SIGNATURE));
        }

        // Check user presence flag (bit 0 of the flags byte)
        let flags_byte = signature.authenticator_data.get(32).unwrap_or(0);
        let user_present = (flags_byte & 0x01) != 0;

        if !user_present {
            return Err(SdkError::from_contract_error(ERROR_INVALID_SIGNATURE));
        }

        // Extend TTL on successful auth
        let max_ttl = env.storage().max_ttl();
        env.storage()
            .instance()
            .extend_ttl(max_ttl - WEEK_OF_LEDGERS, max_ttl);

        Ok(())
    }
    // Helper functions

    fn check_daily_limit(env: &Env, amount: i128) -> Result<(), SdkError> {
        let settings: WalletSettings = env
            .storage()
            .instance()
            .get(&DataKey::Settings)
            .ok_or(SdkError::from_contract_error(ERROR_NOT_INITIALIZED))?;

        let current_spending = Self::get_daily_spending(env.clone());

        if current_spending + amount > settings.daily_limit {
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
