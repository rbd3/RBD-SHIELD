export interface AgentData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  riskScore: number; // 0 - 1000 from Stylus
  riskTier: 'Low Risk' | 'Moderate' | 'High Risk';
  collateralUsdc: number;
  availableCapacityUsdc: number;
  uptimePercent: number;
  activePoliciesCount: number;
  claimsPaidCount: number;
  serviceDescription: string;
  slaTerms: {
    termName: string;
    maxPayoutUsdc: number;
    premiumUsdc: number;
    durationDays: number;
    failureTrigger: string;
  }[];
}

export const MOCK_AGENTS: AgentData[] = [
  {
    id: 'agent-alpha-arb',
    name: 'AlphaRebalancer v2',
    role: 'Autonomous Arbitrum DEX Rebalancer',
    avatar: '🤖',
    riskScore: 945,
    riskTier: 'Low Risk',
    collateralUsdc: 250000,
    availableCapacityUsdc: 185000,
    uptimePercent: 99.94,
    activePoliciesCount: 42,
    claimsPaidCount: 0,
    serviceDescription: 'Maintains concentrated liquidity positions across Camelot & Uniswap v3 on Arbitrum with strict maximum drawdown boundaries.',
    slaTerms: [
      {
        termName: 'Standard Delta SLA',
        maxPayoutUsdc: 5000,
        premiumUsdc: 75,
        durationDays: 30,
        failureTrigger: 'Slippage breach > 2.5% on rebalancing transactions'
      },
      {
        termName: 'Institutional Treasury SLA',
        maxPayoutUsdc: 25000,
        premiumUsdc: 320,
        durationDays: 60,
        failureTrigger: 'Drawdown > 5.0% over rolling 72-hour window'
      }
    ]
  },
  {
    id: 'agent-sentinel-perp',
    name: 'PerpSentinel Delta',
    role: 'Robinhood Chain Trading Agent',
    avatar: '⚡',
    riskScore: 890,
    riskTier: 'Low Risk',
    collateralUsdc: 500000,
    availableCapacityUsdc: 340000,
    uptimePercent: 99.82,
    activePoliciesCount: 68,
    claimsPaidCount: 1,
    serviceDescription: 'Automated delta-neutral basis arbitrage bot executing high-frequency hedging on Robinhood Chain orderbooks.',
    slaTerms: [
      {
        termName: 'Liquidation Shield SLA',
        maxPayoutUsdc: 10000,
        premiumUsdc: 160,
        durationDays: 30,
        failureTrigger: 'Unscheduled liquidation event due to bot execution delay'
      }
    ]
  },
  {
    id: 'agent-keeper-bot',
    name: 'GMX Liquidator Prime',
    role: 'Arbitrum Keeper & Liquidation Agent',
    avatar: '🛡️',
    riskScore: 785,
    riskTier: 'Moderate',
    collateralUsdc: 120000,
    availableCapacityUsdc: 75000,
    uptimePercent: 99.20,
    activePoliciesCount: 19,
    claimsPaidCount: 0,
    serviceDescription: 'Underwrites timely execution of stop-loss and limit order settlements on Arbitrum One perps.',
    slaTerms: [
      {
        termName: 'Latency Guarantee SLA',
        maxPayoutUsdc: 3000,
        premiumUsdc: 60,
        durationDays: 14,
        failureTrigger: 'Execution latency > 3 blocks during standard oracle updates'
      }
    ]
  },
  {
    id: 'agent-vault-compounder',
    name: 'AutoYield Oracle Bot',
    role: 'Cross-Orbit Yield Harvester',
    avatar: '🌾',
    riskScore: 920,
    riskTier: 'Low Risk',
    collateralUsdc: 380000,
    availableCapacityUsdc: 290000,
    uptimePercent: 99.98,
    activePoliciesCount: 51,
    claimsPaidCount: 0,
    serviceDescription: 'Autonomous treasury agent managing yield optimization between Arbitrum One lending vaults and Robinhood Chain money markets.',
    slaTerms: [
      {
        termName: 'Compound Accuracy SLA',
        maxPayoutUsdc: 15000,
        premiumUsdc: 210,
        durationDays: 45,
        failureTrigger: 'Harvest transaction failure exceeding 12 hours'
      }
    ]
  }
];
