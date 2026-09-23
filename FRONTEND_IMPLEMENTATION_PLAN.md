# RBD Shield — Frontend Implementation Plan

## Goal

Build the frontend one page at a time. Make it feel **alive, modern, clear, and safe**.

The interface embraces a dark cyber-fintech aesthetic with deep navy and slate tones, cyan for primary actions and glowing accents, emerald green for healthy collateral status, and subdued red strictly for alerts, liquidation risk, or failed execution. Rather than dense tables and small text, content is given generous whitespace, large readable typography, interactive visualizers, dynamic protocol pulses, and purposeful motion.

---

## Rules for Every Page

- **Modern Glassmorphic Header (All Pages):** Sleek, sticky glassmorphic navigation (`backdrop-filter: blur(12px)`) with the RBD Shield emblem and title on the left, pill navigation centered, and multi-network selector (Arbitrum Sepolia / Robinhood Chain) + Connect Wallet button on the right.
- **Hero Visual Placement:** The rich `public/rbdshieldlogo.jpeg` artwork is featured prominently inside the **Hero section** as a glowing, ambient focal visual alongside the headline and CTAs—never pushed into an old-fashioned banner pushing navigation down.
- **Mobile First-Class:** Small logo on the left, network/wallet action, and hamburger menu on the right. Tables transition to cards or horizontal touch carousels. Sticky bottom CTA bars for transactional flows (e.g. Purchase Coverage).
- **Curated Palette:** Deep navy background (`#070B14`), card glass surfaces (`rgba(15, 23, 42, 0.75)`), vibrant cyan (`#00F2FE` / `#0AE2FF`) for primary actions, emerald (`#10B981`) for full-reserve solvency, and red (`#EF4444`) only for breach/risk.
- **Vitality & Motion with Purpose:** 
  - Dynamic live pulse ticker (protocol heartbeat).
  - Micro-interactions: Card hover lifts with subtle border luminescence, animated number count-ups, smooth state transitions.
  - Interactive SVG risk dials visualizing Stylus Rust computations.
  - Strict compliance with `prefers-reduced-motion`.
- **Component Discipline:** Do not build a massive global component library upfront. Build reusable, typed pieces incrementally as required by each page.

---

## Content and Voice

Good copy makes the protocol trustworthy and immediately intelligible. Use plain, confident language. Clarify value and mechanisms before exposing deep contract interfaces.

### Voice & Positioning

- **Calm, direct, and confident:** Financial infrastructure, not speculative hype.
- **Parametric Performance Bonds:** Always say **performance bond** or **coverage**, never "insurance" (preserves regulatory clarity and conforms to ADR-001).
- **Verifiable Execution:** Do not promise guaranteed payouts. State clearly that *verified, eligible claim conditions trigger automated payouts directly from the bonded vault*.
- **Two-Sided Marketplace Awareness:** Primary UX caters to coverage buyers, while welcoming agent developers to stake collateral and bond their AI agents.

### Starter Copy (Home Page)

- **Eyebrow:** Collateral-Backed Accountability for Autonomous AI Agents
- **Headline:** Trust AI agents with proof, not promises.
- **Supporting Text:** The decentralized performance-bond protocol for autonomous AI agents. Agents stake on-chain collateral into bonded vaults to guarantee their execution—unlocking instant, parametric payouts when service terms fail.
- **Primary CTA:** Explore Agents & Coverage
- **Secondary CTA:** How It Works & Video Guide
- **Developer Invitation:** Building an autonomous agent? [Stake a bond & register your agent →]
- **Protocol Pulse Label:** Live Solvency & Network Pulse
- **Featured Agents Heading:** Meet the Agents Backing Their Decisions
- **Featured Agents Subtext:** Compare real-time risk scores, collateral reserves, and available coverage before subscribing.
- **How It Works Heading:** Parametric Protection in Three Steps
  - **Step 1 (Deposit & Bond):** Autonomous agents stake collateral into `VaultManager` to back their SLAs.
  - **Step 2 (Select & Protect):** Users choose a coverage term with transparent premiums, durations, and maximum payouts.
  - **Step 3 (Automated Settlement):** When a verified SLA failure condition occurs, locked collateral is paid out directly to the affected user.
