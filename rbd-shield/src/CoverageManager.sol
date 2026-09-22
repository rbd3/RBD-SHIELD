// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Coverage Manager Contract
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RBDShieldCore} from "./core/RBDShieldCore.sol";
import {ICoverageManager} from "./interfaces/ICoverageManager.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {IClaimsProcessor} from "./interfaces/IClaimsProcessor.sol";
import {Constants} from "./libraries/Constants.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

/**
 * @title CoverageManager
 * @author rbd3
 * @notice Manages parametric SLA bond terms, subscriber policy issuance, premium collection, and expiration lifecycle
 */
contract CoverageManager is RBDShieldCore, ReentrancyGuard, ICoverageManager {
    using SafeERC20 for IERC20;

    /// @notice The collateral and premium currency token (USDC)
    IERC20 public immutable COLLATERAL_TOKEN;

    /// @notice Vault manager contract reference
    IVaultManager public vaultManager;

    /// @notice Agent registry contract reference
    IAgentRegistry public agentRegistry;

    /// @notice Claims processor contract reference
    IClaimsProcessor public claimsProcessor;

    /// @notice Protocol treasury recipient for fees
    address public treasury;

    /// @notice Protocol fee in basis points (e.g., 250 = 2.5%)
    uint256 public protocolFeeBps;

    /// @notice Next term identifier counter
    uint256 public nextTermId = 1;

    /// @notice Next policy identifier counter
    uint256 public nextPolicyId = 1;

    /// @dev Mapping from termId to CoverageTerm
    mapping(uint256 => CoverageTerm) private _terms;

    /// @dev Mapping from policyId to Policy
    mapping(uint256 => Policy) private _policies;

    /// @dev Mapping of agent address to array of created termIds
    mapping(address => uint256[]) private _agentTermIds;

    /// @dev Mapping of user address to array of purchased policyIds
    mapping(address => uint256[]) private _userPolicyIds;

    /**
     * @notice Initializes the CoverageManager
     * @param admin Initial protocol admin address
     * @param collateralTokenAddress Address of the collateral/premium token (USDC)
     * @param treasuryAddress Protocol treasury address for fee accumulation
     * @param vaultManagerAddress VaultManager address
     * @param agentRegistryAddress AgentRegistry address
     */
    constructor(
        address admin,
        address collateralTokenAddress,
        address treasuryAddress,
        address vaultManagerAddress,
        address agentRegistryAddress
    ) RBDShieldCore(admin) {
        if (collateralTokenAddress == address(0) || treasuryAddress == address(0)) {
            revert Errors.ZeroAddress();
        }
        COLLATERAL_TOKEN = IERC20(collateralTokenAddress);
        treasury = treasuryAddress;
        protocolFeeBps = Constants.DEFAULT_PROTOCOL_FEE_BPS;

        if (vaultManagerAddress != address(0)) {
            vaultManager = IVaultManager(vaultManagerAddress);
        }
        if (agentRegistryAddress != address(0)) {
            agentRegistry = IAgentRegistry(agentRegistryAddress);
        }
    }

    /**
     * @notice Sets the VaultManager and AgentRegistry addresses
     */
    function setDependencies(address vaultManagerAddress, address agentRegistryAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (vaultManagerAddress == address(0) || agentRegistryAddress == address(0)) {
            revert Errors.ZeroAddress();
        }
        vaultManager = IVaultManager(vaultManagerAddress);
        agentRegistry = IAgentRegistry(agentRegistryAddress);
    }

    /**
     * @notice Updates the protocol fee in basis points
     */
    function setProtocolFeeBps(uint256 newFeeBps) external onlyRole(RISK_ADMIN_ROLE) {
        protocolFeeBps = newFeeBps;
    }

    /**
     * @notice Updates the treasury address
     */
    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert Errors.ZeroAddress();
        treasury = newTreasury;
    }

    /**
     * @notice Updates the claims processor address
     */
    function setClaimsProcessor(address claimsProcessorAddress) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (claimsProcessorAddress == address(0)) revert Errors.ZeroAddress();
        claimsProcessor = IClaimsProcessor(claimsProcessorAddress);
        emit Events.ClaimsProcessorUpdated(claimsProcessorAddress);
    }

    /**
     * @notice Creates a new parametric coverage term by an active agent
     */
    function createTerm(
        string calldata description,
        uint256 premiumAmount,
        uint256 maxPayout,
        uint256 duration,
        uint256 maxSubscribers
    ) external override whenNotPaused returns (uint256 termId) {
        if (address(agentRegistry) == address(0)) revert Errors.DependencyNotInitialized();
        if (!agentRegistry.isActiveAgent(msg.sender)) {
            revert Errors.AgentNotActive(msg.sender);
        }
        if (duration < Constants.MIN_COVERAGE_DURATION || duration > Constants.MAX_COVERAGE_DURATION) {
            revert Errors.InvalidDuration(duration);
        }
        if (maxPayout == 0) revert Errors.InvalidMaxPayout(maxPayout);
        if (maxSubscribers == 0) revert Errors.MaxSubscribersReached(0, 0);

        termId = nextTermId++;
        _terms[termId] = CoverageTerm({
            termId: termId,
            agent: msg.sender,
            description: description,
            premiumAmount: premiumAmount,
            maxPayout: maxPayout,
            duration: duration,
            maxSubscribers: maxSubscribers,
            currentSubscribers: 0,
            active: true
        });

        _agentTermIds[msg.sender].push(termId);

        emit Events.TermCreated(termId, msg.sender, maxPayout, premiumAmount, duration, maxSubscribers);
    }

    /**
     * @notice Activates or deactivates a coverage term
     */
    function setTermStatus(uint256 termId, bool active) external override {
        CoverageTerm storage term = _terms[termId];
        if (term.termId == 0) revert Errors.TermDoesNotExist(termId);
        if (msg.sender != term.agent && !hasRole(RISK_ADMIN_ROLE, msg.sender)) {
            revert Errors.Unauthorized();
        }

        term.active = active;
        emit Events.TermStatusUpdated(termId, active);
    }

    /**
     * @notice Purchases a coverage policy under a specified term
     * @param termId ID of the coverage term to subscribe to
     */
    function purchaseCoverage(uint256 termId) external override whenNotPaused nonReentrant returns (uint256 policyId) {
        CoverageTerm storage term = _terms[termId];
        if (term.termId == 0) revert Errors.TermDoesNotExist(termId);
        if (!term.active) revert Errors.TermNotActive(termId);

        if (address(agentRegistry) == address(0) || address(vaultManager) == address(0)) {
            revert Errors.DependencyNotInitialized();
        }
        if (!agentRegistry.isActiveAgent(term.agent)) {
            revert Errors.AgentNotActive(term.agent);
        }

        if (term.currentSubscribers >= term.maxSubscribers) {
            revert Errors.MaxSubscribersReached(term.currentSubscribers, term.maxSubscribers);
        }

        // Collect premium if specified
        if (term.premiumAmount > 0) {
            uint256 fee = (term.premiumAmount * protocolFeeBps) / Constants.BPS_DENOMINATOR;
            uint256 agentShare = term.premiumAmount - fee;

            if (fee > 0 && treasury != address(0)) {
                COLLATERAL_TOKEN.safeTransferFrom(msg.sender, treasury, fee);
            }
            COLLATERAL_TOKEN.safeTransferFrom(msg.sender, term.agent, agentShare);
        }

        // Lock underwriting collateral in the VaultManager
        vaultManager.lockCollateral(term.agent, term.maxPayout);

        // Update agent record
        agentRegistry.incrementActivePolicies(term.agent);
        agentRegistry.recordCoverageIssued(term.agent, term.maxPayout);

        term.currentSubscribers += 1;

        policyId = nextPolicyId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + term.duration;

        _policies[policyId] = Policy({
            policyId: policyId,
            termId: termId,
            user: msg.sender,
            agent: term.agent,
            startTime: startTime,
            endTime: endTime,
            maxPayout: term.maxPayout,
            premiumPaid: term.premiumAmount,
            status: PolicyStatus.Active
        });

        _userPolicyIds[msg.sender].push(policyId);

        emit Events.PolicyPurchased(
            policyId, termId, msg.sender, term.agent, startTime, endTime, term.maxPayout, term.premiumAmount
        );
    }

    /**
     * @notice Expires an active policy whose duration has elapsed, unlocking collateral
     * @param policyId Policy identifier
     */
    function expirePolicy(uint256 policyId) external override nonReentrant {
        Policy storage policy = _policies[policyId];
        if (policy.policyId == 0) revert Errors.PolicyDoesNotExist(policyId);
        if (policy.status != PolicyStatus.Active) revert Errors.PolicyNotActive(policyId);
        if (block.timestamp < policy.endTime) {
            revert Errors.PolicyNotExpired(policyId, policy.endTime, block.timestamp);
        }

        if (address(claimsProcessor) != address(0) && claimsProcessor.hasPendingClaim(policyId)) {
            revert Errors.ClaimPending(policyId);
        }

        policy.status = PolicyStatus.Expired;

        CoverageTerm storage term = _terms[policy.termId];
        if (term.currentSubscribers > 0) {
            term.currentSubscribers -= 1;
        }

        if (address(vaultManager) != address(0)) {
            vaultManager.unlockCollateral(policy.agent, policy.maxPayout);
        }

        if (address(agentRegistry) != address(0)) {
            agentRegistry.decrementActivePolicies(policy.agent);
        }

        emit Events.PolicyExpired(policyId, policy.termId, policy.agent);
    }

    /**
     * @notice Marks a policy as claimed upon successful payout
     * @param policyId Policy identifier
     */
    function markPolicyClaimed(uint256 policyId) external override onlyRole(CLAIMS_EXECUTOR_ROLE) {
        Policy storage policy = _policies[policyId];
        if (policy.policyId == 0) revert Errors.PolicyDoesNotExist(policyId);
        if (policy.status != PolicyStatus.Active) revert Errors.PolicyNotActive(policyId);

        policy.status = PolicyStatus.Claimed;

        CoverageTerm storage term = _terms[policy.termId];
        if (term.currentSubscribers > 0) {
            term.currentSubscribers -= 1;
        }

        if (address(agentRegistry) != address(0)) {
            agentRegistry.decrementActivePolicies(policy.agent);
        }
    }

    // --- View Functions ---

    function getTerm(uint256 termId) external view override returns (CoverageTerm memory) {
        return _terms[termId];
    }

    function getPolicy(uint256 policyId) external view override returns (Policy memory) {
        return _policies[policyId];
    }

    function isPolicyActive(uint256 policyId) external view override returns (bool) {
        Policy storage p = _policies[policyId];
        return (p.status == PolicyStatus.Active && block.timestamp < p.endTime);
    }

    function getAgentTerms(address agent) external view override returns (uint256[] memory) {
        return _agentTermIds[agent];
    }

    function getUserPolicies(address user) external view returns (uint256[] memory) {
        return _userPolicyIds[user];
    }
}
