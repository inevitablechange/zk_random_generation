import { useState } from "react";
import { generateAgeProof } from "./zk/generateProof";
import { poseidon2Hash } from "@zkpassport/poseidon2";
import * as buffer from "buffer";

// Buffer를 전역으로 설정
(window as any).Buffer = buffer.Buffer;

export default function App() {
  const [age, setAge] = useState<number>(0);
  const [minAge, setMinAge] = useState<number>(20);
  const [proofObj, setProofObj] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // 증명 생성 및 즉석 검증 (임시 더미 데이터)
  const handleGenerate = async () => {
    setStatus("증명 생성 중...");
    try {
      const nonce = BigInt(100);
      const commitment = poseidon2Hash([BigInt(age), nonce]);
      const inputs = {
        age: age,
        nonce: nonce.toString(),
        min_age: minAge,
        commitment: commitment.toString(),
      };
      const result = await generateAgeProof(inputs);
      setProofObj({ ...result, nonce, commitment });
      const verified = await result.verify;
      setVerifyResult(
        verified ? "✅ 인증 통과 (Pass)" : "❌ 인증 실패 (Non-Pass)"
      );
    } catch (e) {
      setVerifyResult("에러: " + (e as any).message);
    }
    setStatus("");
  };

  // 별도 검증 버튼 (온체인/외부 검증 흉내)
  const handleVerify = async () => {
    if (!proofObj) {
      setVerifyResult("증명을 먼저 생성하세요!");
      return;
    }
    setStatus("별도 검증 중...");
    try {
      setVerifyResult(proofObj.verified ? "✅ 검증 성공" : "❌ 검증 실패");
    } catch (e) {
      setVerifyResult("검증 에러: " + (e as any).message);
    }
    setStatus("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>ZK 나이 인증 (UltraHonkBackend)</h1>
      <label>
        나이:
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </label>
      <br />
      <label>
        최소 나이:
        <input
          type="number"
          value={minAge}
          onChange={(e) => setMinAge(Number(e.target.value))}
        />
      </label>
      <br />
      <button onClick={handleGenerate}>증명 생성 및 즉석 검증</button>
      <button onClick={handleVerify} style={{ marginLeft: 10 }}>
        별도 검증(Verify Proof)
      </button>
      <br />
      <br />
      {status && <p>{status}</p>}
      {proofObj && (
        <details>
          <summary>proof/witness/publicInputs 보기</summary>
          <div>
            <b>Proof:</b>
            <pre>{JSON.stringify(proofObj.proof, null, 2)}</pre>
            <b>Public Inputs:</b>
            <pre>{JSON.stringify(proofObj.publicInputs, null, 2)}</pre>
            <b>Witness:</b>
            <pre>{JSON.stringify(proofObj.witness, null, 2)}</pre>
            <b>Nonce:</b>
            <pre>{proofObj.nonce?.toString()}</pre>
            <b>Commitment:</b>
            <pre>{proofObj.commitment?.toString()}</pre>
          </div>
        </details>
      )}
      <p style={{ fontWeight: "bold", fontSize: 20 }}>{verifyResult}</p>
    </div>
  );
}
