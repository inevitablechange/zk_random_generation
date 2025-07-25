# !/bin/bash

set -e

rm -rf ./target/zk_age_noir.json
rm -rf ./target/vk

echo "Compiling circuit..."
if ! nargo compile; then
    echo "Compilation failed. Exiting..."
    exit 1
fi

cp ./target/zk_age_noir.json ../client/src/zk/circuit.json

echo "Generating vkey..."
bb write_vk -b ./target/zk_age_noir.json -o ./target --oracle_hash keccak


echo "Generating solidity verifier..."
bb write_solidity_verifier -k ./target/vk -o ../contract/src/Verifier.sol

echo "Done"