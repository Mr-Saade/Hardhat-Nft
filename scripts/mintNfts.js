//A script for local minting.
const { ethers } = require("hardhat");

async function mint() {
  console.log("Deploying Mocks and Nfts Contracts...");
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  await deployments.fixture(["all"]);

  const vrfMock = await ethers.getContractAt(
    "VRFCoordinatorV2Mock",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    deployer
  );

  const basicNft = await ethers.getContractAt(
    "BasicNft",
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    deployer
  );
  const dynamicNft = await ethers.getContractAt(
    "DynamicSvgNft",
    "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    deployer
  );
  const randomIpfsNft = await ethers.getContractAt(
    "RandomIpfsNft",
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    deployer
  );

  console.log("Minting Nfts....");

  console.log("Minting Basic Nft...");

  await basicNft.mintNft();
  console.log(`Basic ${await basicNft.name()} Nft minted!`);

  console.log("------------------------");
  console.log("Minting Dymamic Svg Nft...");

  await new Promise(async (resolve, reject) => {
    console.log("Listening for NftMinted event...");
    try {
      dynamicNft.once("NftMinted", async (nftOwner, tokenId) => {
        const tokenURI = await dynamicNft.tokenURI(tokenId);
        console.log("NFT Minted!!!");
        console.log(`Nft Owner: ${nftOwner}`);
        console.log(`Token Id: ${tokenId}`);
        console.log(`Token URI: ${tokenURI}`);

        resolve();
      });
      await dynamicNft.mintNft(1000e8);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

  console.log("------------------------");
  console.log("Minting Random Ipfs Nft...");
  const mintFee = await randomIpfsNft.getMintFee();
  const txRespnse = await randomIpfsNft.requestNft({ value: mintFee });
  const txReceipt = await txRespnse.wait(1);
  const requestId = txReceipt.logs[1].args[1];

  const txfulfill = await vrfMock.fulfillRandomWords(
    requestId,
    await randomIpfsNft.getAddress()
  );
  const txfulfillReceipt = await txfulfill.wait(1);

  const isSuccess = txfulfillReceipt.logs[3].args[3];

  if (isSuccess) {
    console.log("Random Ipfs Minted");
  } else {
    console.log("Fulfillment Failed!");
  }
}

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
