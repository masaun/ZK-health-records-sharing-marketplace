# ZK based Health Data Sharing Marketplace (built on the top of `Noir` and `zkVerify`)

## Overview

This is the ZK (Zero-Knowledge) based Health Data Sharing Marketplace, which is built on the top of Noir and zkVerify.


Marketplace where buy/sell a Health data between the following 2 actors:
- Seller: Health data provider 
- Buyer: Medical Researcher

The advantage for a seller is that:
- Seller can share (sell) their health data without sensitive data (i.e. Age, Name)
- Selective Disclosure ⭐️

The advantage for a buyer is that:
- Buy a health Data which keep Data integrity - by ZK Proof and zkVerify’s attestation-attested health data

<br>



## Installation
- Install libraries
  (NOTE: Before this installation, all folders should be removed under the ./lib directory)
```shell
forge install OpenZeppelin/openzeppelin-contracts
forge install 0xnonso/foundry-noir-helper
```

<br>

## Installation - `UltraPlonk zk-SNARK Verifier` powered by zkVerify

- NOTE: The original repo of the `ultraplonk_verifier` can be seen here: https://github.com/zkVerify/ultraplonk_verifier


- 1/ Move to the `./circuits/zkVerify/ultraplonk_verifier` directory:
```shell
cd circuits/zkVerify/ultraplonk_verifier
```

- 2/ Install the `ultraplonk_verifier` (`v0.3.0`) \
```shell
cargo install --features bins --path .
```

(NOTE: If the outdated-version of the `ultraplonk_verifier` is already installed, the following command should be used instead of the command above)
```shell
cargo install --features bins --path . --force
```

- 3/ Check whether or not the `ultraplonk_verifier` version is `v0.3.0`:
```shell
noir-cli -V
```
This result must be `noir-cli 0.3.0`.




<br>

## Run ZK circuit and generate (prove) a Ultraplonk proof 

- Run the `build.sh` to run ZK circuit
```shell
sh ./circuits/build.sh
```

<br>

## Convert an original Ultraplonk proof to the zkVerify version of Ultraplonk proof
- 1/ Move to the `./circuits/zkVerify/ultraplonk_verifier` directory:
```shell
cd circuits/zkVerify/ultraplonk_verifier
```

- 2/ Convert an given original Ultraplonk proof to the zkVerify version of Ultraplonk proof
```shell
sh convert_ultraplonk_to_zkverify_proof.sh
```

<br>

## Test - ZK circuit
- Run the `circuit_test.sh` to test the ZK circuit. 
```shell
cd circuits
sh circuit_test.sh
```

<br>

<br>

## SC

- Compile the smart contracts
```shell
sh ./buildContract.sh
```

<br>

## Test - SC

- Run the test of the `HealthDataSharing.t.sol`
```shell
sh ./test/runningTest_1.sh
```

- Run the test of the `HealthDataSharingViaNoirHelper.t.sol`
```shell
sh ./test/runningTest_2.sh
```

- Run the test of the `Scenario.t.sol`
```shell
sh ./test/runningTest_3.sh
```


## Test - SC for Hashing
- Run the test of the `HashingWithKeccak256.t.sol`
```shell
sh ./test/hashing/runningTest_hash_1.sh
```

- Run the test of the `HashingWithSha256.t.sol`
```shell
sh ./test/hashing/runningTest_hash_2.sh
```

<br>

## SC Deployment
- Deploy all contracts on EDU Chain (testnet) by running the `script/DeploymentAllContracts.s.sol` 
```shell
/// [NOTE]: Execute the following at the root directory.

forge script script/DeploymentAllContracts.s.sol --broadcast --private-key <EDU_CHAIN_PRIVATE_KEY> \
    ./contracts/zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol:ZkVerifyAttestation \
    ./circuits/target/contract.sol:UltraVerifier \
    ./contracts/circuits/HealthDataSharingVerifier.sol:HealthDataSharingVerifier \
    ./contracts/HealthDataSharingExecutor.sol:HealthDataSharingExecutor --skip-simulation
```


<br>


## Front-end 

