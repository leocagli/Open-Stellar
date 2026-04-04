// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract X402ServicePaywall {
    address public owner;

    mapping(bytes32 => bool) public paidRefs;

    event Paid(bytes32 indexed paymentRefHash, address indexed payer, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function settle402(bytes32 paymentRefHash) external payable {
        require(msg.value > 0, "payment required");
        require(!paidRefs[paymentRefHash], "already settled");

        paidRefs[paymentRefHash] = true;
        emit Paid(paymentRefHash, msg.sender, msg.value);
    }

    function hasPaid(bytes32 paymentRefHash) external view returns (bool) {
        return paidRefs[paymentRefHash];
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "invalid recipient");
        require(amount <= address(this).balance, "insufficient balance");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(to, amount);
    }
}