- **Stylus Section Heading:** High-Performance Risk Engine Powered by Arbitrum Stylus
- **Stylus Section Subtext:** Multi-factor actuarial scoring (uptime, volatility, utilization, claim history) calculated in WebAssembly with 10–50x gas efficiency via Rust Stylus.
- **Supported Networks:** Built for Arbitrum One, Arbitrum Sepolia, and Robinhood Chain (Chain ID 4663).

### Starter Calls to Action by Page

| Page | Primary Action | Secondary Action | Contextual Trigger |
|---|---|---|---|
| **Home** | Explore Agents & Coverage | Watch Video / How It Works | Developer: "Stake Bond & Register Agent" |
| **Agent Directory** | View Agent Detail | Filter by Risk / Capacity | "Register New Agent" (Supply-side modal) |
| **Agent Detail** | Protect Position (Buy Term) | Review SLA Performance | Live Stylus Risk Factor Breakdown |
| **Purchase Coverage** | Approve & Purchase Bond | Review Terms & Collateral Backing | Live Premium vs Max Payout Calculator |
| **My Coverage** | File Parametric Claim (if eligible) | View Vault Backing on Explorer | Active countdown & status badge |
| **Claims** | Submit New Claim | Track Claim Status Timeline | Evidence hash verification checklist |
| **Analytics** | Explore Protocol Health | View Top Bonded Agents | Solvency invariant live indicator |

---

## Page 1 — Home

### Purpose
Communicate RBD Shield's breakthrough proposition in 5 seconds, convey 24/7 autonomous vitality, and channel visitors into discovering agents or understanding the bond mechanics.

### Sections
1. **Sticky Glassmorphic Header**
   - Brand lock-up: Glowing shield emblem + "RBD Shield".
   - Center navigation: Home, Directory, My Coverage, Claims, Analytics.
   - Right controls: Multi-chain selector (`Arbitrum Sepolia` / `Robinhood Chain`) and RainbowKit/Wagmi Connect Wallet button.
2. **Hero Section**
   - Left column: Eyebrow badge, high-impact headline ("Trust AI agents with proof, not promises"), concise supporting text, and dual CTAs: `[ Explore Agents & Coverage ]` (Cyan glow) and `[ How It Works ]` (Ghost pill with play icon for video walkthrough).
   - Supply-side micro-link: *"Are you an AI Agent developer? Stake collateral & register →"*.
   - Right column: High-fidelity ambient hero graphic integrating `public/rbdshieldlogo.jpeg` with subtle glowing orbital rings, dynamic network nodes, and live stats overlay.
3. **Protocol Vitality Bar (Live Heartbeat)**
   - Live ticker with status indicators:
     - `● Protocol Status: 100% Full-Reserve Backed`
     - `● Network: Arbitrum Sepolia / Robinhood Chain`
     - `● Stylus Engine: Active & Verified`
     - `● Total Value Locked: $X USDC` | `● Active Coverage: $Y USDC` | `● Claims Settled: $Z USDC`
   - Numbers count up smoothly on first view.
4. **Interactive Bond & Coverage Calculator ("Try the Primitive")**
   - A playful, interactive widget demonstrating the protocol math:
   - Sliders: Agent Collateral Staked ($10,000) ↔ User Coverage Desired ($1,000) ↔ SLA Duration (30 Days).
   - Live output displays: Available Capacity, Calculated Premium (based on risk factor), and Guaranteed Vault Reserve.
5. **Featured Agents Carousel**
   - Live cards showing real registered agents (e.g. Arbitrage bot, Rebalancer, Liquidator).
   - Card showcases: Name, avatar, Stylus risk score badge (0–1000), bonded collateral amount, uptime %, active policies count, and `[ View Agent ]` action.
   - Smooth desktop partial-next view; mobile swipeable touch carousel. Pause on hover/focus.
6. **How It Works & Video Walkthrough Section**
   - 3 clear visual steps (Agent Deposits Collateral → User Purchases Policy → Automatic Parametric Payout).
   - Embedded video walkthrough placeholder / modal trigger showcasing the live flow.
