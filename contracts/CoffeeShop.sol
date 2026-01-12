// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract CoffeeShop {
  
    event OrderPlaced(
        uint256 indexed orderId,
        address indexed customer,
        uint256 indexed itemId,
        uint256 qty,
        uint256 total
    );

    event ItemCreated(uint256 indexed itemId, string name, uint256 price, bool active);
    event ItemUpdated(uint256 indexed itemId, string name, uint256 oldPrice, uint256 newPrice, bool active);
    event StoreWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event SalesPaused(bool paused);

  
    address public storeWallet;
    address public owner;
    IERC20 public usdt;

    uint256 public nextOrderId = 1;

    bool public paused;

    struct Item {
        string name;
        uint256 price; 
        bool active;
        bool exists;
    }

    uint256 public nextItemId = 1;
    mapping(uint256 => Item) private items;

    mapping(uint256 => uint256) public priceOf;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier notPaused() {
        require(!paused, "sales paused");
        _;
    }

    constructor(address _storeWallet, address _usdt) {
        require(_storeWallet != address(0), "zero store wallet");
        require(_usdt != address(0), "zero token");
        storeWallet = _storeWallet;
        owner = msg.sender;
        usdt = IERC20(_usdt);
    }

    function setStoreWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "zero store wallet");
        address old = storeWallet;
        storeWallet = newWallet;
        emit StoreWalletUpdated(old, newWallet);
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit SalesPaused(value);
    }

    function createItem(string calldata name, uint256 price, bool active) external onlyOwner returns (uint256 itemId) {
        require(bytes(name).length > 0, "name empty");
        require(price > 0, "price must be > 0");

        itemId = nextItemId++;
        items[itemId] = Item({
            name: name,
            price: price,
            active: active,
            exists: true
        });

        priceOf[itemId] = price;

        emit ItemCreated(itemId, name, price, active);
    }

    function updateItem(uint256 itemId, string calldata name, uint256 newPrice, bool active) external onlyOwner {
        Item storage it = items[itemId];
        require(it.exists, "item not found");
        require(bytes(name).length > 0, "name empty");
        require(newPrice > 0, "price must be > 0");

        uint256 oldPrice = it.price;

        it.name = name;
        it.price = newPrice;
        it.active = active;

        priceOf[itemId] = newPrice;

        emit ItemUpdated(itemId, name, oldPrice, newPrice, active);
    }

    function setPrice(uint256 itemId, uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "price must be > 0");
        uint256 oldPrice = priceOf[itemId];
        priceOf[itemId] = newPrice;

        Item storage it = items[itemId];
        if (!it.exists) {
            it.exists = true;
            it.active = true;
            it.name = string(abi.encodePacked("Item #", _uToStr(itemId)));
        }
        it.price = newPrice;

        emit ItemUpdated(itemId, it.name, oldPrice, newPrice, it.active);
    }

    function getItem(uint256 itemId) external view returns (string memory name, uint256 price, bool active, bool exists) {
        Item storage it = items[itemId];
        return (it.name, it.price, it.active, it.exists);
    }

    function getMenuSize() external view returns (uint256) {
        return nextItemId - 1;
    }

    function buy(uint256 itemId, uint256 qty) external notPaused {
        require(qty > 0, "qty must be > 0");

        Item storage it = items[itemId];
        require(it.exists, "item not found");
        require(it.active, "item not for sale");

        uint256 unit = it.price;
        require(unit > 0, "item not for sale");

        uint256 total = unit * qty;
        address customer = msg.sender;

        require(usdt.balanceOf(customer) >= total, "not enough USDT");
        require(usdt.allowance(customer, address(this)) >= total, "allowance too low");

        bool ok = usdt.transferFrom(customer, storeWallet, total);
        require(ok, "transfer failed");

        uint256 orderId = nextOrderId++;
        emit OrderPlaced(orderId, customer, itemId, qty, total);
    }

    function _uToStr(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory b = new bytes(len);
        uint256 k = len;
        while (v != 0) {
            k--;
            b[k] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(b);
    }
}