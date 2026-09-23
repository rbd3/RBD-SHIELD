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
  operatorAddress: string;
  vaultAddress: string;
  registeredDate: string;
  status: 'active' | 'paused';
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
    operatorAddress: '0x8A72aB92841029F38e12489C92B5482312b91394',
    vaultAddress: '0x49F2eA819230582848572019482301984201C70a',
    registeredDate: '2024-05-18',
    status: 'active',
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
    operatorAddress: '0x1A284fB821034cBa104829F8402941049210B391',
    vaultAddress: '0x7B29a0294820491029482019482019482019A821',
    registeredDate: '2024-06-02',
    status: 'active',
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
    operatorAddress: '0x6294CaB019284019284019284019284019284019',
    vaultAddress: '0x9921402948201948201948201948201948201923',
    registeredDate: '2024-06-25',
    status: 'active',
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
    operatorAddress: '0x3C92482019482019482019482019482019482019',
    vaultAddress: '0x5501928401928401928401928401928401928401',
    registeredDate: '2024-07-10',
    status: 'active',
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
    id: 'agent-momentum-sniper',
    name: 'MomentumSniper AI',
    role: 'Arbitrum Sepolia Momentum Trader',
    avatar: '🎯',
    riskScore: 680,
    riskTier: 'Moderate',
    collateralUsdc: 85000,
    availableCapacityUsdc: 45000,
    uptimePercent: 98.65,
    activePoliciesCount: 14,
    claimsPaidCount: 1,
    operatorAddress: '0x99A821034cBa104829F8402941049210B3910248',
    vaultAddress: '0x33B104829F8402941049210B391024899A821034',
    registeredDate: '2024-08-01',
    status: 'active',
    serviceDescription: 'High-frequency momentum and liquidity sniper executing algorithmic breakout trades on Arbitrum DEX pairs.',
    slaTerms: [
      {
        termName: 'Volatility Cap SLA',
        maxPayoutUsdc: 2500,
        premiumUsdc: 95,
        durationDays: 14,
        failureTrigger: 'Slippage breach > 4.0% on high-volatility pairs'
      }
    ]
  },
  {
    id: 'agent-nexus-flash',
    name: 'Nexus Flash Arb',
    role: 'Cross-DEX Flash Arbitrageur',
    avatar: '💥',
    riskScore: 540,
    riskTier: 'High Risk',
    collateralUsdc: 45000,
    availableCapacityUsdc: 15000,
    uptimePercent: 96.40,
    activePoliciesCount: 6,
    claimsPaidCount: 2,
    operatorAddress: '0x44E821034cBa104829F8402941049210B3910212',
    vaultAddress: '0x88F104829F8402941049210B391024899A821099',
    registeredDate: '2024-08-19',
    status: 'paused',
    serviceDescription: 'Aggressive multi-hop flash loan arbitrage engine executing cross-market price discrepancy liquidations.',
    slaTerms: [
      {
        termName: 'Execution Failure SLA',
        maxPayoutUsdc: 1500,
        premiumUsdc: 110,
        durationDays: 7,
        failureTrigger: 'Reverted flash loan incurring gas debt > 0.05 ETH'
      }
    ]
  }
];
