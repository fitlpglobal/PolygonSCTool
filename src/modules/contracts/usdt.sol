// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TetherToken (USDT) - Exact replica for testing
 * @dev This contract replicates the exact functionality of USDT
 */

contract TetherToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public _totalSupply;
    
    address public owner;
    
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;
    
    // USDT specific: deprecated variables that exist in the original contract
    mapping(address => bool) public isBlackListed;
    uint256 public basisPointsRate = 0;
    uint256 public maximumFee = 0;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Params(uint256 feeBasisPoints, uint256 maxFee);
    event DestroyedBlackFunds(address _blackListedUser, uint256 _balance);
    event AddedBlackList(address _user);
    event RemovedBlackList(address _user);
    event Deprecate(address newAddress);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(
        uint256 _initialSupply,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        _totalSupply = _initialSupply;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        balances[msg.sender] = _initialSupply;
        owner = msg.sender;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        uint256 fee = (_value * basisPointsRate) / 10000;
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        uint256 sendAmount = _value - fee;
        
        require(!isBlackListed[msg.sender], "Sender is blacklisted");
        require(balances[msg.sender] >= _value, "Insufficient balance");
        require(_to != address(0), "Invalid address");
        
        balances[msg.sender] -= _value;
        balances[_to] += sendAmount;
        
        if (fee > 0) {
            balances[owner] += fee;
            emit Transfer(msg.sender, owner, fee);
        }
        
        emit Transfer(msg.sender, _to, sendAmount);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        uint256 fee = (_value * basisPointsRate) / 10000;
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        uint256 sendAmount = _value - fee;
        
        require(!isBlackListed[_from], "From address is blacklisted");
        require(balances[_from] >= _value, "Insufficient balance");
        require(allowed[_from][msg.sender] >= _value, "Insufficient allowance");
        require(_to != address(0), "Invalid address");
        
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        balances[_to] += sendAmount;
        
        if (fee > 0) {
            balances[owner] += fee;
            emit Transfer(_from, owner, fee);
        }
        
        emit Transfer(_from, _to, sendAmount);
        return true;
    }
    
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }
    
    function approve(address _spender, uint256 _value) public returns (bool) {
        require(!isBlackListed[msg.sender], "Sender is blacklisted");
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    // USDT specific functions
    function setParams(uint256 newBasisPoints, uint256 newMaxFee) public onlyOwner {
        require(newBasisPoints < 20, "Basis points too high");
        require(newMaxFee < 50, "Max fee too high");
        
        basisPointsRate = newBasisPoints;
        maximumFee = newMaxFee * (10**decimals);
        
        emit Params(basisPointsRate, maximumFee);
    }
    
    function addBlackList(address _evilUser) public onlyOwner {
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }
    
    function removeBlackList(address _clearedUser) public onlyOwner {
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);
    }
    
    function destroyBlackFunds(address _blackListedUser) public onlyOwner {
        require(isBlackListed[_blackListedUser], "User not blacklisted");
        uint256 dirtyFunds = balanceOf(_blackListedUser);
        balances[_blackListedUser] = 0;
        _totalSupply -= dirtyFunds;
        emit DestroyedBlackFunds(_blackListedUser, dirtyFunds);
        emit Transfer(_blackListedUser, address(0), dirtyFunds);
    }
    
    function issue(uint256 amount) public onlyOwner {
        require(_totalSupply + amount > _totalSupply, "Overflow");
        require(balances[owner] + amount > balances[owner], "Overflow");
        
        balances[owner] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), owner, amount);
    }
    
    function redeem(uint256 amount) public onlyOwner {
        require(_totalSupply >= amount, "Not enough supply");
        require(balances[owner] >= amount, "Not enough balance");
        
        _totalSupply -= amount;
        balances[owner] -= amount;
        emit Transfer(owner, address(0), amount);
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}