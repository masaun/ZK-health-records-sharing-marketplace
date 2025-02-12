pragma solidity ^0.8.17;

library Converter {
    /// @dev - Convert bytes32 to uint256
    function bytes32ToUint256(bytes32 valueInBytes32) public pure returns (uint256 _valueInUint256) {
        return uint256(valueInBytes32);
    }
}