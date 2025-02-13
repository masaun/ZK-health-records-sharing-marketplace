pragma solidity ^0.8.17;

import { HealthDataSharingVerifier } from "./circuits/HealthDataSharingVerifier.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr

/** 
 * @notice - HealthDataSharing Requester contract
 * @notice - a Wearable Device holder (i.e. Apple Watch, Pulse holder) Medical Researcher (and Hospital) would create a Health Data Request
 * @notice - Scenario: a Wearable Device (i.e. Apple Watch, Pulse) holder can send their medical data (i.e. Execise Hours + Blood Presure) to the medical researcher - without revealing extra sensitive personal data on their Smart Watch.
 */
contract HealthDataSharingRequester {
    HealthDataSharingVerifier public healthDataSharingVerifier;

    uint256 public medicalResearcherId;
    uint256 public healthDataSharingRequestId;

    mapping (address => uint256) public medicalResearchers;
    mapping (uint256 => address) public medicalResearchersByIds;
    mapping (uint256 => mapping (uint256 => HealthDataSharingRequest)) public healthDataSharingRequests;

    struct HealthDataSharingRequest {
        /// [TODO]:
        string bloodType;
        uint80 bloodPressure;
    }

    modifier onlyMedicalResearcher() {
        uint256 medicalResearcherId = medicalResearchers[msg.sender]; 
        require(medicalResearchersByIds[medicalResearcherId] != address(0), "Not registered as a medical researcher");
        _;
    }

    constructor(HealthDataSharingVerifier _healthDataSharingVerifier) {
        healthDataSharingVerifier = _healthDataSharingVerifier;
    }

    /** 
     * @notice - Create new medical data request
     * return - new medical data request ID /w medical data, which the medical researcher (msg.sender) want to collect.
     * [TODO]: Add the implementation of the "bytes memory medicalData" parameter.
     */
    function createNewhealthDataSharingRequest(
        address medicalResearcherAccount, 
        bytes memory medicalDataToBeRequested
    ) 
        public onlyMedicalResearcher() 
        returns(uint256 _medicalDataRequestId) 
    {
    //function createNewhealthDataSharingRequest(address medicalResearcherAccount, string memory _bloodType, uint80 _bloodPressure) public onlyMedicalResearcher() returns(uint256 _medicalDataRequestId) {
        /// [TODO]: 
        uint256 medicalResearcherId = medicalResearchers[medicalResearcherAccount];
        HealthDataSharingRequest memory healthDataSharingRequest = healthDataSharingRequests[medicalResearcherId][healthDataSharingRequestId];
        //healthDataSharingRequest.bloodType = _bloodType;
        //healthDataSharingRequest.bloodPressure = _bloodPressure;
        healthDataSharingRequestId++;
    }

    function getHealthDataSharingRequest(uint256 medicalResearcherId, uint256 healthDataSharingRequestId) public view returns (HealthDataSharingRequest memory healthDataSharingRequest) {
        return healthDataSharingRequests[medicalResearcherId][healthDataSharingRequestId];
    }


    /** 
     * @notice - Register functionss
     */
    function registerAsMedicalResearcher(address account) public returns(uint256 medicalResearcherId) {
        medicalResearchers[account] = medicalResearcherId; 
        medicalResearchersByIds[medicalResearcherId] = account;
        medicalResearcherId++;
    }

    function getMedicalResearcherById(uint256 medicalResearcherId) public returns (address medicalResearcherAccount) {
       return medicalResearchersByIds[medicalResearcherId];
    }
}