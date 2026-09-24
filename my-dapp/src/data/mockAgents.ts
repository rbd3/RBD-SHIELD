export interface ClaimRecord {
  id: string;
  timestamp: string;
  amountUsdc: number;
  triggerReason: string;
  txHash: string;
  status: 'Settled' | 'Under Review';
}

export interface AgentData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  chain: 'Arbitrum One' | 'Robinhood Chain' | 'Arbitrum Sepolia';
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
  riskBreakdown: {
    uptimeScore: number;
    volatilityScore: number;
    utilizationScore: number;
    claimsScore: number;
  };
  performanceMetrics: {
    totalVolumeUsdc: number;
    avgExecutionLatencyMs: number;
    maxDrawdownPct: number;
    heartbeatsVerified: number;
  };
  historicalClaims: ClaimRecord[];
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
    chain: 'Arbitrum One',
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
    riskBreakdown: {
      uptimeScore: 994,
      volatilityScore: 920,
      utilizationScore: 880,
      claimsScore: 1000
    },
    performanceMetrics: {
      totalVolumeUsdc: 14200000,
      avgExecutionLatencyMs: 380,
      maxDrawdownPct: 1.84,
      heartbeatsVerified: 43200
    },
    historicalClaims: [],
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
    chain: 'Robinhood Chain',
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
    riskBreakdown: {
      uptimeScore: 982,
      volatilityScore: 860,
      utilizationScore: 810,
      claimsScore: 910
    },
    performanceMetrics: {
      totalVolumeUsdc: 28500000,
      avgExecutionLatencyMs: 140,
      maxDrawdownPct: 2.10,
      heartbeatsVerified: 42800
    },
    historicalClaims: [
      {
        id: 'claim-rh-104',
        timestamp: '2024-07-14',
        amountUsdc: 4200,
        triggerReason: 'Execution latency > 3 blocks during orderbook volatility surge',
        txHash: '0x9d4a81...38f2',
        status: 'Settled'
      }
    ],
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
    chain: 'Arbitrum One',
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
    riskBreakdown: {
      uptimeScore: 998,
      volatilityScore: 910,
      utilizationScore: 840,
      claimsScore: 1000
    },
    performanceMetrics: {
      totalVolumeUsdc: 9800000,
      avgExecutionLatencyMs: 620,
      maxDrawdownPct: 0.72,
      heartbeatsVerified: 43190
    },
    historicalClaims: [],
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
    chain: 'Arbitrum One',
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
    riskBreakdown: {
      uptimeScore: 920,
      volatilityScore: 740,
      utilizationScore: 710,
      claimsScore: 1000
    },
    performanceMetrics: {
      totalVolumeUsdc: 5400000,
      avgExecutionLatencyMs: 290,
      maxDrawdownPct: 3.45,
      heartbeatsVerified: 41900
    },
    historicalClaims: [],
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
    chain: 'Arbitrum Sepolia',
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
    riskBreakdown: {
      uptimeScore: 865,
      volatilityScore: 610,
      utilizationScore: 630,
      claimsScore: 780
    },
    performanceMetrics: {
      totalVolumeUsdc: 2300000,
      avgExecutionLatencyMs: 180,
      maxDrawdownPct: 4.80,
      heartbeatsVerified: 39800
    },
    historicalClaims: [
      {
        id: 'claim-ms-002',
        timestamp: '2024-08-11',
        amountUsdc: 1850,
        triggerReason: 'Slippage breach > 4.0% during fast liquidity dry-up event',
        txHash: '0x4f128e...90d1',
        status: 'Settled'
      }
    ],
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
    chain: 'Arbitrum One',
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
    riskBreakdown: {
      uptimeScore: 740,
      volatilityScore: 480,
      utilizationScore: 510,
      claimsScore: 580
    },
    performanceMetrics: {
      totalVolumeUsdc: 4100000,
      avgExecutionLatencyMs: 95,
      maxDrawdownPct: 8.90,
      heartbeatsVerified: 36200
    },
    historicalClaims: [
      {
        id: 'claim-nf-001',
        timestamp: '2024-08-28',
        amountUsdc: 1500,
        triggerReason: 'Reverted flash loan incurring gas debt > 0.05 ETH',
        txHash: '0x7e8392...a110',
        status: 'Settled'
      },
      {
        id: 'claim-nf-002',
        timestamp: '2024-09-02',
        amountUsdc: 1500,
        triggerReason: 'Transaction sequence revert with liquidity mismatch',
        txHash: '0x12c984...f831',
        status: 'Settled'
      }
    ],
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
