// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EscrowMilestone {
    enum EscrowState {
        Pending,
        Released,
        Refunded,
        Disputed
    }

    struct Deal {
        address payer;
        address payee;
        uint256 amount;
        uint64 deadline;
        EscrowState state;
        string metadataURI;
    }

    uint256 public nextDealId;
    mapping(uint256 => Deal) public deals;

    event DealCreated(uint256 indexed dealId, address indexed payer, address indexed payee, uint256 amount, uint64 deadline);
    event DealReleased(uint256 indexed dealId);
    event DealRefunded(uint256 indexed dealId);
    event DealDisputed(uint256 indexed dealId, address indexed caller);

    function createDeal(address payee, uint64 deadline, string calldata metadataURI) external payable returns (uint256) {
        require(payee != address(0), "invalid payee");
        require(msg.value > 0, "amount required");
        require(deadline > block.timestamp, "deadline in past");

        uint256 dealId = ++nextDealId;
        deals[dealId] = Deal({
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            deadline: deadline,
            state: EscrowState.Pending,
            metadataURI: metadataURI
        });

        emit DealCreated(dealId, msg.sender, payee, msg.value, deadline);
        return dealId;
    }

    function release(uint256 dealId) external {
        Deal storage deal = deals[dealId];
        require(msg.sender == deal.payer, "only payer");
        require(deal.state == EscrowState.Pending, "invalid state");

        deal.state = EscrowState.Released;
        (bool ok, ) = payable(deal.payee).call{value: deal.amount}("");
        require(ok, "transfer failed");
        emit DealReleased(dealId);
    }

    function refund(uint256 dealId) external {
        Deal storage deal = deals[dealId];
        require(msg.sender == deal.payee || msg.sender == deal.payer, "forbidden");
        require(deal.state == EscrowState.Pending, "invalid state");
        require(block.timestamp >= deal.deadline, "deadline not reached");

        deal.state = EscrowState.Refunded;
        (bool ok, ) = payable(deal.payer).call{value: deal.amount}("");
        require(ok, "refund failed");
        emit DealRefunded(dealId);
    }

    function raiseDispute(uint256 dealId) external {
        Deal storage deal = deals[dealId];
        require(msg.sender == deal.payer || msg.sender == deal.payee, "forbidden");
        require(deal.state == EscrowState.Pending, "invalid state");
        deal.state = EscrowState.Disputed;
        emit DealDisputed(dealId, msg.sender);
    }
}
