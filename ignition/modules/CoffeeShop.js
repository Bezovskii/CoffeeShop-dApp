const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CoffeeShopModule", (m) => {
  const usdt = m.contract("MockUSDT");

  const storeWallet = m.getAccount(0);

  const shop = m.contract("CoffeeShop", [storeWallet, usdt]);

  return { usdt, shop };
});