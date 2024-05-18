const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random NFT Unit Tests", function () {
      let randomNft, deployer, vrfMock;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["vrfMock", "random"]);
        randomNft = await ethers.getContractAt(
          "RandomIpfsNft",
          "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
          deployer
        );

        vrfMock = await ethers.getContractAt(
          "VRFCoordinatorV2Mock",
          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          deployer
        );
      });

      describe("constructor", () => {
        it("initializes contract state correctly", async () => {
          const tokenURI = await randomNft.getTokenURI(1);
          const mintFee = await randomNft.getMintFee();
          assert(tokenURI.includes("ipfs://"));
          assert(mintFee > 0);
        });
      });
      describe("requestNft", () => {
        it("fails if mintFee is less than required", async () => {
          await expect(
            randomNft.requestNft({ value: ethers.parseEther("0.00001") })
          ).to.be.reverted;
        });

        it("emits an event and kicks off a random word request after a succesful mint request", async () => {
          const mintFee = await randomNft.getMintFee();
          const txResponse = await randomNft.requestNft({ value: mintFee });
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.logs[1].args[1];
          assert(requestId);
        });
      });

      describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async () => {
          console.log("Listening for NftMinted event...");
          await new Promise(async (resolve, reject) => {
            randomNft.once(
              "NftMinted",
              async (_dogOwner, _tokenId, _dogBreed) => {
                console.log("NFt Minted!");
                try {
                  const tokenId = Number(await randomNft.getTokenCounter()) - 1;
                  console.log(`tokenId: ${tokenId}`);

                  const dogBreed = await randomNft.getBreed(3);

                  assert(isSuccess);
                  assert.equal(requester.toString(), _dogOwner.toString());
                  assert.equal(tokenId.toString(), _tokenId.toString());
                  assert.equal(dogBreed.toString(), _dogBreed.toString());
                  resolve();
                } catch (err) {
                  console.error(err);
                  reject(err);
                }
              }
            );

            const mintFee = await randomNft.getMintFee();
            const txResponse = await randomNft.requestNft({ value: mintFee });
            const txReceipt = await txResponse.wait(1);
            const requestId = txReceipt.logs[1].args[1];
            const requester = txReceipt.logs[1].args[0];
            const randomNum = [3];

            const txfulfill = await vrfMock.fulfillRandomWordsWithOverride(
              requestId,
              await randomNft.getAddress(),
              randomNum
            );

            const txfulfillReceipt = await txfulfill.wait(1);

            const isSuccess = txfulfillReceipt.logs[3].args[3];

            console.log(`isSuccess: ${isSuccess}`);
          });
        });
      });

      describe("Get Breed", () => {
        it("should return pug if random num is less than 10", async () => {
          const breed = await randomNft.getBreed(9);
          assert.equal(0, breed);
        });
        it("should return shiba-inu if random num is greater than 9 but less than 40", async () => {
          const breed = await randomNft.getBreed(39);
          assert.equal(1, breed);
        });
        it("should return st-bernard if random num is greater than 39", async () => {
          const breed = await randomNft.getBreed(40);
          assert.equal(2, breed);
        });
      });
    });