7. **Arbitrum Stylus & Robinhood Chain Architecture Showcase**
   - Visualizing why Rust on Stylus unlocks sub-cent, compute-heavy actuarial risk scoring.
   - Clear multi-chain callout highlighting Arbitrum Orbit and Robinhood Chain execution.
8. **Footer**
   - Documentation links, contract addresses on Arbiscan, GitHub, security threat model summary, and social links.

---

## Page 2 — Agent Directory

### Purpose
Enable users to filter, inspect, and evaluate autonomous agents backing their service with real capital.

### Build
- **Header Summary & Action:** Title, description, and an accessible secondary button: `[ + Register Agent & Bond Collateral ]` opening a guided setup modal for agent operators.
- **Filter & Search Bar:** Search by agent name/address, risk rating tier (Low Risk, Moderate, High), minimum collateral slider, and active status toggle.
- **Agent Cards Grid:**
  - Radial risk score gauge with color code (Green = 800+, Yellow = 600–799, Red = <600).
  - Key metrics: Total Collateral Staked, Locked vs Available Capacity, Historical Claims Paid, Uptime SLA.
  - Clear primary action: `[ Inspect Agent & Terms → ]`.
- **States:** Shimmer loading state, empty state with "Reset Filters" action, and clear status tags.

---

## Page 3 — Agent Detail

### Purpose
Provide comprehensive cryptographic and economic proof of an agent's performance, enabling the user to evaluate and select an SLA coverage term.

### Build
- **Agent Profile Hero:** Agent name, operator address, registration timestamp, active status, bonded vault address link on Arbiscan, and total collateral backed.
- **Stylus Risk Breakdown Widget:**
  - Animated multi-factor risk radar/bars displaying the 4 weights: Uptime Score, Volatility Factor, Capital Utilization, and Claim History.
  - Explanatory tooltip: "Calculated on-chain by Stylus Rust WASM engine".
- **Interactive Tabs:**
  1. **Coverage Terms (Primary):** Clear tier cards (e.g. Standard Trading SLA, High-Volume SLA). Shows Premium rate, Maximum Payout, SLA Failure Condition (e.g., Drawdown > 15%), Term Duration, and direct `[ Protect Position ]` CTA button.
  2. **Performance History:** Uptime charts, transaction volume, and verified heartbeat history.
  3. **Claims & Vault Activity:** History of any past claims filed against this agent's vault, showing evidence hashes and settlement status.

---

## Page 4 — Purchase Coverage

### Purpose
Turn selected SLA protection terms into an intuitive, secure two-step on-chain transaction (USDC Approval -> Policy Minting).

### Build
- **Purchase Overview Card:**
  - Selected Agent name & verified status.
  - SLA Failure Condition trigger.
  - Protection amount (Max Payout) vs Premium cost (distinguished with crystal clarity so users never confuse fee with coverage).
  - Duration & Expiration date calculator.
- **Transaction Stepper:**
  - Step 1: Approve USDC (shows current allowance vs required).
  - Step 2: Confirm Policy Purchase (`CoverageManager.purchasePolicy`).
- **Live Transaction Feedback:** Clear states for Wallet Prompt, Mining / Confirming with block explorer link, Success Confetti/Receipt, and Rejection/Error explanations.
- **Success Screen:** Displays newly minted Policy ID with instant link: `[ View in My Coverage → ]`.

---

## Page 5 — My Coverage

### Purpose
Provide a personal management hub where users can track every active performance bond, monitor expiration dates, and file eligible claims.

### Build
- **Summary Counters:** Active Covered Positions, Total Protected Value ($), Expired Policies, Settled Claims.
- **Filter Tabs:** `All`, `Active`, `Claimed`, `Expired`.
- **Policy Cards / List:**
  - Card shows: Policy ID, Agent name, Covered Amount, Expiration countdown timer bar, and Status Badge (`Active`, `Claim Pending`, `Paid Out`, `Expired`).
  - Action Button: If active and eligible -> glowing `[ File Claim ]` button; if expired -> inactive status; if paid -> link to transaction receipt.
- **Empty State:** Friendly graphic with direct invite: *"You have no active coverage positions. [Browse Registered Agents →]"*.

---

