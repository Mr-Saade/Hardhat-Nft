const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const tokenURIs = [
  "ipfs://QmUkygRYwja54jjctjfMUUkeRx53CHLjZCu7bSXdbkzK2t",
  "ipfs://QmeSzcECb8bqtz6hPxNhViN69JAJEXVLifGnVVxoQ8boqN",
  "ipfs://Qmf2NKS2opkzHwFYXzqzo5cuifvuHc5w52d1nJXhXUFhsA",
];

const { ethers } = require("hardhat");
module.exports = async ({ deployments, network }) => {
  const { deploy, log } = deployments;
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  const chainId = network.config.chainId;

  const LINK_TOKENS_AMOUNT = ethers.parseEther("10");
  let vrfCoordinatorAddress, subId, vrfCoordinator;

  if (developmentChains.includes(network.name)) {
    const vrfMock = await deployments.get("VRFCoordinatorV2Mock");

    vrfCoordinatorAddress = await vrfMock.address;
    vrfCoordinator = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      vrfCoordinatorAddress,
      deployer
    );

    //subId = networkConfig[chainId]["subId"];
    const txResponse = await vrfCoordinator.createSubscription();
    const txReceipt = await txResponse.wait(1);

    subId = await txReceipt.logs[0].args[0];
    console.log(`subId: ${subId.toString()}`);

    await vrfCoordinator.fundSubscription(subId, LINK_TOKENS_AMOUNT);
  } else {
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorAddress"];

    subId = networkConfig[chainId]["subId"];
  }
  const mintFee = networkConfig[chainId]["mintFee"];

  const keyHash = networkConfig[chainId]["keyHash"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];

  const argss = [
    vrfCoordinatorAddress,
    subId,
    keyHash,
    callbackGasLimit,
    mintFee,
    tokenURIs,
  ];

  const RandomNft = await deploy("RandomIpfsNft", {
    from: deployer.address,
    args: argss,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name)) {
    await verify(RandomNft.address, argss);
  }
  //Programmatically adding consumer contract to subscription on local network
  if (developmentChains.includes(network.name)) {
    console.log("Adding local randomNft contract to subscription....");

    await vrfCoordinator.addConsumer(subId, RandomNft.address);
  }

  log("----------------------------------------");
};
module.exports.tags = ["all", "random"];
