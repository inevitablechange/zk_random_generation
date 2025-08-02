import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "./circuit.json";
import { Noir } from "@noir-lang/noir_js";
import type { InputMap } from "@noir-lang/noir_js";

// Initialize Noir and the backend
const noir = new Noir(circuit as any);
noir.init();
const honk = new UltraHonkBackend(circuit.bytecode, { threads: 3 });

// Main function to generate proof for the random picker
export async function generateRandomProof(inputs: InputMap) {
  // Run the Noir circuit with user input
  const circuitRet = await noir.execute(inputs);
  const witness = circuitRet.witness;

  // The Noir circuit should return random results as an array:
  // If your circuit returns as e.g. { randoms: [Field; 5] }, use witness.randoms.
  // If your circuit uses a different field name, update accordingly.
  const randoms =
    witness.randoms ||
    witness["randoms"] ||
    witness.random ||
    witness["random"] ||
    [];

  // Generate ZK proof using the Barretenberg UltraHonk backend
  const proofData = await honk.generateProof(witness, {
    keccak: true, // enable keccak hash (matches Noir circuit publicInputs)
  });

  return {
    ...proofData,
    witness,
    randoms, // array of picked candidate Field values (bigint)
    publicInput: inputs,
    // Async verification function: resolves to true/false
    verify: honk.verifyProof(proofData, { keccak: true }),
    proof: proofData.proof,
  };
}
