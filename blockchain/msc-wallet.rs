
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, Vec, Map, String, Bytes,
};

// Contract storage keys
const OWNER: Symbol = symbol_short!("OWNER");
const BALANCES: Symbol = symbol_short!("BALANCES");
const TRUSTEES: Symbol = symbol_short!("TRUSTEES");
const FROZEN: Symbol = symbol_short!("FROZEN");

// Supported stablecoins (contract addresses will be set during deployment)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SupportedToken {
    pub address: Address,
    pub symbol: String,
    pub decimals: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WalletBalance {
    pub token_balances: Map<Address, i128>,
    pub is_frozen: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Owner,
    Balance(Address), // user address -> WalletBalance
    SupportedTokens,
    Trustees,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotAuthorized = 1,
    InsufficientBalance = 2,
    TokenNotSupported = 3,
    WalletFrozen = 4,
    InvalidAmount = 5,
    TransferFailed = 6,
}

pub trait TokenInterface {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
    fn balance(env: Env, id: Address) -> i128;
}

#[contract]
pub struct MultiStablecoinWallet;

#[contractimpl]
impl MultiStablecoinWallet {
    /// Initialize the wallet contract
    pub fn initialize(
        env: Env,
        owner: Address,
        supported_tokens: Vec<SupportedToken>,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(Error::NotAuthorized);
        }

