# !/bin/bash

forge build
mkdir -p ../client/src/contracts
cp out/Verifier.sol/Verifier.json ../client/src/contracts/Verifier.json