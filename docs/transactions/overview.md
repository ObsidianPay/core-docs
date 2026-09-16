---
title: Transactions overview
sidebar_label: Overview
---

# Transactions overview

Every movement of money is a transaction on an append-only ledger. A transaction is
identified by a `referenceId` and moves through a series of states. Rows are never
updated: each state change appends a new row, and the latest row is the current state.

## The operations

| Operation | Endpoint | Money moves |
| --- | --- | --- |
| [Deposit](./deposits.md) | `POST /api/v1/Transaction/deposit` | Bank to wallet |
| [Transfer](./transfers.md) | `POST /api/v1/Transaction/p2p` | Wallet to wallet |
| [Purchase](./purchases.md) | `POST /api/v1/Transaction/purchase` | Wallet to merchant |
| [Withdrawal](./withdrawals.md) | `POST /api/v1/Transaction/withdraw` | Wallet to bank |

## States

| State | Meaning |
| --- | --- |
| `QUEUED` | Created and accepted. The sender's funds are already reserved |
| `PENDING` | Validated, preparing to settle |
| `PROCESSING` | In flight. For protected transfers, held in escrow with the dispute window open |
| `DISPUTED` | A dispute was raised during the window |
| `BLOCKED` | Held for review |
| `PROCESSED` | Settled. The recipient can spend the funds |
| `FAIL` | Terminal failure. Any reservation is released |

Two rules explain every balance you will see:

- A debit is reserved as soon as the transaction exists, and stays reserved in every
  state except `FAIL`.
- A credit is only spendable at `PROCESSED`.

So a protected transfer sitting in `PROCESSING` has already left the sender's spendable
balance and has not yet arrived in the recipient's.

## Instant or protected

Transfers and purchases accept `useEscrow`.

| | `useEscrow: false` (default) | `useEscrow: true` |
| --- | --- | --- |
| Settlement | Instant and final | Held for a dispute window, then released |
| Final state | `PROCESSED` | `PROCESSING`, later `PROCESSED` |
| Fee | None | Set by the chosen [gas tier](./transfers.md#gas-tiers) |
| Disputable | After settlement, by agreement | During the window |

## Synchronous and accepted responses

Instant operations return their final result. Protected operations wait a few seconds
for the blockchain confirmation, and if it takes longer they return `202` with
`accepted: true` and a state of `PROCESSING`.

```json
{
  "data": {
    "referenceId": "9d4f7c2e-1b3a-4f5e-8c7d-2a1b3c4d5e6f",
    "state": "PROCESSING",
    "message": "P2P transfer received and is being processed.",
    "accepted": true
  }
}
```

The `referenceId` is real and final either way. When `accepted` is true, poll
[`GET /api/v1/Transaction/{referenceId}`](./reading.md) until the state settles.

## Balances and concurrency

The balance check and the write happen together, under one lock. Two transfers that
arrive at the same moment cannot both spend the same money: whichever fits succeeds,
the other is refused.

A refused transfer **creates nothing**. There is no `referenceId` and no row in
history. Insufficient balance looks like this:

```json
{
  "type": "urn:ocs:error:core::kineto::p2p::initiate::fail",
  "title": "Failed to initiate P2P transfer from user ... : Insufficient balance.",
  "status": 400
}
```

One case still records a failure: a protected transfer that covers the amount but not
the fee. The fee depends on the gas tier, which is resolved after the transaction is
created, so that one settles to `FAIL` with a reason.

## Reference identifiers

`referenceId` is an opaque string. Store it, display it, use it to fetch a transaction.
Do not parse it or derive it. It identifies one logical transaction across all of its
state rows.

## Retries

The API takes no client idempotency key. Repeating a request creates a second
transaction if the balance allows it. See [Conventions](../conventions.md#idempotency-and-retries).
