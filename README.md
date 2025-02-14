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
  https://github.com/masaun/ZK-health-records-sharing-marketplace/tree/main/doc/diagrams  
  ![Image](https://github.com/user-attachments/assets/f99a3358-7f0f-4e02-bd31-9267d95dc79d)


- NOTE: 
  - The actual functionality of the ZK based Health Records/Data Sharing Marketplace would mainly be implemented in the HealthDataSharingExecutor contract (`HealthDataSharingExecutor.sol`).  

  - For the moment, a Health Data Provider would input their Health records/data (input data) via the `Prover.toml` (`./circuits/src/Prover.toml`) to generate Noir's UltraPlonk Proof and zkVerify's UltraPlonk Proof.
  - In the future, these input data should be inputted via UI.


<br>

## DEMO Video

### Basic information of DEMO Video
- DEMO Video link: https://youtu.be/0ZT3VYYUTi4
  
- In the DEMO Video above, there are 2 pages:
  - The page for a Health Data Provider (URL: `http://localhost:3000`)
  - The other page for a Medical Researcher (URL: `http://localhost:3000/medicalResearcherPage`)

- Both pages can work - after locally running the frontend app in the `./app` directory by the `npm run dev` command. 

<br>

### Description of DEMO Video

- Time 0.01~). Explain ZK circuit in Noir.
  - `Selective Disclosure` by storing a given input data into the `RevealedData` struct and returning it as a `public input` value.
  - Writing the input data (Health Records/Data) in the `Prover.toml`.

