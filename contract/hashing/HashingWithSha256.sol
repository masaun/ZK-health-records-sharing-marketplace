pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";

contract HashingWithSha256 {
    //bytes32 private messageHash;

    function stringToHash(string memory _message) public view returns (bytes32 _messageHash) {
        bytes memory _messageBytes = abi.encodePacked(_message);
        bytes32 messageHash = sha256(_messageBytes);
        return messageHash;
    }

    function uint32ToHash(uint32 _message) public view returns (bytes32 _messageHash) {
        bytes memory _messageBytes = abi.encodePacked(Strings.toString(_message));
        bytes32 messageHash = sha256(_messageBytes);
        return messageHash;
    }

    // function uint32ArrayToHash(uint32[] calldata _message) public view returns (bytes32 _messageHash) {
    //     bytes32 messageHash = sha256(_message);
    //     return messageHash;
    // }

    function hashToUint32(bytes32 _messageHash) public view returns (uint32 _messageUint32) {
        uint _messageUint = uint(_messageHash);
        return uint32(_messageUint);
    }

}