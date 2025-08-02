import { useState } from "react";
import { generateRandomProof } from "./zk/generateProof";
import "./zkStyle.css";
import { poseidon2Hash } from "@zkpassport/poseidon2";
import useMetaMask from "./hooks/useMetaMask";

// These must match your Noir circuit's max config!
const MAX_CANDIDATES = 16;
const MAX_PICK = 8;

// String → Field (bigint)
function stringToBigInt(str: string): bigint {
  if (!str) return BigInt(0);
  const utf8 = new TextEncoder().encode(str);
  let hex =
    "0x" +
    Array.from(utf8)
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  return BigInt(hex);
}

// Candidate string list → Field[] (hashed)
function candidateListToFields(list: string[]): bigint[] {
  return list.map((item) => poseidon2Hash([stringToBigInt(item)]));
}

// Result Field[] → original candidate names (ignoring 0s)
function fieldsToCandidateNames(
  fields: bigint[],
  originalList: string[]
): string[] {
  const table = new Map(
    originalList.map((str) => [
      poseidon2Hash([stringToBigInt(str)]).toString(),
      str,
    ])
  );
  return fields
    .filter((f) => f !== BigInt(0))
    .map((f) => table.get(f.toString()) ?? "Unknown");
}

export default function App() {
  const { account, connect, disconnect } = useMetaMask();

  // UI state
  const [candidates, setCandidates] = useState<string>(
    "paul, pico, moneymonkey, wooseong, pixy, racoon"
  );
  const [pickCount, setPickCount] = useState<number>(2);
  const [userSeed, setUserSeed] = useState<string>("");
  // Results
  const [commitment, setCommitment] = useState<string>("");
  const [randomResult, setRandomResult] = useState<string[] | null>(null);
  const [proofObj, setProofObj] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Input validation
  function isValidInput(candidateArr: string[], pickCount: number) {
    if (
      candidateArr.length === 0 ||
      candidateArr.length > MAX_CANDIDATES ||
      pickCount < 1 ||
      pickCount > MAX_PICK ||
      pickCount > candidateArr.length
    )
      return false;
    return true;
  }

  // Generate proof and pick
  const handleGenerate = async () => {
    setStatus("Generating random result and proof...");
    setVerifyResult("");
    setRandomResult(null);
    setProofObj(null);
    try {
      // Parse candidates (allow comma, newline, or whitespace)
      const candidateList = candidates
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s);
      if (!isValidInput(candidateList, pickCount)) {
        setStatus("");
        setVerifyResult(
          `Enter between 1 and ${MAX_CANDIDATES} candidates, and pick 1~${MAX_PICK} (no more than candidate count).`
        );
        return;
      }

      // Hash candidates to bigint[]
      let candidateFields = candidateListToFields(candidateList);

      // Pad to max length for Noir circuit
      while (candidateFields.length < MAX_CANDIDATES)
        candidateFields.push(BigInt(0));

      // ★ bigint[] → string[] 변환 필수!
      const candidateFieldsStr = candidateFields.map((b) => b.toString());

      // Seed conversion bigint → string
      const userSeedBigInt = stringToBigInt(userSeed);
      const userSeedStr = userSeedBigInt.toString();

      setCommitment(poseidon2Hash([userSeedBigInt]).toString());

      // ★ inputs 타입에 맞게 문자열로 전달
      const inputs = {
        candidates: candidateFieldsStr, // string[]
        pick_count: pickCount, // number
        user_seed: userSeedStr, // string
      };

      const result = await generateRandomProof(inputs);

      // Noir circuit returns [Field; 5]; filter out zeros and map back to names
      setRandomResult(
        fieldsToCandidateNames(result.randoms ?? [], candidateList)
      );

      setProofObj(result);
    } catch (e: any) {
      setVerifyResult("Error: " + e.message);
    }
    setStatus("");
  };

  // Proof verification
  const handleVerify = async () => {
    if (!proofObj) {
      setVerifyResult("Generate a proof first!");
      return;
    }
    setStatus("Verifying...");
    try {
      const verified = await proofObj.verify;
      setVerifyResult(
        verified ? "✅ Verification successful" : "❌ Verification failed"
      );
    } catch (e: any) {
      setVerifyResult("Verification error: " + e.message);
    }
    setStatus("");
  };

  // UI
  return (
    <div className="zk-center-wrapper">
      {/* MetaMask 연결 버튼 - 오른쪽 상단 */}
      <div className="metamask-container">
        {!account ? (
          <button className="metamask-btn connect" onClick={connect}>
            Connect Wallet
          </button>
        ) : (
          <div className="metamask-info">
            <span className="account-short">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button className="metamask-btn disconnect" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="zk-card">
        <h1 className="zk-title">ZK Random Picker</h1>

        <div className="zk-form">
          <label className="zk-label">
            Candidate list (comma or newline, up to {MAX_CANDIDATES}):
            <textarea
              rows={3}
              value={candidates}
              onChange={(e) => setCandidates(e.target.value)}
              className="zk-input"
              placeholder="e.g. banana, apple, kiwi"
            />
          </label>
          <label className="zk-label">
            Number to pick (max {MAX_PICK}):
            <input
              type="number"
              min={1}
              max={MAX_PICK}
              value={pickCount}
              onChange={(e) => setPickCount(Number(e.target.value))}
              className="zk-input"
            />
          </label>
          <label className="zk-label">
            User seed (for fairness):
            <input
              type="text"
              value={userSeed}
              onChange={(e) => setUserSeed(e.target.value)}
              className="zk-input"
              placeholder="e.g. mySecretSeed"
            />
          </label>
          <button
            className="zk-btn"
            onClick={handleGenerate}
            disabled={status !== ""}
          >
            Generate + Prove
          </button>
        </div>
        <div className="zk-form">
          <button
            className="zk-btn"
            onClick={handleVerify}
            disabled={!proofObj || status !== ""}
          >
            Verify Proof
          </button>
        </div>
        {status && <div className="zk-status">{status}</div>}
        {commitment && (
          <div className="zk-result-row">
            <b>
              Seed
              <br />
              Commitment:
            </b>
            <span className="zk-monospace">{commitment}</span>
          </div>
        )}
        {randomResult && (
          <div className="zk-result-row">
            <b>Picked Results:</b> {randomResult.join(", ")}
          </div>
        )}
        {proofObj && (
          <div className="zk-result-row">
            <b>Proof:</b>
            <pre className="zk-proof-pre">
              {JSON.stringify(proofObj.proof, null, 2)}
            </pre>
            <b>Public Input:</b>
            <pre className="zk-proof-pre">
              {JSON.stringify(proofObj.publicInput, null, 2)}
            </pre>
          </div>
        )}
        {verifyResult && (
          <div className="zk-result-row">
            <b>
              Verification
              <br />
              Result:
            </b>
            <span className="zk-monospace">{verifyResult}</span>
          </div>
        )}
      </div>
    </div>
  );
}