- Prequisities
  - Node 18+
  - [zkVerify Wallet](https://docs.zkverify.io/tutorials/connect-a-wallet)


- 1/ Move to `./app` directory
```shell
cd app
```

- 2/ Install
```shell
npm install
```

- 3/ Install `zkverifyjs` (`v0.6.0`)
```shell
npm i zkverifyjs
```

- 4/ Run
```shell
npm run dev
```

- 5/ Open the WebApp (`http://localhost:3000`) on a Browser (i.e. Google Chrome).


<br>

<hr>


# Noir with Foundry

This example uses Foundry to deploy and test a verifier.

## Getting Started

Want to get started in a pinch? Start your project in a free Github Codespace!

[![Start your project in a free Github Codespace!](https://github.com/codespaces/badge.svg)](https://codespaces.new/noir-lang/noir-starter)

In the meantime, follow these simple steps to work on your own machine:

Install [noirup](https://noir-lang.org/docs/getting_started/noir_installation) with

1. Install [noirup](https://noir-lang.org/docs/getting_started/noir_installation):

   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   ```

2. Install Nargo:

   ```bash
   noirup
   ```

3. Install foundryup and follow the instructions on screen. You should then have all the foundry
   tools like `forge`, `cast`, `anvil` and `chisel`.

```bash
curl -L https://foundry.paradigm.xyz | bash
```

4. Install foundry dependencies by running `forge install 0xnonso/foundry-noir-helper --no-commit`.

5. Install `bbup`, the tool for managing Barretenberg versions, by following the instructions
   [here](https://github.com/AztecProtocol/aztec-packages/blob/master/barretenberg/bbup/README.md#installation).

6. Then run `bbup`.

## Generate verifier contract and proof

### Contract

The deployment assumes a verifier contract has been generated by nargo. In order to do this, run:

```bash
cd circuits
nargo compile
bb write_vk -b ./target/with_foundry.json
bb contract
```

A file named `contract.sol` should appear in the `circuits/target` folder.

### Test with Foundry

We're ready to test with Foundry. There's a basic test inside the `test` folder that deploys the
verifier contract, the `Starter` contract and two bytes32 arrays correspondent to good and bad
solutions to your circuit.

By running the following command, forge will compile the contract with 5000 rounds of optimization
and the London EVM version. **You need to use these optimizer settings to suppress the "stack too
deep" error on the solc compiler**. Then it will run the test, expecting it to pass with correct
inputs, and fail with wrong inputs:

```bash
forge test --optimize --optimizer-runs 5000 --evm-version cancun
```

#### Testing On-chain

You can test that the Noir Solidity verifier contract works on a given chain by running the
`Verify.s.sol` script against the appropriate RPC endpoint.

```bash
forge script script/Verify.s.sol --rpc-url $RPC_ENDPOINT  --broadcast
```

If that doesn't work, you can add the network to Metamask and deploy and test via
[Remix](https://remix.ethereum.org/).

Note that some EVM network infrastructure may behave differently and this script may fail for
reasons unrelated to the compatibility of the verifier contract.

### Deploy with Foundry

This template also has a script to help you deploy on your own network. But for that you need to run
your own node or, alternatively, deploy on a testnet.

#### (Option 1) Run a local node

If you want to deploy locally, run a node by opening a terminal and running

```bash
anvil
```

This should start a local node listening on `http://localhost:8545`. It will also give you many
private keys.

Edit your `.env` file to look like:

```
ANVIL_RPC=http://localhost:8545
LOCALHOST_PRIVATE_KEY=<the private key you just got from anvil>
```

#### (Option 2) Prepare for testnet

Pick a testnet like Sepolia or Goerli. Generate a private key and use a faucet (like
[this one for Sepolia](https://sepoliafaucet.com/)) to get some coins in there.

Edit your `.env` file to look like:

```env
SEPOLIA_RPC=https://rpc2.sepolia.org
LOCALHOST_PRIVATE_KEY=<the private key of the account with your coins>
```

#### Run the deploy script

You need to source your `.env` file before deploying. Do that with:

```bash
source .env
```

Then run the deployment with:

```bash
forge script script/Starter.s.sol --rpc-url $ANVIL_RPC --broadcast --verify
```

Replace `$ANVIL_RPC` with the testnet RPC, if you're deploying on a testnet.

## Developing on this template

This template doesn't include settings you may need to deal with syntax highlighting and
IDE-specific settings (i.e. VScode). Please follow the instructions on the
[Foundry book](https://book.getfoundry.sh/config/vscode) to set that up.

It's **highly recommended** you get familiar with [Foundry](https://book.getfoundry.sh) before
developing on this template.
