const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");
module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethusdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethusdPriceFeed = await deployments.get("MockV3Aggregator");
    ethusdPriceFeedAddress = await ethusdPriceFeed.address;
  } else {
    ethusdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const lowSvg = fs.readFileSync("./images/dynamicSvgNft/frown.svg", {
    encoding: "utf8",
  });
  const highSvg = fs.readFileSync("./images/dynamicSvgNft/happy.svg", {
    encoding: "utf8",
  });

  const argss = [lowSvg, highSvg, ethusdPriceFeedAddress];
  const DynamicSvg = await deploy("DynamicSvgNft", {
    from: deployer,
    args: argss,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name)) {
    await verify(DynamicSvg.address, argss);
  }
  log("----------------------------------------");
};
module.exports.tags = ["all", "dynamic"];
