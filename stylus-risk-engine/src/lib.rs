//! Author: rbd3
//! Title: Stylus Risk Engine
//! Project: RBD Shield — Autonomous Risk-Underwriting Protocol
//! Target: Arbitrum One / Orbit / Robinhood Chain (Stylus WASM)

// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::prelude::*;

pub const BPS_DENOMINATOR: u64 = 10_000;
pub const WEIGHT_COLLATERAL: u64 = 4_000;  // 40%
pub const WEIGHT_CLAIMS: u64 = 2_500;      // 25%
pub const WEIGHT_UTILIZATION: u64 = 2_000; // 20%
pub const WEIGHT_AGE: u64 = 1_500;         // 15%
pub const SECONDS_PER_YEAR: u64 = 31_536_000;

sol! {
    #[derive(Debug, PartialEq)]
    error Unauthorized();
    #[derive(Debug, PartialEq)]
    error AlreadyInitialized();
    #[derive(Debug, PartialEq)]
    error ZeroAddress();

    event RiskScoreUpdated(address indexed agent, uint256 score, address indexed updater, uint256 timestamp);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
}

#[derive(SolidityError, Debug, PartialEq)]
pub enum RiskEngineError {
    Unauthorized(Unauthorized),
    AlreadyInitialized(AlreadyInitialized),
    ZeroAddress(ZeroAddress),
}

sol_storage! {
    #[entrypoint]
    pub struct RiskEngine {
        address admin;
        mapping(address => uint256) risk_scores;
        mapping(address => uint256) last_updated;
    }
}

#[public]
impl RiskEngine {
    /// Calculates a weighted risk score (0 to 10,000 bps) from standardized basis-point inputs.
    ///
    /// # Arguments
    /// * `collateral_ratio` - Available / Locked ratio in BPS (10,000 = 100% or higher buffer)
    /// * `claims_ratio` - Clean claims ratio in BPS (10,000 = 0 claims; 0 = fully claimed)
    /// * `utilization_ratio` - Capacity buffer in BPS (10,000 = 0% utilization; 0 = 100% full)
    /// * `age_score` - Protocol tenure in BPS (10,000 = 1 year or more)
    pub fn calculate_risk_score(
        &self,
        collateral_ratio: U256,
        claims_ratio: U256,
        utilization_ratio: U256,
        age_score: U256,
    ) -> U256 {
        Self::compute_score(collateral_ratio, claims_ratio, utilization_ratio, age_score)
    }

    /// Computes risk score directly from raw on-chain telemetry metrics
    pub fn calculate_from_raw_metrics(
        &self,
        available_collateral: U256,
        locked_collateral: U256,
        total_deposited: U256,
        total_claims_paid: U256,
        current_subscribers: U256,
        max_subscribers: U256,
        registration_age_seconds: U256,
    ) -> U256 {
        // 1. Collateral Ratio
        let collateral_bps = if locked_collateral == U256::ZERO {
            U256::from(BPS_DENOMINATOR) // No active lock -> maximum score
        } else {
            let ratio = (available_collateral * U256::from(BPS_DENOMINATOR)) / locked_collateral;
            if ratio > U256::from(BPS_DENOMINATOR) {
                U256::from(BPS_DENOMINATOR)
            } else {
                ratio
            }
        };

        // 2. Claims Ratio
        let claims_bps = if total_deposited == U256::ZERO {
            U256::ZERO
        } else if total_claims_paid >= total_deposited {
            U256::ZERO
        } else {
            let loss_ratio = (total_claims_paid * U256::from(BPS_DENOMINATOR)) / total_deposited;
            if loss_ratio >= U256::from(BPS_DENOMINATOR) {
                U256::ZERO
            } else {
                U256::from(BPS_DENOMINATOR) - loss_ratio
            }
        };

        // 3. Utilization Ratio
        let util_bps = if max_subscribers == U256::ZERO {
            U256::ZERO
        } else if current_subscribers >= max_subscribers {
            U256::ZERO
        } else {
            let used = (current_subscribers * U256::from(BPS_DENOMINATOR)) / max_subscribers;
            if used >= U256::from(BPS_DENOMINATOR) {
                U256::ZERO
            } else {
                U256::from(BPS_DENOMINATOR) - used
            }
        };

        // 4. Age Score
        let age_bps = {
            let age_scaled = (registration_age_seconds * U256::from(BPS_DENOMINATOR)) / U256::from(SECONDS_PER_YEAR);
            if age_scaled > U256::from(BPS_DENOMINATOR) {
                U256::from(BPS_DENOMINATOR)
            } else {
                age_scaled
            }
        };

        Self::compute_score(collateral_bps, claims_bps, util_bps, age_bps)
    }

