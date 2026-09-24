import { isAddress, type Address } from 'viem';

type ContractAddresses = {
  usdc?: Address;
  vaultManager?: Address;
  agentRegistry?: Address;
  coverageManager?: Address;
  claimsProcessor?: Address;
};

const address = (value?: string): Address | undefined => value && isAddress(value) ? value : undefined;

const byChain: Record<number, ContractAddresses> = {
  421614: {
    usdc: address(import.meta.env.VITE_ARB_SEPOLIA_USDC_ADDRESS),
    vaultManager: address(import.meta.env.VITE_ARB_SEPOLIA_VAULT_MANAGER_ADDRESS),
    agentRegistry: address(import.meta.env.VITE_ARB_SEPOLIA_AGENT_REGISTRY_ADDRESS),
    coverageManager: address(import.meta.env.VITE_ARB_SEPOLIA_COVERAGE_MANAGER_ADDRESS),
    claimsProcessor: address(import.meta.env.VITE_ARB_SEPOLIA_CLAIMS_PROCESSOR_ADDRESS),
  },
  46630: {
    usdc: address(import.meta.env.VITE_ROBINHOOD_USDC_ADDRESS),
    vaultManager: address(import.meta.env.VITE_ROBINHOOD_VAULT_MANAGER_ADDRESS),
    agentRegistry: address(import.meta.env.VITE_ROBINHOOD_AGENT_REGISTRY_ADDRESS),
    coverageManager: address(import.meta.env.VITE_ROBINHOOD_COVERAGE_MANAGER_ADDRESS),
    claimsProcessor: address(import.meta.env.VITE_ROBINHOOD_CLAIMS_PROCESSOR_ADDRESS),
  },
};

export const contractsForChain = (chainId?: number) => byChain[chainId ?? 0] ?? {};
export const contractsReady = (chainId?: number) => {
  const contracts = contractsForChain(chainId);
  return Boolean(contracts.usdc && contracts.vaultManager && contracts.agentRegistry && contracts.coverageManager && contracts.claimsProcessor);
};

export const erc20Abi = [
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const;

export const vaultManagerAbi = [{ type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] }] as const;
export const agentRegistryAbi = [{ type: 'function', name: 'registerAgent', stateMutability: 'nonpayable', inputs: [{ name: 'metadataURI', type: 'string' }], outputs: [] }] as const;
export const coverageManagerAbi = [{ type: 'function', name: 'purchaseCoverage', stateMutability: 'nonpayable', inputs: [{ name: 'termId', type: 'uint256' }], outputs: [{ type: 'uint256' }] }] as const;
export const claimsProcessorAbi = [{ type: 'function', name: 'submitClaim', stateMutability: 'nonpayable', inputs: [{ name: 'policyId', type: 'uint256' }, { name: 'amount', type: 'uint256' }, { name: 'evidenceHash', type: 'bytes32' }], outputs: [{ type: 'uint256' }] }] as const;
