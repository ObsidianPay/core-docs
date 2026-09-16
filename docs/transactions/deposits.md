---
title: Deposits
sidebar_label: Deposits
---

# Deposits

A deposit brings fiat from a bank into a wallet. It is two steps: the user declares the
deposit, then the bank confirms it. Funds only become spendable after the hold window.

```
initiate  ->  QUEUED
confirm   ->  PENDING -> PROCESSING   (minted, held in escrow)
release   ->  PROCESSED              (spendable)
```

## Initiate

### `POST /api/v1/Transaction/deposit`

Scope: `core:transactions:create`

| Field | Type | Notes |
| --- | --- | --- |
| `amount` | number | Greater than zero |
| `note` | string | Free text shown to the user |

```bash
curl -X POST https://api.obsidianpay.bz/api/v1/Transaction/deposit \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "amount": 500.00, "note": "Salary" }'
```

```json
{
  "data": {
    "referenceId": "3f2a91c4-77d1-4a0b-9d3e-8b5c6a7f1e2d",
    "state": "QUEUED",
    "message": "Transaction created successfully and is currently queued for processing.",
    "accepted": false
  }
}
```

Nothing has moved yet. The deposit is waiting for the bank.

## Confirm

### `POST /api/v1/Transaction/deposit/confirm`

Scope: `core:transactions:confirm`

Called when the bank transfer is verified, usually by an operator or an automated bank
integration rather than the end user.

| Field | Type | Notes |
| --- | --- | --- |
| `referenceId` | string | From the initiate response |
| `bankReference` | string | The bank's own reference |

```json
{
  "data": {
    "referenceId": "3f2a91c4-77d1-4a0b-9d3e-8b5c6a7f1e2d",
    "chainReferenceId": "0x8f3b...",
    "txContractAddress": "0x1a2b...",
    "state": "PROCESSING",
    "message": "Deposit confirmed. Funds will be available after the hold window.",
    "accepted": false
  }
}
```

Confirmation mints the balance and places it in escrow for a 24 hour hold. This call can
take a few seconds, and may return `202` with `accepted: true`. Poll
[`GET /api/v1/Transaction/{referenceId}`](./reading.md) in that case.

The transaction must be in `QUEUED` to be confirmed. Confirming twice fails, which is
what stops a double credit.

## Availability

During the hold the amount counts toward `totalBalance` but not `availableBalance`
(see [balance](../users.md#balance)). A background worker settles the deposit to
`PROCESSED` when the window closes, and the funds become spendable.

A deposit reversed during its window is refunded with a reversing entry, and the state
settles to `PROCESSED` with the reversal recorded against it.
