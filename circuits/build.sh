echo "Compiling circuit..."
nargo compile
if [ $? -ne 0 ]; then
  exit 1
fi

echo "Generate witness..."
nargo execute

echo "Proving and generating a ZK Proof..."
bb prove -b ./target/health_data_sharing.json -w ./target/health_data_sharing.gz -o ./target/health_data_sharing_proof.bin

echo "Generating vkey..."
bb write_vk -b ./target/health_data_sharing.json -o ./target/health_data_sharing_vk.bin

echo "Link vkey to the zkProof"
bb verify -k ./target/health_data_sharing_vk.bin -p ./target/health_data_sharing_proof.bin

echo "Check a zkProof"
head -c 32 ./target/health_data_sharing_proof.bin | od -An -v -t x1 | tr -d $' \n'

echo "Copy and paste vk for generating a Solidity Verifier contract"
cp ./target/health_data_sharing_vk.bin ./target/vk

echo "Generate a Solidity Verifier contract"
bb contract

echo "Done"