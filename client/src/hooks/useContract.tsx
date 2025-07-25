import { ethers } from "ethers";
import React from "react";
import { contracts } from "../config/contracts";
const useContract = (provider: ethers.BrowserProvider | null) => {
  const [verifierC, setVerifierC] = React.useState<ethers.Contract | null>(
    null
  );

  React.useEffect(() => {
    if (!provider) return;

    const verifierContract = new ethers.Contract(
      contracts.verifier.address,
      contracts.verifier.abi,
      provider
    );
    setVerifierC(verifierContract);
  }, [provider]);

  return { verifierC };
};

export default useContract;
