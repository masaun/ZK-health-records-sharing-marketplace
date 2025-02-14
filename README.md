# ZK based Health Records/Data Sharing Marketplace

## Built on top of the following tech stack

ZK based Health Records/Data Sharing Marketplace is built on top of the following tech stack:
- `Noir` (for ZK Circuit)
- `zkVerify` (for ZK Attestation)
- `EDU Chain` (for deploying smart contracts)
- Solidity / Foundry (for smart contract development)
- Next.js / React (for front-end)

<br>

## Overview

In the **drug descovery** space, which is one of space in **DeSci**, there are problems for the following actors respectively:
- For a **Health Data Provider** (i.e. patient, wearable device holder like Apple Watch holder), there is negative situations that their unnecessary sensitive informations may also be leaked when they share their health records/data with Medical Researchers. Also, there is lack of incentive to share their health records/data with Medical Researchers. 
- For a **Medical Researcher**, there is lack of access to large amount of the health records/data, which the data integrity is kept, to be analyzed for developing new drugs. Also, there is lack of transparent marketplace of them. These are one of cause of that makes the speed (pace) of new drug discovery slower.

The ZK (Zero-Knowledge) based Health Records/Data Sharing Marketplace, which is built on top of **Noir** and **zkVerify**, can resolved the problems above by applying ZK (Zero-Knowledge) cryptographic techniques and smart contract/blockchain in order to securely share (buy/sell) sensitive health records/data while maintaining strong privacy protections. 
This allow for more collaborative and open medical research (in DeSci space) without compromising individual privacy. 

In the Marketplace where buy/sell a Health records/data, there are the following 2 actors:
- **Seller**: **Health Data Provider** (i.e. patient, wearable device holder like Apple Watch holder)
- **Buyer**: **Medical Researcher** (who want to analze Health records/data for developing new drugs)

_The advantage for a Health Data Provider (Seller) is that:_
- A Health Data Provider can share (sell) their health data without sensitive data (i.e. Age, Name).
  - NOTE: In the ZK circuit in Noir of this project (`./circuits/src/main.nr`), whether or not the `age` of a Health Data Provider is above 18 would be validated.

- A Health Data Provider can choose which data they want to share (as the `"Selective Disclosure"` feature) 
  - NOTE: In the ZK circuit in Noir of this project (`./circuits/src/main.nr`), the `"Selective Disclosure"` feature can be seen. 

- In exchange for sharing (selling) their health records/data, a Health Data Provider can earn the rewards (fees) as a financial incentive, which is paid by a Medical Researcher when the Medical Researcher buy their health data.

_The advantage for a Medical Researcher (Buyer) is that:_
- A Medical Researcher can securely collect (buy) a health records/data that the data integrity is kept by **ZK Proof**, which is generated in **Noir** and attested by **zkVerify**.

- A Medical Researcher can securely collect (buy) a health records/data from the transparent market thanks to transacting on the **smart contract** based marketplace.

<br>

## Archtecture and Userflow

- Archtecture and Userflow: 
  - The actual functionality of the ZK based Health Records/Data Sharing Marketplace would be implemented in the HealthDataSharingExecutor contract (`HealthDataSharingExecutor.sol`).  
    https://github.com/masaun/ZK-health-records-sharing-marketplace/tree/main/doc/diagrams  
    ![Image](https://github.com/user-attachments/assets/f99a3358-7f0f-4e02-bd31-9267d95dc79d)


<br>

## DEMO Video

### Basic information of DEMO Video
- DEMO Video link: https://youtu.be/mpMr7RNzpJM
  
- In the DEMO Video above, there are 2 pages:
  - The page for a Health Data Provider (URL: `http://localhost:3000`)
  - The other page for a Medical Researcher (URL: `http://localhost:3000/medicalResearcherPage`)

- Both pages can work - after locally running the frontend app in the `./app` directory by the `npm run dev` command. 

<br>

### Description of DEMO Video


<br>

### Limitation of DEMO Video

- Input data (Health records/data) must be inputted via the `Prover.toml` (`./circuits/src/Prover.toml`) to generate Noir's UltraPlonk Proof and zkVerify's UltraPlonk Proof.
  - In the future, these input data should be inputted via UI.


<br>


## Deployed-smart contracts on EDU Chain (testnet)

| Contract Name | Descripttion | Deployed-contract addresses on EDU Chain (testnet) |
| ------------- |:-------------:| -----:|
| ZkVerifyAttestation | xxx | 0x147AD899D1773f5De5e064C33088b58c7acb7acf |
| UltraVerifier | xxx | 0x71F3108Be6F52D59fdc220C2aFd21B3721Bf5fb7 |
| HealthDataSharingVerifier | xxx | 0x23C6269f0807bFc14ab91A7d32Ad9b643B96cA1A |
| HealthDataSharingExecutor | xxx | 0x097eB4757edba7D2c398411C07091A5Ac8ce9FEe |

NOTE: Basically, the HealthDataSharingExecutor contract would work as the Health Records/Data Sharing Marketplace.

<br>

<hr>


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
