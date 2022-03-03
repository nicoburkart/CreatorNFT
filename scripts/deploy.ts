// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const CreatorNFT = await ethers.getContractFactory("CreatorNFT");
  const creatorNFT = await CreatorNFT.deploy(5);

  await creatorNFT.deployed();

  console.log("CreatorNFT deployed to:", creatorNFT.address);

  await creatorNFT.addAddressToWhitelist(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );

  // Call the function.
  let txn = await creatorNFT.mintNFT(2);
  // Wait for it to be mined.
  await txn.wait();

  await creatorNFT.flipSaleStarted();
  console.log("Sale started");

  // Call the function.
  txn = await creatorNFT.mintNFT(1);
  // Wait for it to be mined.
  await txn.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
