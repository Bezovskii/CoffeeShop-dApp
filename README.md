CoffeeShop dApp ☕

A decentralized coffee shop application built with Solidity, Hardhat, and React, using a Mock USDT (ERC20) token for payments on a local Hardhat blockchain.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Project Overview:
This project demonstrates a full-stack Web3 decentralized application. Smart contracts are written in Solidity and deployed on a local Hardhat blockchain. Payments are handled via a Mock USDT ERC20 token, and a React frontend interacts with the contracts through MetaMask. Users can approve USDT and buy coffee items such as Americano, Espresso, Latte, and Cappuccino. The project is designed for educational purposes and runs entirely on a local development network.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Project Structure:
CoffeeShop-contract/ contains Solidity contracts, deployment scripts, tests, and a React frontend. The contracts folder includes CoffeeShop.sol and mockUSDT.sol. The scripts folder contains deploy.js used for deploying contracts. The ignition folder includes Hardhat Ignition modules used to define deployment logic. The test folder contains automated tests for the smart contracts. The Frontend/frontend directory contains the React application, including its own package.json and source files. The root also includes hardhat.config.js, package.json, and this README file.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Requirements:
Node.js version 16 or later, npm, and the MetaMask browser extension must be installed before running the project.

*How to Run the Project:
First, install backend dependencies by running npm install in the project root.
Then start the local Hardhat blockchain using npx hardhat node. This runs at http://127.0.0.1:8545
 with chain ID 31337 and provides pre-funded test accounts. Keep this terminal running.
In a new terminal, deploy the smart contracts using npx hardhat run scripts/deploy.js --network localhost. This deploys MockUSDT and CoffeeShop contracts and prints their addresses.
Next, start the frontend by navigating to Frontend/frontend, running npm install, then npm start. The frontend will be available at http://localhost:3000
.
-------------------------------------------------------------------------------------------------------------------------------------------------
*MetaMask Setup:
Add a new network in MetaMask with RPC URL http://127.0.0.1:8545
 and Chain ID 31337. Import one of the test accounts using a private key printed by the Hardhat node. Then import the Mock USDT token into MetaMask using the deployed MockUSDT contract address. The token symbol is mUSDT and the decimals are automatically detected as 6.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Token Details:
The project uses a Mock USDT ERC20 token with 6 decimals. All prices, approvals, and minting operations use 6-decimal precision. Prices and mint amounts must be created using parseUnits(value, 6). Using 18 decimals will cause incorrect balances. This token is only for local testing and has no real-world value.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Coffee Menu:
Americano costs 3 USDT, Espresso costs 2 USDT, Latte costs 4 USDT, and Cappuccino costs 5 USDT. Items must be priced by the contract owner before users can buy them.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Testing:
Smart contract tests can be run using npx hardhat test. Tests cover pricing logic, buying logic, ERC20 approvals, balance checks, and event emissions.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Ignored Files and Git Practices:
The folders node_modules, artifacts, cache, and ignition/deployments are intentionally excluded from version control using .gitignore. These files are auto-generated, environment-specific, and can be recreated at any time. They remain locally on the developer’s machine but are not committed to Git. This follows professional Git and industry standards.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Version Control and Commits:
The repository contains clean and meaningful commits that represent logical steps in development. Auto-generated files are excluded, and only source code and configuration files required to run the project are committed. This ensures a professional and review-friendly commit history.
-------------------------------------------------------------------------------------------------------------------------------------------------
*Demo Day Instructions:
For a live demo, start the Hardhat node, deploy the contracts, and run the React frontend. Connect MetaMask to the local Hardhat network, approve USDT spending, and purchase items through the UI. No additional setup is required.
-------------------------------------------------------------------------------------------------------------------------------------------------
Author
Behzad Khoshian
-------------------------------------------------------------------------------------------------------------------------------------------------
Notes:
This project runs only on a local Hardhat blockchain. No real cryptocurrency is used. The project is intended for learning, demonstration, and academic evaluation.