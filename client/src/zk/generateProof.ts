import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "./circuit.json";
import { Noir } from "@noir-lang/noir_js";
import type { InputMap } from "@noir-lang/noir_js";

const noir = new Noir(circuit as any);
noir.init();
const honk = new UltraHonkBackend(circuit.bytecode, { threads: 3 });

export async function generateAgeProof(inputs: InputMap) {
  const circuitRet = await noir.execute(inputs);
  const witness = circuitRet.witness;
  const proofData = await honk.generateProof(witness, {
    keccak: true,
  });

  return {
    ...proofData,
    witness,
    verify: honk.verifyProof(proofData, { keccak: true }),
  };
}