    /// Initializes the admin address. Can only be called once.
    pub fn initialize(&mut self, initial_admin: Address) -> Result<(), RiskEngineError> {
        if self.admin.get() != Address::ZERO {
            return Err(RiskEngineError::AlreadyInitialized(AlreadyInitialized {}));
        }
        if initial_admin == Address::ZERO {
            return Err(RiskEngineError::ZeroAddress(ZeroAddress {}));
        }
        self.admin.set(initial_admin);
        self.vm().log(AdminTransferred {
            previousAdmin: Address::ZERO,
            newAdmin: initial_admin,
        });
        Ok(())
    }

    /// Transfers admin role to a new address. Only callable by current admin.
    pub fn transfer_admin(&mut self, new_admin: Address) -> Result<(), RiskEngineError> {
        let sender = self.vm().msg_sender();
        let current_admin = self.admin.get();
        if sender != current_admin {
            return Err(RiskEngineError::Unauthorized(Unauthorized {}));
        }
        if new_admin == Address::ZERO {
            return Err(RiskEngineError::ZeroAddress(ZeroAddress {}));
        }
        self.admin.set(new_admin);
        self.vm().log(AdminTransferred {
            previousAdmin: current_admin,
            newAdmin: new_admin,
        });
        Ok(())
    }

    /// Returns the current admin address
    pub fn get_admin(&self) -> Address {
        self.admin.get()
    }

    /// Stores the attested risk score for an agent. Restricted to admin.
    pub fn update_agent_score(&mut self, agent: Address, score: U256) -> Result<(), RiskEngineError> {
        let sender = self.vm().msg_sender();
        let admin = self.admin.get();
        if sender != admin {
            return Err(RiskEngineError::Unauthorized(Unauthorized {}));
        }
        let capped = if score > U256::from(BPS_DENOMINATOR) {
            U256::from(BPS_DENOMINATOR)
        } else {
            score
        };
        let timestamp = self.vm().block_timestamp();
        self.risk_scores.setter(agent).set(capped);
        self.last_updated.setter(agent).set(U256::from(timestamp));

        self.vm().log(RiskScoreUpdated {
            agent,
            score: capped,
            updater: sender,
            timestamp: U256::from(timestamp),
        });

        Ok(())
    }

    /// Fetches the latest stored risk score for an agent
    pub fn get_agent_score(&self, agent: Address) -> U256 {
        self.risk_scores.get(agent)
    }

    /// Internal pure helper for computing the weighted score
    fn compute_score(
        collateral_ratio: U256,
        claims_ratio: U256,
        utilization_ratio: U256,
        age_score: U256,
    ) -> U256 {
        let max_bps = U256::from(BPS_DENOMINATOR);

        let c = if collateral_ratio > max_bps { max_bps } else { collateral_ratio };
        let cl = if claims_ratio > max_bps { max_bps } else { claims_ratio };
        let u = if utilization_ratio > max_bps { max_bps } else { utilization_ratio };
        let a = if age_score > max_bps { max_bps } else { age_score };

        let weighted_sum = (c * U256::from(WEIGHT_COLLATERAL))
            + (cl * U256::from(WEIGHT_CLAIMS))
            + (u * U256::from(WEIGHT_UTILIZATION))
            + (a * U256::from(WEIGHT_AGE));

        weighted_sum / max_bps
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_perfect_agent_score() {
        let max = U256::from(BPS_DENOMINATOR);
        let score = RiskEngine::compute_score(max, max, max, max);
        assert_eq!(score, U256::from(10_000));
    }

    #[test]
    fn test_worst_agent_score() {
        let zero = U256::ZERO;
        let score = RiskEngine::compute_score(zero, zero, zero, zero);
        assert_eq!(score, U256::ZERO);
    }

    #[test]
    fn test_weights_sum_to_denominator() {
        assert_eq!(
            WEIGHT_COLLATERAL + WEIGHT_CLAIMS + WEIGHT_UTILIZATION + WEIGHT_AGE,
            BPS_DENOMINATOR
        );
    }

    #[test]
    fn test_raw_metrics_calculation() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let engine = RiskEngine::from(&vm);

        // 1000 available, 500 locked -> ratio = 100% capped
        // 1000 deposited, 100 claims -> loss = 10% -> claims_bps = 9000
        // 1 current, 10 max -> util = 10% -> util_bps = 9000
        // 182.5 days -> age_bps = 5000
        let score = engine.calculate_from_raw_metrics(
            U256::from(1000),
            U256::from(500),
            U256::from(1000),
            U256::from(100),
            U256::from(1),
            U256::from(10),
            U256::from(15_768_000), // half a year
        );

        // Expected: (10000*4000 + 9000*2500 + 9000*2000 + 5000*1500) / 10000
        // = (40_000_000 + 22_500_000 + 18_000_000 + 7_500_000) / 10000
        // = 88_000_000 / 10000 = 8800
        assert_eq!(score, U256::from(8800));
    }

