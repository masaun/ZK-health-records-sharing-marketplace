echo "Converting a original Ultraplonk proof to a zkVerify verion of Ultraplonk proof"
nargo compile
if [ $? -ne 0 ]; then
  exit 1
fi

echo "Convert an original Ultraplonk proof to a zkVerify verion of Ultraplonk proof"
noir-cli proof-data -n 14 --input-proof ../../target/health_data_sharing_proof.bin --output-proof ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_proof.bin --output-pubs ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_pubs.bin
#noir-cli proof-data -n 2 --input-proof ../../target/health_data_sharing_proof.bin --output-proof ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_proof.bin --output-pubs ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_pubs.bin

echo "Convert a VK of the original Ultraplonk proof to a zkVerify verion of VK"
noir-cli key --input ../../target/health_data_sharing_vk.bin --output ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_vk.bin

echo "Verify the converted-Proof, Pubs, VK"
noir-cli verify --key ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_vk.bin --proof ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_proof.bin --pubs ../output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_pubs.bin

#echo "Generate a JSON file includes the converted-Proof, Pubs, VK in the /final_output directory"
#node ../zkVerify/proof-json_generator.js

echo "Done"