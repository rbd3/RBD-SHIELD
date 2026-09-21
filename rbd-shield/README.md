# RBD Shield Solidity Protocol

Foundry implementation of the RBD Shield collateral, coverage, and claims protocol.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

Install the pinned dependencies after a fresh clone:

```sh
forge install foundry-rs/forge-std@v1.16.2 --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v5.7.0 --no-commit
```

## Verify

```sh
forge fmt --check
forge build
forge test
```

## Deployment

Copy the following values into a local `.env` file; never commit it:

```sh
PRIVATE_KEY=<testnet_deployer_private_key>
USDC_ADDRESS=<existing_token_address_optional>
TREASURY_ADDRESS=<treasury_address_optional>
```

Run the deployment script against a test network only after setting a real RPC URL:

```sh
forge script script/Deploy.s.sol:DeployScript --rpc-url "$RPC_URL" --broadcast
```

When no `USDC_ADDRESS` is supplied, the script deploys a test-only mock USDC. The
fallback private key is Anvil's publicly known local-development key and must never
be used for a funded or production account.
