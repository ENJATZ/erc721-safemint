import { ethers } from "hardhat";
import { updateConfig, config } from "@repo/config-contract";
import { getABI } from "../utils/abi";

async function main(name: string): Promise<void> {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log(`Deploying ${name} with account: ${deployerAddress}`);

  // Deploy contract with constructor parameters (defaultAdmin, pauser, minter)
  // Using deployer address for all roles for simplicity
  const contract = await ethers.deployContract(name, [
    deployerAddress,
    deployerAddress,
    deployerAddress,
  ]);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`${name} Contract deployed with address: ${address}`);
  const tokenABI = await getABI(name);
  updateConfig(
    name,
    {
      ...config,
      CONTRACT_ADDRESS: address,
    },
    tokenABI
  );
  console.log("Config updated");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main("VeChainAcademy").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
