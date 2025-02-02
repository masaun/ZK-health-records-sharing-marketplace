const fs = require("fs");

const proof = require("./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_proof.hex");
const pubs = require("./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_pubs.hex");
const vk = require("./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_vk.hex");
console.log("proof:", JSON.stringify(proof));
console.log("pubs:", JSON.stringify(pubs));
console.log("vk:", JSON.stringify(vk));

const ultraplonk_zkv_json_to_be_generated =
{
    "vk": JSON.stringify(vk.toString()),
    "publicSignals": [
        JSON.stringify(pubs.toString())
    ],
    "proof": JSON.stringify(proof.toString())
};

const jsonData = JSON.stringify(ultraplonk_zkv_json_to_be_generated, null, 2);

fs.writeFile("./final-output/ultraplonk_health_data_sharing_zkv.json", jsonData, 'utf8', (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('Data written to file');
    }
});