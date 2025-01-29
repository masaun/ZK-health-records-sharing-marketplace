pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";
import { HashingWithKeccak256 } from "../../contracts/hashing/HashingWithKeccak256.sol";


contract HashingWithKeccak256Test is Test {
    HashingWithKeccak256 public hashingWithKeccak256;

    function setUp() public {
        hashingWithKeccak256 = new HashingWithKeccak256();
    }

    function testHashWithKeccak256() public view {
        string memory _message = "John";
        console2.logString(_message);     // John

        bytes32 messageHash = hashingWithKeccak256.stringToHash(_message);
        console2.logBytes32(messageHash); // 0xbc99422d9e0abdd8ab52ce43a39333e401a87a9afa547572ea407e5699240479
    }

    function testConvertKeccak256HashToUint32() public view {
        string memory _message = "John";
        //string memory _message = "Carol";
        console2.logString(_message);     // John

        bytes32 messageHash = hashingWithKeccak256.stringToHash(_message);
        console2.logBytes32(messageHash); // 0xbc99422d9e0abdd8ab52ce43a39333e401a87a9afa547572ea407e5699240479

        uint32 messageUint32 = hashingWithKeccak256.hashToUint32(messageHash);
        console2.logUint(messageUint32);  // 2569274489 (from "John")
                                          // 1554133789 (from "Carol")
    }
}