## Page 6 — Claims

### Purpose
Provide a transparent, verifiable claims lifecycle from parametric submission through automated vault payout.

### Build
- **Protocol Claims Overview:** Total claims paid, average settlement time, and active solvency ratio.
- **Submit Claim Flow (Modal or Dedicated Drawer):**
  - Select active policy from eligible dropdown.
  - Claim Amount requested (capped at Policy Max Payout).
  - Evidence Submission: IPFS / Cryptographic hash of the SLA breach proof.
  - Plain-English explanation: "Under MVP rules, evidence is verified by the authorized protocol attester before automated disbursement from the agent's bonded vault."
- **Claim Status Timeline:** Visual step-tracker:
  `Submitted` ➔ `Evidence Verification` ➔ `Payout Disbursed from Vault`.

---

## Page 7 — Analytics

### Purpose
Showcase macro protocol health, economic invariants, and Stylus computational performance to instill total institutional confidence.

### Build
- **Protocol Invariant Dashboard:**
  - Invariant Status: `100% Full-Reserve Backed` (Proof that `Total Locked + Claims Paid <= Total Deposited`).
  - Total Protocol TVL (USDC).
  - Aggregate Active Coverage Capacity.
  - Cumulative Premiums Earned & Protocol Fee Revenue (2.5%).
  - Total Settled Payouts.
- **Visual Charts:**
  - TVL & Coverage Growth over time.
  - Agent Collateral Distribution (Treemap or Bar Chart).
  - Claims vs Premiums Loss Ratio gauge.
- **Stylus Gas Benchmarks Widget:**
  - Comparison visual demonstrating gas savings of Stylus Rust risk computations vs standard EVM Solidity.

---

## Final Pass — Shared UX, Web3 Integration & Testnet

- **Web3 Integration:** Connect contracts using `viem` and `wagmi` with `RainbowKit` supporting Arbitrum Sepolia and Robinhood Chain.
- **Error & Edge State Handling:** Implement comprehensive feedback for wallet rejection, insufficient allowance, slippage, RPC timeouts, and chain switching.
- **Responsive & Accessibility Testing:** Validate smooth layouts across 375 px (mobile), 768 px (tablet), and 1440 px+ (wide desktop). Ensure full ARIA tagging, keyboard navigation, and `prefers-reduced-motion` compliance.
- **End-to-End Simulation:** Run through the complete user loop: Deposit collateral -> Register agent -> Buy coverage -> File claim -> Verify automated vault payout.

---

## Implementation Order

1. **Page 1:** Home (Hero, Sticky Glassmorphic Header, Protocol Pulse Bar, Interactive Bond Calculator, Carousel)
2. **Page 2:** Agent Directory (Search, Filters, Risk Score badges, Register Agent modal entry)
3. **Page 3:** Agent Detail (Stylus Risk Radar, Collateral stats, SLA Terms)
4. **Page 4:** Purchase Coverage (Two-step approval & purchase flow, live summary)
5. **Page 5:** My Coverage (Active policies, countdown timers, claim actions)
6. **Page 6:** Claims (Claim filing drawer, evidence verification, payout timeline)
7. **Page 7:** Analytics (Macro protocol metrics, solvency invariants, Stylus gas comparison)
8. **Final Polish:** Responsive review, Web3 provider connection, testnet deployment verification.

---

## Future Enhancements (Post-Core Backlog)

These features are queued for implementation *after* completing the core 7 pages, guided video walkthrough, and testnet deployment:

1. **Interactive Demo / Judge Simulation Mode:**
   - A frictionless top-bar toggle: `[ 🧪 Demo Mode ]`.
   - Pre-seeds sample agents, mock USDC balances, and pre-configured policy states so evaluators and judges can test the full purchase-to-payout cycle instantly without testnet faucet requirements.
2. **Autonomous Agent CLI / SDK Integration Hub:**
   - Dedicated interactive docs tab in the frontend displaying live `cast` command snippets and agent SDK webhooks for autonomous bot registration.
3. **Decentralized Multi-Oracle Dispute Module:**
   - Expansion from MVP admin-attested claims to decentralized UMA or Chainlink CRE evidence dispute feeds.
