const { expect } = require("chai");
const { ethers } = require("hardhat");

// 6 decimals like USDT
const USDT = (n) => ethers.parseUnits(n.toString(), 6);

// Plugin-free revert checker
async function expectRevert(promise, contains) {
  try {
    await promise;
    throw new Error("Expected revert, but tx succeeded");
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();
    expect(msg).to.include(contains.toLowerCase());
  }
}

describe("CoffeeShop", function () {
  let owner, store, customer;
  let usdt, shop;

  beforeEach(async () => {
    [owner, store, customer] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT", owner);
    usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();

    const CoffeeShop = await ethers.getContractFactory("CoffeeShop", owner);
    shop = await CoffeeShop.deploy(store.address, await usdt.getAddress());
    await shop.waitForDeployment();
  });

  it("deploys with correct constructor params", async () => {
    expect(await shop.owner()).to.equal(owner.address);
    expect(await shop.storeWallet()).to.equal(store.address);
    expect(await shop.usdt()).to.equal(await usdt.getAddress());
    expect(await shop.nextOrderId()).to.equal(1n);
  });

  it("only owner can setPrice", async () => {
    await shop.connect(owner).setPrice(1, USDT(5)); // ok

    await expectRevert(
      shop.connect(customer).setPrice(1, USDT(7)),
      "not owner"
    );
  });

  it("buy succeeds: transfers USDT and increments orderId", async () => {
    await shop.connect(owner).setPrice(1, USDT(5));

    await usdt.connect(owner).mint(customer.address, USDT(100));
    await usdt.connect(customer).approve(await shop.getAddress(), USDT(10)); // qty=2 => 10

    const storeBefore = await usdt.balanceOf(store.address);
    const custBefore = await usdt.balanceOf(customer.address);

    await shop.connect(customer).buy(1, 2);

    const storeAfter = await usdt.balanceOf(store.address);
    const custAfter = await usdt.balanceOf(customer.address);

    expect(storeAfter - storeBefore).to.equal(USDT(10));
    expect(custBefore - custAfter).to.equal(USDT(10));

    expect(await shop.nextOrderId()).to.equal(2n);
  });

  it("reverts when qty == 0", async () => {
    await shop.connect(owner).setPrice(1, USDT(5));
    await usdt.connect(owner).mint(customer.address, USDT(100));
    await usdt.connect(customer).approve(await shop.getAddress(), USDT(100));

    await expectRevert(shop.connect(customer).buy(1, 0), "qty must be > 0");
  });

  it("reverts when item not for sale (price=0)", async () => {
    await usdt.connect(owner).mint(customer.address, USDT(100));
    await usdt.connect(customer).approve(await shop.getAddress(), USDT(100));

    await expectRevert(shop.connect(customer).buy(1, 1), "item not for sale");
  });

  it("reverts when allowance too low", async () => {
    await shop.connect(owner).setPrice(1, USDT(5));
    await usdt.connect(owner).mint(customer.address, USDT(100));
    await usdt.connect(customer).approve(await shop.getAddress(), USDT(4));

    await expectRevert(shop.connect(customer).buy(1, 1), "allowance too low");
  });

  it("reverts when balance too low", async () => {
    await shop.connect(owner).setPrice(1, USDT(50));
    await usdt.connect(owner).mint(customer.address, USDT(10));
    await usdt.connect(customer).approve(await shop.getAddress(), USDT(50));

    await expectRevert(shop.connect(customer).buy(1, 1), "not enough usdt");
  });

  it("emits OrderPlaced with correct values", async () => {
    await shop.connect(owner).setPrice(7, USDT(3));
    await usdt.connect(owner).mint(customer.address, USDT(100));
    await usdt.connect(customer).approve(await shop.getAddress(), USDT(9));

    // orderId starts at 1
    const tx = await shop.connect(customer).buy(7, 3);
    const rc = await tx.wait();

    const event = rc.logs
      .map((l) => {
        try {
          return shop.interface.parseLog(l);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === "OrderPlaced");

    expect(event).to.not.equal(undefined);
    expect(event.args.orderId).to.equal(1n);
    expect(event.args.customer).to.equal(customer.address);
    expect(event.args.itemId).to.equal(7n);
    expect(event.args.qty).to.equal(3n);
    expect(event.args.total).to.equal(USDT(9));
  });
});