---
title: Enums
sidebar_label: Enums
---

# Enums

Values are returned as strings and compared exactly, in upper case.

## Transaction state

| Value | Meaning |
| --- | --- |
| `QUEUED` | Created. The sender's funds are reserved |
| `PENDING` | Validated, preparing to settle |
| `PROCESSING` | In flight, or held in escrow with the dispute window open |
| `DISPUTED` | Disputed during the window |
| `BLOCKED` | Held for review |
| `PROCESSED` | Settled. Funds are spendable by the recipient |
| `FAIL` | Terminal failure. Reservations released |

`PROCESSED` and `FAIL` are the only terminal states. Treat anything else as in progress.

## Transaction type

| Value | Meaning |
| --- | --- |
| `DEPOSIT` | Bank into a wallet |
| `WITHDRAWAL` | Wallet out to a bank |
| `P2P` | Wallet to wallet |
| `PURCHASE` | Wallet to merchant |
| `FEE` | Fee charged for a protected transfer |
| `UNDO` | Reversing entry from a refund or dispute resolution |
| `SELF` | Reserved. Not currently accepted |
| `EARN` | Reserved for rewards |

`FEE` and `UNDO` rows appear in history alongside the transaction they relate to.

## Card status

| Value | Meaning |
| --- | --- |
| `UNISSUED` | Issued but not activated by the holder |
| `ACTIVE` | Usable, unless `frozen` is true |
| `BLOCKED` | Terminal. Issue a replacement instead |

`frozen` is a separate boolean, not a status.

## Dispute case status

| Value | Meaning |
| --- | --- |
| `OPEN` | Under discussion. The thread accepts messages |
| `RESOLVED` | Closed. The thread is read-only |

## KYC status

| Value | Meaning |
| --- | --- |
| `PENDING` | Not yet verified |
| `VERIFIED` | Approved |
| `REJECTED` | Declined |

## Health status

| Value | Meaning |
| --- | --- |
| `Up` | Healthy |
| `Degraded` | Slow but responding |
| `Down` | Unavailable |

## Gas tiers

Tier names are returned by
[`GET /api/v1/Transaction/gas-tiers`](../transactions/transfers.md#gas-tiers), from
cheapest and slowest to most expensive and fastest.

| Value |
| --- |
| `ExtraSlow` |
| `Slow` |
| `Normal` |
| `Medium` |
| `Quick` |
| `Fast` |
| `Immediate` |

Read the list at request time rather than hardcoding it. Fees and window lengths vary
with network conditions.