        owner.require_auth();
        
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::SupportedTokens, &supported_tokens);
        env.storage().instance().set(&DataKey::Trustees, &Vec::<Address>::new(&env));
        
        Ok(())
    }

    /// Create a new wallet for a user
    pub fn create_wallet(env: Env, user: Address) -> Result<(), Error> {
        Self::require_auth_owner_or_trustee(&env)?;
        
        let wallet_balance = WalletBalance {
            token_balances: Map::new(&env),
            is_frozen: false,
        };
        
        env.storage().persistent().set(&DataKey::Balance(user), &wallet_balance);
        Ok(())
    }

    /// Deposit tokens into user's wallet
    pub fn deposit(
        env: Env,
        user: Address,
        token: Address,
        amount: i128,
        from: Address,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        Self::require_supported_token(&env, &token)?;
        from.require_auth();
        
        let mut wallet = Self::get_wallet_balance(&env, &user)?;
        if wallet.is_frozen {
            return Err(Error::WalletFrozen);
        }

        // Transfer tokens from user to contract
        let token_client = TokenInterface::Client::new(&env, &token);
        token_client.transfer(&from, &env.current_contract_address(), &amount);
        
        // Update user's balance
        let current_balance = wallet.token_balances.get(token.clone()).unwrap_or(0);
        wallet.token_balances.set(token, current_balance + amount);
        
        env.storage().persistent().set(&DataKey::Balance(user), &wallet);
        Ok(())
    }

    /// Withdraw tokens from user's wallet
    pub fn withdraw(
        env: Env,
        user: Address,
        token: Address,
        amount: i128,
        to: Address,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        Self::require_supported_token(&env, &token)?;
        user.require_auth();
        
        let mut wallet = Self::get_wallet_balance(&env, &user)?;
        if wallet.is_frozen {
            return Err(Error::WalletFrozen);
        }
        
        let current_balance = wallet.token_balances.get(token.clone()).unwrap_or(0);
        if current_balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        // Transfer tokens from contract to recipient
        let token_client = TokenInterface::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &to, &amount);
        
        // Update user's balance
        wallet.token_balances.set(token, current_balance - amount);
        env.storage().persistent().set(&DataKey::Balance(user), &wallet);
        
        Ok(())
    }

    /// Transfer tokens between wallets
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        token: Address,
        amount: i128,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        Self::require_supported_token(&env, &token)?;
        from.require_auth();
        
        let mut from_wallet = Self::get_wallet_balance(&env, &from)?;
        if from_wallet.is_frozen {
            return Err(Error::WalletFrozen);
        }
        
        let mut to_wallet = Self::get_wallet_balance(&env, &to)?;
        if to_wallet.is_frozen {
            return Err(Error::WalletFrozen);
        }
        
        let from_balance = from_wallet.token_balances.get(token.clone()).unwrap_or(0);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        // Update balances
        from_wallet.token_balances.set(token.clone(), from_balance - amount);
        let to_balance = to_wallet.token_balances.get(token.clone()).unwrap_or(0);
        to_wallet.token_balances.set(token.clone(), to_balance + amount);
        
        // Save updated wallets
        env.storage().persistent().set(&DataKey::Balance(from), &from_wallet);
        env.storage().persistent().set(&DataKey::Balance(to), &to_wallet);
        
        Ok(())
    }

    /// Get user's balance for a specific token
    pub fn get_balance(env: Env, user: Address, token: Address) -> Result<i128, Error> {
        Self::require_supported_token(&env, &token)?;
        let wallet = Self::get_wallet_balance(&env, &user)?;
        Ok(wallet.token_balances.get(token).unwrap_or(0))
    }

    /// Get all balances for a user
    pub fn get_all_balances(env: Env, user: Address) -> Result<Map<Address, i128>, Error> {
        let wallet = Self::get_wallet_balance(&env, &user)?;
        Ok(wallet.token_balances)
    }

    /// Freeze/unfreeze a wallet (admin only)
    pub fn set_wallet_frozen(env: Env, user: Address, frozen: bool) -> Result<(), Error> {
        Self::require_auth_owner_or_trustee(&env)?;
        
        let mut wallet = Self::get_wallet_balance(&env, &user)?;
        wallet.is_frozen = frozen;
        env.storage().persistent().set(&DataKey::Balance(user), &wallet);
        
        Ok(())
    }

    /// Add a trustee (owner only)
    pub fn add_trustee(env: Env, trustee: Address) -> Result<(), Error> {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        owner.require_auth();
        
        let mut trustees: Vec<Address> = env.storage().instance()
            .get(&DataKey::Trustees).unwrap_or(Vec::new(&env));
        
        if !trustees.contains(&trustee) {
            trustees.push_back(trustee);
            env.storage().instance().set(&DataKey::Trustees, &trustees);
        }
        
        Ok(())
    }

    /// Add supported token (owner only)
    pub fn add_supported_token(env: Env, token: SupportedToken) -> Result<(), Error> {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        owner.require_auth();
        
        let mut tokens: Vec<SupportedToken> = env.storage().instance()
            .get(&DataKey::SupportedTokens).unwrap();
        
        tokens.push_back(token);
        env.storage().instance().set(&DataKey::SupportedTokens, &tokens);
        
        Ok(())
    }

    /// Get supported tokens
    pub fn get_supported_tokens(env: Env) -> Vec<SupportedToken> {
        env.storage().instance().get(&DataKey::SupportedTokens).unwrap_or(Vec::new(&env))
    }

    // Helper functions
    fn get_wallet_balance(env: &Env, user: &Address) -> Result<WalletBalance, Error> {
        env.storage().persistent().get(&DataKey::Balance(user.clone()))
            .ok_or(Error::NotAuthorized)
    }

    fn require_supported_token(env: &Env, token: &Address) -> Result<(), Error> {
        let supported_tokens: Vec<SupportedToken> = env.storage().instance()
            .get(&DataKey::SupportedTokens).unwrap_or(Vec::new(env));
        
        for supported_token in supported_tokens.iter() {
            if supported_token.address == *token {
                return Ok(());
            }
        }
        
        Err(Error::TokenNotSupported)
    }

    fn require_auth_owner_or_trustee(env: &Env) -> Result<(), Error> {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        let trustees: Vec<Address> = env.storage().instance()
            .get(&DataKey::Trustees).unwrap_or(Vec::new(env));
        
        // Check if current context is authorized
        if env.current_contract_address() == owner {
            return Ok(());
        }
        
        for trustee in trustees.iter() {
            if env.current_contract_address() == trustee {
                return Ok(());
            }
        }
        
        Err(Error::NotAuthorized)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize_wallet() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MultiStablecoinWallet);
        let client = MultiStablecoinWalletClient::new(&env, &contract_id);
        
        let owner = Address::generate(&env);
        let tokens = Vec::new(&env);
        
        client.initialize(&owner, &tokens);
        
        // Should not be able to initialize twice
        assert!(client.try_initialize(&owner, &tokens).is_err());
    }

    #[test]
    fn test_create_and_manage_wallet() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MultiStablecoinWallet);
        let client = MultiStablecoinWalletClient::new(&env, &contract_id);
        
        let owner = Address::generate(&env);
        let user = Address::generate(&env);
        let token = Address::generate(&env);
        
        let supported_token = SupportedToken {
            address: token.clone(),
            symbol: String::from_str(&env, "USDC"),
            decimals: 6,
        };
        
        let mut tokens = Vec::new(&env);
        tokens.push_back(supported_token);
        
        client.initialize(&owner, &tokens);
        client.create_wallet(&user);
        
        // Check initial balance
        let balance = client.get_balance(&user, &token);
        assert_eq!(balance, 0);
    }
}