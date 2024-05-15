# NFT Contracts

<br/>
<p align="center">
<img src="./images/randomNft/pug.png" width="225" alt="NFT Pug">
<img src="./images/dynamicSvgNft/happy.svg" width="225" alt="NFT Happy">
<img src="./images/randomNft/shiba-inu.png" width="225" alt="NFT Shiba">
<img src="./images/dynamicSvgNft/frown.svg" width="225" alt="NFT Frown">
<img src="./images/randomNft/st-bernard.png" width="225" alt="NFT St.Bernard">
</p>
<br/>

## This repository contains three different NFT contracts.

## Contracts Overview

1. **BasicNFT.sol**: A basic ERC721-compliant contract that allows for the minting of non-fungible tokens (NFTs).
2. **DynamicSvgNFT.sol**: A dynamic SVG NFT contract that mints NFTs based on the price of an asset obtained from Chainlink's price feed. The NFT image is represented using SVG and the metadata is stored 100% on-chain, with the image URL being generated dynamically based on the asset price.
3. **RandomIpfsNFT.sol**: A random IPFS NFT contract where users can mint NFTs with varying levels of scarcity. The token metadata and image are hosted on IPFS programatically through Pinata's IPFS nodes using the "uploadToPinata" script.

### Prerequisites

# Getting Started

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`

## Quickstart

```
git clone https://github.com/Mr-Saade/Hardhat-Nft
cd Hardhat-Nft
yarn
```

## Typescript

If you want to get to typescript and you cloned the javascript version, just run:

```
git checkout typescript
```

## Usage

### Deployment to Testnet or Mainnet

1. Set up environment variables using `.env` file (see [Environment Variables](#environment-variables)).
2. Deploy the contract to the desired network:
   To deploy all contracts, using the following command:

```sh
yarn hardhat deploy --network yourNetwork
```

To deploy specific contracts example dynamicSvgNft contract using the following command:

```sh
yarn hardhat deploy --network yourNetork --tags dynamic
```

### Testing

Run tests for all contracts;

```sh
yarn test --parallel
```

### Test Coverage

Generate a test coverage report:

```sh
yarn coverage
```

## Configuration

### Environment Variables

Create a `.env` file with the following environment variables:

- `PRIVATE_KEY`: Private key of your Ethereum account (from Metamask).
- `SEPOLIA_RPC_URL`: URL of the Sepolia testnet node.
- `COINMARKETCAP_API_KEY`: API key from CoinMarketCap for gas cost estimation.
- `ETHERSCAN_API_KEY`: API key from Etherscan for contract verification.
- `PINATA_API_KEY` & `PINATE_API_SECRET`: API keys from Pinata for interacting with Pinata's IPFS pinning service

### Get testnet ETH

Head over to [faucets.chain.link](https://faucets.chain.link/) and get some tesnet ETH & LINK. You should see the ETH and LINK show up in your metamask. [You can read more on setting up your wallet with LINK.](https://docs.chain.link/docs/deploy-your-first-contract/#install-and-fund-your-metamask-wallet)

### Setup Chainlink VRF

Head over to [vrf.chain.link](https://vrf.chain.link/) and setup a new subscription, and get a subscription Id funded with LINK.

1. Obtain a subscription ID, alternatively, you can reuse an old subscription if you already have one.
2. Fund your subscription with LINK.
3. Add the subscription ID to `helper-hardhat-config.js`

### Add your contract address as a Chainlink VRF Consumer

Go back to [vrf.chain.link](https://vrf.chain.link) and under your subscription click `Add consumer` and add your deployed contract address. You should also fund the contract with a minimum of 1 LINK.

## Mint NFTs

To programatically mint NFTs from all 3 NFT Contracts, run:

```sh
yarn hardhat run scripts/mintNfts
```

## Estimate Gas Cost in USD

For a USD estimation of gas cost, set up `COINMARKETCAP_API_KEY` environment variable (see [Environment Variables](#environment-variables)). Set `enabled` to `true` in the `gasReporter` section of the `hardhat-config.js` to have a gas-reporter file generated when you run tests on the contracts.

## Verify on Etherscan

To verify the contract on Etherscan manually, set up `ETHERSCAN_API_KEY` environment variable (see [Environment Variables](#environment-variables)). Use the following command:

```sh
yarn hardhat verify --constructor-args  DEPLOYED_CONTRACT_ADDRESS
```

## Linting

Check and fix contract source code using the following commands:

```sh
yarn lint
yarn lint:fix
```

# Thank you!
