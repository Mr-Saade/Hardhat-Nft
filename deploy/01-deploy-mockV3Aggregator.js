const { developmentChains } = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const DECIMALS = 8;
  const INITIAL_ANSWER = 200000000000;

  if (developmentChains.includes(network.name)) {
    log("Local network detected!. Deploying mockV3 Aggregator.....");
    const mockV3 = await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });
    log("MockV3 Aggregator Deployed!");
    log("------------------------------------------------------");
  }
};
module.exports.tags = ["all", "mockV3"];
