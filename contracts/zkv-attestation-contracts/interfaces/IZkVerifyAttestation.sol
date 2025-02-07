// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.20;

/**
 * @dev Define interface Horizen verifier
 */
interface IZkVerifyAttestation {

    /// @notice Reference from the deployed-contract on EDU Chain: https://edu-chain-testnet.blockscout.com/address/0x147AD899D1773f5De5e064C33088b58c7acb7acf?tab=contract
    /// @notice Emitted when a new attestation is posted.
    /// @param _attestationId Event attestationId.
    /// @param _proofsAttestation Aggregated proofs attestation.
    event AttestationPosted(uint256 indexed _attestationId, bytes32 indexed _proofsAttestation);

    function submitAttestation(
        uint256 _attestationId,
        bytes32 _proofsAttestation) external;

    function submitAttestationBatch(
        uint256[] calldata _attestationIds,
        bytes32[] calldata _proofsAttestation) external;

    function verifyProofAttestation(
        uint256 _attestationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index) external returns (bool);
}