<a name="readme-top"></a>

# 📗 Table of Contents

- [📗 Table of Contents](#-table-of-contents)
- [📖 RBD SHIELD ](#-rbd-shield-)
  - [1. Executive Summary ](#1-executive-summary-)
  - [🛠 Built With ](#-built-with-)
    - [Tech Stack ](#tech-stack-)
    - [Key Features ](#key-features-)
    - [Frontend Version ](#frontend-version-)
  - [🚀 Live Demo ](#-live-demo-)
  - [💻 Getting Started ](#-getting-started-)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Usage](#usage)
    - [Run tests](#run-tests)
  - [👥 Authors ](#-authors-)
  - [🔭 Future Features ](#-future-features-)
  - [🤝 Contributing ](#-contributing-)
  - [⭐️ Show your support ](#️-show-your-support-)
  - [🙏 Acknowledgments ](#-acknowledgments-)
  - [📝 License ](#-license-)

# 📖 RBD SHIELD <a name="about-project"></a>

## 1. Executive Summary <a name="executive-summary"></a>

**RBD Shield** is a trust and accountability protocol for autonomous AI agents in Web3. It gives agents a way to register, prove their identity, commit economic value, and offer coverage when their work can fail or create risk for users.


In autonomous DeFi and agentic workflows, agents execute trades, manage treasury liquidity, and perform cross-chain rebalancing. Rather than relying on non-binding off-chain reputation scores, RBD Shield enables agents to stake verifiable collateral into on-chain vaults to back service-level agreements (SLAs). When pre-agreed failure conditions occur, affected users receive immediate, automated parametric payouts directly from the bonded vault.

The goal is simple: make AI-agent behavior auditable, transparent, and economically aligned with the risks it creates.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary>Client</summary>
  <ul>
    <li><a href="https://react.dev/">React</a></li>
    <li><a href="https://vite.dev/">Vite</a></li>
    <li><a href="https://www.typescriptlang.org/">TypeScript</a></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTML">HTML</a></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/CSS">CSS</a></li>
  </ul>
</details>

<details>
  <summary>Smart Contracts</summary>
  <ul>
    <li><a href="https://soliditylang.org/">Solidity</a></li>
    <li><a href="https://book.getfoundry.sh/">Foundry</a></li>
    <li><a href="https://openzeppelin.com/contracts/">OpenZeppelin</a></li>
  </ul>
</details>

<details>
  <summary>Backend / Risk Layer</summary>
  <ul>
    <li><a href="https://www.rust-lang.org/">Rust</a></li>
    <li><a href="https://docs.arbitrum.io/stylus/overview">Stylus</a></li>
    <li><a href="https://www.arbitrum.io/">Arbitrum</a></li>
  </ul>
</details>

<details>
  <summary>Tools / Workflow</summary>
  <ul>
    <li><a href="https://viem.sh/">viem</a></li>
    <li><a href="https://wagmi.sh/">wagmi</a></li>
    <li><a href="https://github.com/ethereum/ethers.js">ethers</a></li>
    <li><a href="https://github.com/foundry-rs/foundry">Forge</a></li>
    <li><a href="https://www.alchemy.com/">Alchemy</a></li>
  </ul>
</details>

### Key Features <a name="key-features"></a>

The main features of this project include:

- **Agent registration and identity staking**
- **Collateral-backed accountability for AI agents**
- **Coverage creation and buying flow for users**
- **Claims and payout logic for failed or harmful outcomes**
- **Vault and collateral management with protocol-level safeguards**
- **Risk engine approach for evaluating agent reliability**
- **Frontend marketplace experience for browsing and interacting with registered agents**

### Frontend Version <a name="frontend-version"></a>

- React + Vite frontend for the marketplace experience and agent browsing flow
- Local app is under the project frontend folder and is connected to live on-chain registry data

<p align="right"><a href="#readme-top">back to top</a></p>

## 🚀 Live Demo <a name="live-demo"></a>

- 🌐 **[Launch RBD Shield dApp ↗](https://rbd-shield.onrender.com)**

<p align="right"><a href="#readme-top">back to top</a></p>

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running, follow these steps.

### Prerequisites

In order to run this project you need the following:

- Foundry
- Rust / Cargo
- Node.js and npm
- Git

### Install

Install the protocol dependencies with:

```sh
forge install foundry-rs/forge-std@v1.16.2 --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v5.7.0 --no-commit
```

Then build and validate the contracts:

```sh
forge fmt --check
forge build
forge test
```

### Usage

Deploy the protocol to a local or testnet environment:

```sh
forge script script/Deploy.s.sol:DeployScript --rpc-url "$RPC_URL" --broadcast
```

You can also run the frontend app from the project frontend folder:

```sh
cd my-dapp
npm install
npm run dev -- --host 0.0.0.0
```

### Run tests

For the Solidity layer:

```sh
forge test
```

For frontend checks:

```sh
cd my-dapp
npm run build
```

<p align="right"><a href="#readme-top">back to top</a></p>

## 👥 Authors <a name="authors"></a>

👤 **Andry Narson**

- GitHub: [@rbd3](https://github.com/rbd3)
- LinkedIn: [@Andry Narson Rabedesana](https://linkedin.com/in/andry-rabedesana)
- X / Twitter: [@rbd3](https://x.com/rbd3)

<p align="right"><a href="#readme-top">back to top</a></p>

## 🔭 Future Features <a name="future-features"></a>

Here are some ideas for the next steps of the protocol:

- **Premium payment flow and coverage marketplace expansion**
- **More advanced risk-scoring logic for agent performance and reliability**
- **Oracle and external signal integration for verifiable agent outcomes**
- **Dispute resolution and governance-based claim review**
- **Cross-chain deployment and broader multi-chain support**
- **Multi-token collateral and broader underwriting models**
- **Agent SDK and developer tools for easier integration**

The long-term goal is to create a practical trust layer for autonomous systems where users can assess agent quality with real economic accountability behind it.

<p align="right"><a href="#readme-top">back to top</a></p>

## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/rbd3/RBD-SHIELD/issues) to report bugs or propose improvements for the protocol, contracts, frontend, or risk model.

<p align="right"><a href="#readme-top">back to top</a></p>

## ⭐️ Show your support <a name="support"></a>

If you like this project, give it a star and share it with others building in the AI + Web3 space.

<p align="right"><a href="#readme-top">back to top</a></p>

## 🙏 Acknowledgments <a name="acknowledgments"></a>

- Arbitrum ecosystem for the tooling, infrastructure, and opportunity to build in this space
- The Arbitrum buildathon community for the chance to prototype and push this idea forward
- [Alchemy](https://www.alchemy.com/) for reliable RPC URL endpoints and node infrastructure
- Everyone supporting the vision of safer, more accountable autonomous agents in crypto

<p align="right"><a href="#readme-top">back to top</a></p>

## 📝 License <a name="license"></a>

This project is licensed under the [MIT License](./LICENSE).

<p align="right"><a href="#readme-top">back to top</a></p>
