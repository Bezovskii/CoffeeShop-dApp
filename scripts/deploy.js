const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy({ gasLimit: 8_000_000 });
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("MockUSDT deployed to:", mockUSDTAddress);

  const CoffeeShop = await hre.ethers.getContractFactory("CoffeeShop");
  const coffeeShop = await CoffeeShop.deploy(
    deployer.address,
    mockUSDTAddress,
    { gasLimit: 8_000_000 }
  );
  await coffeeShop.waitForDeployment();
  const coffeeShopAddress = await coffeeShop.getAddress();
  console.log("CoffeeShop deployed to:", coffeeShopAddress);

  console.log("\n✅ DEPLOYMENT COMPLETE");
  console.log("CoffeeShop:", coffeeShopAddress);
  console.log("MockUSDT:", mockUSDTAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