- Time 1:51~). 
  - Generating a ZK Proof of the input data (Health Records/Data) in Noir.
    (The detail of this process can be seen in the ["ZK circuit - Generate (Prove) an Ultraplonk proof in Noir" paragraph](https://github.com/masaun/ZK-health-records-sharing-marketplace?tab=readme-ov-file#zk-circuit---generate-prove-an-ultraplonk-proof-in-noir))


- Time 2.04~).
  - Convert an original Ultraplonk proof in Noir to an Ultraplonk proof in zkVerify version (by using UltraPlonk zk-SNARK Verifier powered by zkVerify)
    (The detail of this process can be seen [here](https://github.com/masaun/ZK-health-records-sharing-marketplace?tab=readme-ov-file#ultraplonk-zk-snark-verifier-powered-by-zkverify---convert-an-original-ultraplonk-proof-in-noir-to-an-ultraplonk-proof-in-zkverify-version))

- Time 4:00~).
  - Run the frontend (UI) locally by running `npm run dev` command and then opening a web browser with `http://localhost:3000` (which is the "Page for Health Data Provider").

- Time 4:19~).
  - On the page for Health Data Provider, connecting both wallet (Polkadot and EVM) **as a `Health Data Provider`**.
  - Then, the Health Data Provider would submit a Health Data Proof to the zkVerify Network on Polkadot. 
    - At this point, the Health Data Provider would sign and send the TX (transaction) of submitting a proof on `Polkadot wallet` (i.e. Talisman).
    - At this point, the `proof data` of the Ultraplonk proof in zkVerify would be loaded and submitted as the Health Data Proof.

- Time 5:04~).
  - On the page for Health Data Provider, the TX result of the zkVerify Network and would be returned and shown with the following data.
    - TX hash on the zkVerify Network (This TX hash can be confirm by searching on the [zkVerify Block Explorer](https://zkverify-explorer.zkverify.io))
    - `Proof Type`: `UltraPlonk` (zk proof)
    - `Attestation ID`: `44354`

- Time 6:37~).
  - Then, the Health Data Provider would submit the `Attestation ID` and Health Data Proof /w its `publicInput` to `EDU Chain`. 
    - At this point, the Health Data Provider would sign and send the TX (transaction) of submitting a proof on `EVM wallet` (i.e. MetaMask).
    - This TX hash on `EDU Chain` can be searched on the [`EDU Chain` Block Explorer](https://edu-chain-testnet.blockscout.com/txs).


- Time 8:45~).
  - A **Medical Researcher**, who is a buyer of the health records/data, would open the "Page for Medical Researcher" (`http://localhost:3000/medicalResearcherPage`) and connect their EVM Wallet.
  - Check how much $EDU (NativeToken in EDU Chain) balance the Medical Researcher's EVM wallet hold by pushing the `"Get $EDU balance of account"` button.
  - Check which `Attestation IDs` of health records/data is buyable by pushing the button.


- Time 9:55~).
  - Buy an `Attestation ID` of the health records/data by specifying a favorble `Attestation ID` in the input field (NOTE: In this demo, a medical researcher specify `Attestation ID = 44354`) and pushing the `"Get Attestation IDs of Buyable Health Data"` button.
  - Since the price per a health records/data would be `0.00001 $EDU`, `0.00001 $EDU` would be transferred during the Medical Researcher's TX for buying a health records/data.
  - This TX hash on `EDU Chain` can been searched on the [`EDU Chain` Block Explorer](https://edu-chain-testnet.blockscout.com/txs).

  
- Time 12:15~).
  - When a Medical Researcher, who already bought the Health Data, push the `"Show a Health Data-bought in decoded-values` button on the page for a Medical Researcher:
    - If you select that the `revealed` data (i.e. `revealedName`) is `false` for a certain item (i.e, `name`) when you write the `input data` (`Health Records/Data`) in the `Prover.toml` in the process of ["ZK circuit - Generate (Prove) an Ultraplonk proof in Noir"](https://github.com/masaun/ZK-health-records-sharing-marketplace?tab=readme-ov-file#zk-circuit---generate-prove-an-ultraplonk-proof-in-noir), `"Not Revealed"` would be shown for the item on UI.
      - In this DEMO Video, the `revealedName` and `revealedAge` was specified as `false` when inputing data in the `Prover.toml` to generate a ZK Proof in Noir. Hence, the `name` and `age` would be shown as `"Not Revealed"`. 


<br>

### Limitation of DEMO Video

- Input data (Health records/data) must be inputted via the `Prover.toml` (`./circuits/src/Prover.toml`) to generate Noir's UltraPlonk Proof and zkVerify's UltraPlonk Proof.
  - In the future, these input data should be inputted via UI.


<br>


## Deployed-smart contracts on EDU Chain (testnet)

| Contract Name | Descripttion | Deployed-contract addresses on EDU Chain (testnet) |
| ------------- |:-------------:| -----:|
| ZkVerifyAttestation | [zkVerify ZkAttestation Contract on EDU Chain](https://docs.zkverify.io/relevant_links#zkverify-links) | [0x147AD899D1773f5De5e064C33088b58c7acb7acf](https://edu-chain-testnet.blockscout.com/address/0x147AD899D1773f5De5e064C33088b58c7acb7acf) |
| UltraVerifier | The UltraPlonk Verifer contract (`./circuits/target/contract.sol`), which is generated based on ZK circuit in Noir (`./circuits/src/main.nr`). FYI: To generated this contract, the way of the [Noir's Solidity Verifier generation](https://noir-lang.org/docs/how_to/how-to-solidity-verifier) was used. | [0x71F3108Be6F52D59fdc220C2aFd21B3721Bf5fb7](https://edu-chain-testnet.blockscout.com/address/0x71F3108Be6F52D59fdc220C2aFd21B3721Bf5fb7) |
| HealthDataSharingVerifier | The smart contract that the validation is implemented for the UltraVerifier contract, which is generated by [Noir's Solidity Verifier generation](https://noir-lang.org/docs/how_to/how-to-solidity-verifier) | [0x23C6269f0807bFc14ab91A7d32Ad9b643B96cA1A](https://edu-chain-testnet.blockscout.com/address/0x23C6269f0807bFc14ab91A7d32Ad9b643B96cA1A) |
| HealthDataSharingExecutor | The smart contract that works as the ZK based Health Records/Data Sharing Marketplace | [0x097eB4757edba7D2c398411C07091A5Ac8ce9FEe](https://edu-chain-testnet.blockscout.com/address/0x097eB4757edba7D2c398411C07091A5Ac8ce9FEe) |

NOTE: Basically, the HealthDataSharingExecutor contract would work as the Health Records/Data Sharing Marketplace.

<br>

<hr>

# Installations of the ZK based Health Records/Data Sharing Marketplace

## Installation - Smart contract
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

## ZK circuit - Generate (Prove) an Ultraplonk proof in Noir

- 1/ Move to the `./circuits` directory:
```shell
cd circuits
```

- 2/ Create the `Prover.toml` file by coping the example file (`Prover.example.toml`) in the `./circuits` directory.
```shell
cp Prover.example.toml Prover.toml
```

- 3/ Write the `input data` (`Health Records/Data`) should be written in the `Prover.toml`.
  - [NOTE]: This `input data` would be assumed that a Health Data Provider input their `Health Records/Data`. And then, this will be used for generating a ZK proof (Ultraplonk proof) in Noir in the subsequent process.
  - [NOTE]: Each `revealed` data (i.e. `revealName`) should be written in `"Boolean"` type. But, it should be written in a string number (True: `"0"` / False: `"1"`).
```toml
name = ""
walletAddress = "<EOA /or SmartContractWallet addresss of a Health Data Provider>"
height = ""
weight = ""
age = ""
gender = ""
race_type = ""
blood_type = ""
blood_pressure_systolic = ""
blood_pressure_diastolic = ""
heart_rate = ""
average_hours_of_sleep = ""
revealName = ""
revealWalletAddress = ""
revealAge = ""
revealGender = ""
revealHeight = ""
revealWeight = ""
revealRaceType = ""
revealBloodType = ""
revealBloodPressureSystolic = ""
revealBloodPressureDiastolic = ""
revealHeartRate = ""
revealAverageHoursOfSleep = ""
```


- 2/ Run the `build.sh` to run ZK circuit
```shell
sh build.sh
```

- 3/ The UltraVerifier contract (`contract.sol`) and `proof` and `vk` in Noir would be generated under the `./circuits/target`.


<br>

## ZK circuit - Test
- Run the `circuit_test.sh` to test the ZK circuit. 
```shell
cd circuits
sh circuit_test.sh
```

<br>

## `UltraPlonk zk-SNARK Verifier` powered by zkVerify - Convert an original Ultraplonk proof in `Noir` to an Ultraplonk proof in `zkVerify` version
- 1/ Move to the `./circuits/zkVerify/ultraplonk_verifier` directory:
```shell
cd circuits/zkVerify/ultraplonk_verifier
```
(NOTE: The `./circuits/zkVerify/ultraplonk_verifier` would be the [ultraplonk_verifier `v0.3.0`](https://github.com/zkVerify/ultraplonk_verifier) powered by zkVerify team. Please make sure the version is `v0.3.0`)

- 2/ Convert an given original Ultraplonk proof to the zkVerify version of Ultraplonk proof
```shell
sh convert_ultraplonk_to_zkverify_proof.sh
```

- 3/ The three files (`proof`, `pubs`, `vk`) in zkVerify version would be generated under the `./circuits/zkVerify/output_zkverify_version_of_proof_pubs_vk` directory.
  - 2 type (`.hex`, `.bin`) of files would be generated for the three files respectively.

- 4/ Create the `ultraplonk_health_data_sharing_zkv.json` by coping the example file (`ultraplonk_health_data_sharing_zkv.example.json`) in the `./circuits/zkVerify/final-output/` directory.
```shell
cp ultraplonk_health_data_sharing_zkv.example.json ultraplonk_health_data_sharing_zkv.json
```

- 5/ Copy the arguments-copied from the `.hex` version of the three files-generated in the `./circuits/zkVerify/output_zkverify_version_of_proof_pubs_vk` directory. Then, it should be pasted to the three properties (`vk`, `publicSignals`, `proof`) in the `./circuits/zkVerify/final-output/ultraplonk_health_data_sharing_zkv.json`.


<br>

## Smart Contract - Compile

- Compile the smart contracts
```shell
sh ./buildContract.sh
```

<br>

## Smart Contract - Test

- Run the test of the `HealthDataSharingViaNoirHelper.t.sol`, which is the test file of the `HealthDataSharingVerifier.sol`.
```shell
sh ./test/runningTest_2.sh
```

<br>

## Smart Contract for Hashing - Test
- Run the test of the `HashingWithKeccak256.t.sol`
```shell
sh ./test/hashing/runningTest_hash_1.sh
```

- Run the test of the `HashingWithSha256.t.sol`
```shell
sh ./test/hashing/runningTest_hash_2.sh
```

<br>

## Smart Contract - Deployment (on `EDU Chain`)

- NOTE: Each Smart Contract has been deployed on `EDU Chain`. See the `"Deployed-smart contracts on EDU Chain (testnet)"` paragraph above in this README.

- 1/ Create the `.env` file by coping the example file (`.env.example`) in the root directory.
  - Then, you should add a private key of your deployer address to the `EDU_CHAIN_PRIVATE_KEY`.
```shell
cp .env.example .env
```

- 2/ Deploy all contracts on EDU Chain (testnet) by running the `script/DeploymentAllContracts.s.sol` 
```bash
/// [NOTE]: Execute the following at the root directory.

forge script script/DeploymentAllContracts.s.sol --broadcast --private-key <EDU_CHAIN_PRIVATE_KEY> \
    ./contracts/zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol:ZkVerifyAttestation \
    ./circuits/target/contract.sol:UltraVerifier \
    ./contracts/circuits/HealthDataSharingVerifier.sol:HealthDataSharingVerifier \
    ./contracts/HealthDataSharingExecutor.sol:HealthDataSharingExecutor --skip-simulation
```

<br>

## Frontend (UI)

- Prequisities
  - Node 18+
  - [zkVerify Wallet](https://docs.zkverify.io/tutorials/connect-a-wallet)

- 1/ Move to `./app` directory
```shell
cd app
```

- 2/ Create the `.env` file by coping the example file (`.env.example`) in the `./app` directory.
```shell
cp .env.example .env
```

- 3/ Install
```shell
npm install
```

- 4/ Install `zkverifyjs` (`v0.6.0`)
```shell
npm i zkverifyjs
```

- 5/ Run
```shell
npm run dev
```

- 5/ Open the WebApp (`http://localhost:3000`) on your Web Browser (i.e. Google Chrome).