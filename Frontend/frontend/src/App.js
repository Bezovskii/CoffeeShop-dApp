import { ethers } from "ethers";
import { useEffect, useState } from "react";

import CoffeeShopArtifact from "./abis/CoffeeShop.json";
import MockUSDTArtifact from "./abis/MockUSDT.json";

const COFFEESHOP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const USDT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const USDT_DECIMALS = 6;

const MENU = [
  { id: 1, name: "Americano", price: "3" },
  { id: 2, name: "Espresso", price: "2" },
  { id: 3, name: "Latte", price: "4" },
  { id: 4, name: "Cappuccino", price: "5" },
];

export default function App() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");
  const [usdtBal, setUsdtBal] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [qty, setQty] = useState(1);

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  async function refresh() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user = await signer.getAddress();

    const usdt = new ethers.Contract(
      USDT_ADDRESS,
      MockUSDTArtifact.abi,
      signer
    );

    const bal = await usdt.balanceOf(user);
    const alw = await usdt.allowance(user, COFFEESHOP_ADDRESS);

    setUsdtBal(ethers.formatUnits(bal, USDT_DECIMALS));
    setAllowance(ethers.formatUnits(alw, USDT_DECIMALS));
  }

  async function approve() {
    setStatus("Approving...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdt = new ethers.Contract(
      USDT_ADDRESS,
      MockUSDTArtifact.abi,
      signer
    );

    const tx = await usdt.approve(
      COFFEESHOP_ADDRESS,
      ethers.parseUnits("1000", USDT_DECIMALS)
    );
    await tx.wait();
    await refresh();
    setStatus("Approved ✅");
  }

  async function buy(itemId) {
    try {
      setStatus("Buying...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const shop = new ethers.Contract(
        COFFEESHOP_ADDRESS,
        CoffeeShopArtifact.abi,
        signer
      );

      const tx = await shop.buy(itemId, qty);
      await tx.wait();

      await refresh();
      setStatus("Order placed ☕");
    } catch (e) {
      setStatus(e.reason || e.message);
    }
  }

  useEffect(() => {
    if (account) refresh();
  }, [account]);

  return (
    <div style={styles.page}>
      <h1>☕ CoffeeShop</h1>

      {!account ? (
        <button style={styles.primary} onClick={connect}>
          Connect Wallet
        </button>
      ) : (
        <>
          <div style={styles.card}>
            <p><b>Wallet:</b> {account}</p>
            <p><b>USDT:</b> {usdtBal}</p>
            <p><b>Allowance:</b> {allowance}</p>
            <button style={styles.secondary} onClick={approve}>
              Approve USDT
            </button>
          </div>

          <h2>Menu</h2>

          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              style={{ marginLeft: 8, width: 60 }}
            />
          </label>

          <div style={styles.menu}>
            {MENU.map((item) => (
              <div key={item.id} style={styles.menuItem}>
                <h3>{item.name}</h3>
                <p>{item.price} USDT</p>
                <button onClick={() => buy(item.id)}>Buy</button>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ marginTop: 20 }}><b>Status:</b> {status}</p>
    </div>
  );
}

const styles = {
  page: {
    padding: 30,
    fontFamily: "Arial",
    background: "#f7f3ee",
    minHeight: "100vh",
  },
  primary: {
    padding: "10px 20px",
    fontSize: 16,
  },
  secondary: {
    marginTop: 10,
  },
  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  menu: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginTop: 20,
  },
  menuItem: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    textAlign: "center",
  },
};