    #[test]
    fn test_zero_division_guard() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let engine = RiskEngine::from(&vm);

        let score = engine.calculate_from_raw_metrics(
            U256::ZERO,
            U256::ZERO,
            U256::ZERO,
            U256::ZERO,
            U256::ZERO,
            U256::ZERO,
            U256::ZERO,
        );

        // Does not panic and produces expected default
        assert!(score <= U256::from(BPS_DENOMINATOR));
    }

    #[test]
    fn test_initialize_admin() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut engine = RiskEngine::from(&vm);
        let admin = Address::from([1u8; 20]);

        assert_eq!(engine.get_admin(), Address::ZERO);
        assert!(engine.initialize(admin).is_ok());
        assert_eq!(engine.get_admin(), admin);

        // Cannot initialize twice
        let res = engine.initialize(Address::from([2u8; 20]));
        assert_eq!(res, Err(RiskEngineError::AlreadyInitialized(AlreadyInitialized {})));
    }

    #[test]
    fn test_unauthorized_score_update_reverts() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut engine = RiskEngine::from(&vm);
        let admin = Address::from([1u8; 20]);
        let attacker = Address::from([2u8; 20]);
        let agent = Address::from([3u8; 20]);

        assert!(engine.initialize(admin).is_ok());

        // Attacker attempts to update score
        vm.set_sender(attacker);
        let res = engine.update_agent_score(agent, U256::from(5000));
        assert_eq!(res, Err(RiskEngineError::Unauthorized(Unauthorized {})));

        // Score must still be 0
        assert_eq!(engine.get_agent_score(agent), U256::ZERO);
    }

    #[test]
    fn test_authorized_score_update_succeeds() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut engine = RiskEngine::from(&vm);
        let admin = Address::from([1u8; 20]);
        let agent = Address::from([3u8; 20]);

        assert!(engine.initialize(admin).is_ok());

        // Admin updates score
        vm.set_sender(admin);
        let res = engine.update_agent_score(agent, U256::from(8500));
        assert!(res.is_ok());
        assert_eq!(engine.get_agent_score(agent), U256::from(8500));

        // Score capped to 10,000 if input > 10,000
        let res_capped = engine.update_agent_score(agent, U256::from(15000));
        assert!(res_capped.is_ok());
        assert_eq!(engine.get_agent_score(agent), U256::from(10000));
    }

    #[test]
    fn test_transfer_admin() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut engine = RiskEngine::from(&vm);
        let admin = Address::from([1u8; 20]);
        let new_admin = Address::from([2u8; 20]);
        let unauthorized = Address::from([9u8; 20]);

        assert!(engine.initialize(admin).is_ok());

        // Unauthorized caller fails
        vm.set_sender(unauthorized);
        let res = engine.transfer_admin(new_admin);
        assert_eq!(res, Err(RiskEngineError::Unauthorized(Unauthorized {})));

        // Current admin succeeds
        vm.set_sender(admin);
        assert!(engine.transfer_admin(new_admin).is_ok());
        assert_eq!(engine.get_admin(), new_admin);

        // Old admin is no longer authorized
        let res2 = engine.transfer_admin(admin);
        assert_eq!(res2, Err(RiskEngineError::Unauthorized(Unauthorized {})));
    }
}
