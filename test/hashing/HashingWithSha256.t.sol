pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";
import { HashingWithSha256 } from "../../contracts/hashing/HashingWithSha256.sol";


contract HashingWithSha256Test is Test {
    HashingWithSha256 public hashingWithSha256;

    function setUp() public {
        hashingWithSha256 = new HashingWithSha256();
    }

    function testHashWithSha256() public {
        string memory _message = "John";
        console2.logString(_message);     // John

        bytes32 messageHash = hashingWithSha256.stringToHash(_message);
        console2.logBytes32(messageHash); // 0xa8cfcd74832004951b4408cdb0a5dbcd8c7e52d43f7fe244bf720582e05241da
    }

    function testConvertSha256HashToUint32() public view {
        string memory _message = "John";
        //string memory _message = "Carol";
        console2.logString(_message);     // John

        bytes32 messageHash = hashingWithSha256.stringToHash(_message);
        console2.logBytes32(messageHash); // 0xbc99422d9e0abdd8ab52ce43a39333e401a87a9afa547572ea407e5699240479

        uint32 messageUint32 = hashingWithSha256.hashToUint32(messageHash);
        console2.logUint(messageUint32);  // 3763487194 (from "John")
                                          // 1359362709 (from "Carol")
    }
}