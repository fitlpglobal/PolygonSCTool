// src/modules/contracts/LoyaltyCard.ts

export const loyaltyCardSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LoyaltyCard {
    // ============ State ============
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint256 public maxSupply;
    string public collectionURI;
    bool public paused;
    address public owner;

    mapping(uint256 => address) private owners;
    mapping(address => uint256) private balances;
    mapping(uint256 => string) private tokenURIs;

    // ============ Events ============
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Burn(address indexed from, uint256 indexed tokenId);
    event Paused();
    event Unpaused();
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event CollectionURIUpdated(string newURI);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    // ============ Constructor ============
    constructor(string memory _name, string memory _symbol, uint256 _cap) {
        name = _name;
        symbol = _symbol;
        maxSupply = _cap;
        owner = msg.sender;
    }

    // ============ Views ============
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        require(owners[tokenId] != address(0), "Invalid token");
        return owners[tokenId];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(owners[tokenId] != address(0), "Invalid token");
        return tokenURIs[tokenId];
    }

    // ============ Mint / Burn ============
    function mint(address to, uint256 tokenId, string memory uri) external onlyOwner whenNotPaused {
        require(to != address(0), "Invalid to");
        require(totalSupply < maxSupply, "Max supply reached");
        require(owners[tokenId] == address(0), "Already minted");

        owners[tokenId] = to;
        balances[to] += 1;
        tokenURIs[tokenId] = uri;
        totalSupply += 1;

        emit Transfer(address(0), to, tokenId);
    }

    function burn(uint256 tokenId) external whenNotPaused {
        address tokenOwner = owners[tokenId];
        require(tokenOwner == msg.sender || msg.sender == owner, "Not authorized");
        require(tokenOwner != address(0), "Invalid token");

        balances[tokenOwner] -= 1;
        delete owners[tokenId];
        delete tokenURIs[tokenId];
        totalSupply -= 1;

        emit Burn(tokenOwner, tokenId);
        emit Transfer(tokenOwner, address(0), tokenId);
    }

    // ============ Admin Controls ============
    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    function setMaxSupply(uint256 newCap) external onlyOwner {
        require(newCap >= totalSupply, "Cap too low");
        maxSupply = newCap;
        emit MaxSupplyUpdated(newCap);
    }

    function setCollectionURI(string memory newURI) external onlyOwner {
        collectionURI = newURI;
        emit CollectionURIUpdated(newURI);
    }
}
`;
