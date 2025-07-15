#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, IntoVal,
    Address, Bytes, BytesN, Env, Error as SdkError, Symbol, Vec, Val,
};

// Constants - shortened to max 9 characters
const ADMIN: Symbol = symbol_short!("admin");
const WAL_WASM: Symbol = symbol_short!("walwasm");
const EVENT_TAG: Symbol = symbol_short!("USRMGR");

// Error codes
const ERROR_ALREADY_REGISTERED: u32 = 1;
const ERROR_NOT_FOUND: u32 = 2;
const ERROR_UNAUTHORIZED: u32 = 3;
const ERROR_INVALID_WASM: u32 = 4;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct User {
    pub user_id: Bytes,
    pub wallets: Vec<Address>,
    pub primary_wallet: Option<Address>,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum WalletType {
    Standard,
    SavingsOnly,
    StableCoinsOnly,
    Custom,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Users(Bytes),         // Map of user_id -> User
    UserByWallet(Address), // Map of wallet_address -> user_id
    WalletTypes(Address),  // Map of wallet_address -> WalletType
}

#[contract]
pub struct UserManager;

#[contractimpl]
impl UserManager {
    /// Constructor - initialize with admin and wallet WASM hash
    pub fn __constructor(env: Env, admin: Address, wallet_wasm_hash: BytesN<32>) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&WAL_WASM, &wallet_wasm_hash);
    }

    /// Register a new user and automatically deploy their first wallet
    pub fn register_user(
        env: Env,
        user_id: Bytes,
        passkey_id: Bytes,
        public_key: BytesN<65>,
        daily_limit: Option<i128>,
        wallet_type: WalletType,
    ) -> Result<Address, SdkError> {
        // Check if user already exists
        if env.storage().instance().has(&DataKey::Users(user_id.clone())) {
            return Err(SdkError::from_contract_error(ERROR_ALREADY_REGISTERED));
        }

        // Create new user record
        let user = User {
            user_id: user_id.clone(),
            wallets: Vec::new(&env),
            primary_wallet: None,
            created_at: env.ledger().timestamp(),
        };

        // Get wallet WASM hash
        let wallet_wasm: BytesN<32> = env.storage().instance().get(&WAL_WASM)
            .ok_or(SdkError::from_contract_error(ERROR_INVALID_WASM))?;

        // Generate a unique salt for the contract deployment
        // Using user_id as part of the salt ensures uniqueness
        let hash = env.crypto().sha256(&user_id);
        // Convert Hash<32> to BytesN<32>
        let salt_data = BytesN::<32>::from_array(&env, &hash.to_array());
        
        // Deploy wallet contract
        let wallet_address = Self::deploy_wallet(
            &env,
            &wallet_wasm,
            &salt_data,
            &passkey_id,
            &public_key,
            daily_limit,
            &wallet_type,
        )?;

        // Update user record with new wallet
        let mut updated_user = user;
        updated_user.wallets.push_back(wallet_address.clone());
        updated_user.primary_wallet = Some(wallet_address.clone());

        // Store user data
        env.storage().instance().set(&DataKey::Users(user_id.clone()), &updated_user);
        
        // Store reverse lookup
        env.storage().instance().set(&DataKey::UserByWallet(wallet_address.clone()), &user_id);
        
        // Store wallet type
        env.storage().instance().set(&DataKey::WalletTypes(wallet_address.clone()), &wallet_type);

        // Emit event
        env.events().publish(
            (EVENT_TAG, symbol_short!("register")),
            (user_id, wallet_address.clone())
        );

        Ok(wallet_address)
    }

    /// Deploy a wallet contract (static helper method)
    fn deploy_wallet(
        env: &Env,
        wasm_hash: &BytesN<32>,
        salt: &BytesN<32>,
        passkey_id: &Bytes,
        public_key: &BytesN<65>,
        daily_limit: Option<i128>,
        wallet_type: &WalletType,
    ) -> Result<Address, SdkError> {
        // Prepare constructor arguments for the wallet
        let mut constructor_args = Vec::<Val>::new(env);
        
        // Add arguments to the constructor
        constructor_args.push_back(passkey_id.clone().into_val(env)); 
        constructor_args.push_back(public_key.clone().into_val(env));
        
        // Handle optional daily limit
        match daily_limit {
            Some(limit) => constructor_args.push_back(limit.into_val(env)),
            None => constructor_args.push_back(().into_val(env)),  // None value
        }

        // Deploy the contract
        let deployed_address = env
            .deployer()
            .with_current_contract(salt.clone())
            .deploy_v2(wasm_hash.clone(), constructor_args);

        Ok(deployed_address)
    }

    /// Create an additional wallet for an existing user
    pub fn create_wallet(
        env: Env,
        user_id: Bytes,
        passkey_id: Bytes,
        public_key: BytesN<65>,
        daily_limit: Option<i128>,
        wallet_type: WalletType,
        set_as_primary: bool,
    ) -> Result<Address, SdkError> {
        // Get user record
        let mut user: User = env
            .storage()
            .instance()
            .get(&DataKey::Users(user_id.clone()))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))?;

        // Get wallet WASM hash
        let wallet_wasm: BytesN<32> = env.storage().instance().get(&WAL_WASM)
            .ok_or(SdkError::from_contract_error(ERROR_INVALID_WASM))?;

        // Create a unique salt based on user ID and wallet count
        let mut salt_input = Bytes::new(&env);
        salt_input.append(&user_id);
        
        // Add wallet count to make the salt unique
        let wallet_count = user.wallets.len();
        // Append a byte representing wallet count (simplified)
        if wallet_count > 0 {
            let count_byte = (wallet_count % 255) as u8;
            let count_bytes = Bytes::from_array(&env, &[count_byte]);
            salt_input.append(&count_bytes);
        }
        
        // Create a unique salt from hash
        let hash = env.crypto().sha256(&salt_input);
        // Convert Hash<32> to BytesN<32>
        let salt = BytesN::<32>::from_array(&env, &hash.to_array());

        // Deploy wallet contract
        let wallet_address = Self::deploy_wallet(
            &env,
            &wallet_wasm,
            &salt,
            &passkey_id,
            &public_key,
            daily_limit,
            &wallet_type,
        )?;

        // Update user record
        user.wallets.push_back(wallet_address.clone());
        
        // Set as primary if requested
        if set_as_primary {
            user.primary_wallet = Some(wallet_address.clone());
        }

        // Update storage
        env.storage().instance().set(&DataKey::Users(user_id.clone()), &user);
        env.storage().instance().set(&DataKey::UserByWallet(wallet_address.clone()), &user_id);
        env.storage().instance().set(&DataKey::WalletTypes(wallet_address.clone()), &wallet_type);

        // Emit event
        env.events().publish(
            (EVENT_TAG, symbol_short!("newwlt")), // shortened to fit 9 char limit
            (user_id, wallet_address.clone())
        );

        Ok(wallet_address)
    }

    /// Get user data
    pub fn get_user(env: Env, user_id: Bytes) -> Result<User, SdkError> {
        env.storage()
            .instance()
            .get(&DataKey::Users(user_id))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))
    }

    /// Get user ID from wallet address
    pub fn get_user_by_wallet(env: Env, wallet_address: Address) -> Result<Bytes, SdkError> {
        env.storage()
            .instance()
            .get(&DataKey::UserByWallet(wallet_address))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))
    }

    /// Get wallet type
    pub fn get_wallet_type(env: Env, wallet_address: Address) -> Result<WalletType, SdkError> {
        env.storage()
            .instance()
            .get(&DataKey::WalletTypes(wallet_address))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))
    }

    /// Set primary wallet
    pub fn set_primary_wallet(
        env: Env,
        user_id: Bytes,
        wallet_address: Address,
    ) -> Result<(), SdkError> {
        let mut user: User = env
            .storage()
            .instance()
            .get(&DataKey::Users(user_id.clone()))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))?;

        // Verify the wallet belongs to this user
        if !user.wallets.contains(&wallet_address) {
            return Err(SdkError::from_contract_error(ERROR_UNAUTHORIZED));
        }

        user.primary_wallet = Some(wallet_address.clone());
        env.storage().instance().set(&DataKey::Users(user_id.clone()), &user);

        // Emit event
        env.events().publish(
            (EVENT_TAG, symbol_short!("priwlt")), // shortened to fit 9 char limit
            (user_id, wallet_address)
        );

        Ok(())
    }

    /// Update wallet WASM hash (admin only)
    pub fn update_wallet_wasm(
        env: Env,
        new_wasm_hash: BytesN<32>,
    ) -> Result<(), SdkError> {
        // Verify admin
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();

        env.storage().instance().set(&WAL_WASM, &new_wasm_hash);
        Ok(())
    }

    /// Get all wallets for a user
    pub fn get_user_wallets(env: Env, user_id: Bytes) -> Result<Vec<Address>, SdkError> {
        let user: User = env
            .storage()
            .instance()
            .get(&DataKey::Users(user_id))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))?;

        Ok(user.wallets)
    }

    /// Get primary wallet for a user
    pub fn get_primary_wallet(env: Env, user_id: Bytes) -> Result<Address, SdkError> {
        let user: User = env
            .storage()
            .instance()
            .get(&DataKey::Users(user_id))
            .ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))?;

        user.primary_wallet.ok_or(SdkError::from_contract_error(ERROR_NOT_FOUND))
    }
}