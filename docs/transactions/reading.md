---
title: Reading transactions
sidebar_label: Reading transactions
---

# Reading transactions

## One transaction

### `GET /api/v1/Transaction/{referenceId}`

Scope: `core:transactions:read`

```json
{
  "data": {
    "transactionId": "48210",
    "referenceId": "9d4f7c2e-1b3a-4f5e-8c7d-2a1b3c4d5e6f",
    "fromAccountId": "1f2e3d4c-5b6a-4790-8123-456789abcdef",
    "toAccountId": "7c1e5b90-2d84-4a1f-9e3c-5d6b7a8c9f01",
    "credit": "75.00000000",
    "debit": "75.00000000",
    "transactionType": "P2P",
    "state": "PROCESSED",
    "chainReferenceId": "",
    "txContractAddress": "",
    "txContractVersion": "",
    "createdAt": "2026-09-16T14:05:09.1234567Z",
    "settledAt": "2026-09-16T14:05:09.9876543Z",
    "note": "Dinner",
    "failReason": ""
  }
}
```

| Field | Notes |
| --- | --- |
| `transactionId` | Ledger row id of the current state. Changes as the transaction progresses |
| `referenceId` | Stable identifier for the whole transaction. Use this one |
| `credit` / `debit` | Decimal strings with 8 places. `credit` is what the recipient receives, `debit` what the sender pays |
| `transactionType` | See [enums](../reference/enums.md) |
| `state` | Current state |
| `chainReferenceId` | Blockchain transaction hash, when one applies |
| `settledAt` | Set once the transaction reaches `PROCESSED` or `FAIL` |
| `failReason` | Populated on `FAIL` |

Returns `404` when the reference is unknown.

## Account history

### `GET /api/v1/Transaction/account/{accountId}`

Scope: `core:transactions:read`

| Parameter | In | Default | Notes |
| --- | --- | --- | --- |
| `accountId` | path | | User id whose history to read |
| `page` | query | `1` | 1 based |
| `pageSize` | query | `20` | Maximum 100 |

```json
{
  "data": {
    "transactions": [ { "referenceId": "...", "state": "PROCESSED" } ],
    "totalCount": 84
  }
}
```

One entry per transaction, showing its current state, newest first. `totalCount` is the
total across all pages.

Refused transfers never appear here. If the balance did not cover it, nothing was
created. See [Balances and concurrency](./overview.md#balances-and-concurrency).

## Polling

After a `202` response with `accepted: true`, poll the transaction until it reaches a
settled state.

```
PROCESSING -> PROCESSED   settled
PROCESSING -> DISPUTED    a dispute was raised during the window
PROCESSING -> FAIL        failed, any reservation released
```

Poll every two to three seconds for about a minute, then fall back to a slower interval
or a manual refresh. Protected transfers stay `PROCESSING` for the whole dispute window,
which is by design and not a failure.
