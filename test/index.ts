import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CreatorNFT } from "../typechain";

describe("CreatorNFT", () => {
  let accounts: Signer[];
  let developerAddress: string;
  let creatorNFT: CreatorNFT;

  const MINT_FEE = ethers.utils.parseEther("50");
  const SUPPLY = 200;

  beforeEach(async () => {
    const CreatorNFT = await ethers.getContractFactory("CreatorNFT");
    accounts = await ethers.getSigners();
    developerAddress = await accounts[0].getAddress();
    creatorNFT = await CreatorNFT.deploy(MINT_FEE, SUPPLY);
    await creatorNFT.deployed();
  });

  describe("Deployment", () => {
    it("Should have developer as owner", async () => {
      expect(await creatorNFT._deveolper()).to.equal(
        await accounts[0].getAddress()
      );
    });
    it("Should have fee set to " + MINT_FEE, async () => {
      expect(await creatorNFT._feeAmount()).to.equal(MINT_FEE);
    });
    it("Should transfer ownership", async () => {
      await creatorNFT.transferOwnership(await accounts[1].getAddress());
      await creatorNFT
        .connect(accounts[1])
        .addAddressToWhitelist(await accounts[2].getAddress());
      expect(
        await creatorNFT.whitelist(await accounts[2].getAddress())
      ).to.equal(true);
    });
  });

  describe("Whitelist", () => {
    it("Should not let someone mint that is not on the whitelist", async () => {
      await expect(
        creatorNFT.mintNFT(2, {
          from: await accounts[0].getAddress(),
          value: MINT_FEE,
        })
      ).to.be.revertedWith("Not on whitelist");
    });
    it("Should let someone mint that is on the whitelist", async () => {
      await creatorNFT.addAddressToWhitelist(await accounts[0].getAddress());

      await expect(
        creatorNFT.mintNFT(2, {
          from: await accounts[0].getAddress(),
          value: MINT_FEE,
        })
      )
        .to.emit(creatorNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, developerAddress, 0);
    });

    it("Should let anyone mint after sale started", async () => {
      await creatorNFT.flipSaleStarted();

      await expect(
        creatorNFT.mintNFT(2, {
          from: await accounts[0].getAddress(),
          value: MINT_FEE,
        })
      )
        .to.emit(creatorNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, developerAddress, 0);
    });
  });

  describe("Transactions", () => {
    it("Should only have " + SUPPLY + " NFTs", async () => {
      await creatorNFT.flipSaleStarted();
      for (let i = 0; i < SUPPLY; i++) {
        await creatorNFT.connect(accounts[1]).mintNFT(1, {
          from: await accounts[1].getAddress(),
          value: MINT_FEE,
        });
      }

      await expect(
        creatorNFT.mintNFT(2, {
          from: await accounts[0].getAddress(),
          value: MINT_FEE,
        })
      ).to.be.revertedWith("No tokens left");
    });
  });
});
