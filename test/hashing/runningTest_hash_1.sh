echo "Running the test of the HashingWithKeccak256Test..."
forge test --optimize --optimizer-runs 5000 --evm-version cancun --match-contract HashingWithKeccak256Test --via-ir -vv 