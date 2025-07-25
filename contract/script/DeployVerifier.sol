// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";
import {Verifier} from "src/Verifier.sol";

contract DeployVerifier is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        if (block.chainid == 31337) {
            pk = vm.envUint("HARDHAT_NODE_PK");
        }
        address deployer = vm.addr(pk);
        console.log("Deployer address:", deployer);


        vm.startBroadcast(pk);
        address verifier = address(new Verifier());
        console.log("Verifier deployed at: ", verifier);

        address challenge = address(new VanityAddressChallenge(deployer, verifier));
        console.log("VanityAddressChallenge deployed at:", challenge);
        vm.stopBroadcast();
    }
}
