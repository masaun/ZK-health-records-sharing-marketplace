const fs = require("fs");

// const proof = require("./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_proof.hex");
// const pubs = require("./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_pubs.hex");
// const vk = require("./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_vk.hex");
let proof;
let pubs;
let vk;
const proof_path = "./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_proof.hex";
const pubs_path = "./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_pubs.hex";
const vk_path = "./output_zkverify_version_of_proof_pubs_vk/zkv_health_data_sharing_vk.hex";

fs.readFile(proof_path, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("proof:", data);
    proof = data;
});

fs.readFile(pubs_path, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("pubs:", data);
    pubs = data;
});

fs.readFile(vk_path, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("vk:", data);
    vk = data;
});

// console.log("proof:", JSON.stringify(proof));
// console.log("pubs:", JSON.stringify(pubs));
// console.log("vk:", JSON.stringify(vk));

const ultraplonk_zkv_json_to_be_generated =
{
    "vk": vk,
    "publicSignals": [
        pubs
    ],
    "proof": proof
};

const jsonData = JSON.stringify(ultraplonk_zkv_json_to_be_generated, null, 2);

fs.writeFile("./final-output/ultraplonk_health_data_sharing_zkv.json", jsonData, 'utf8', (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('Data written to file');
    }
});