---
title: Transfers
sidebar_label: Transfers
---

# Transfers

A transfer moves money between two Obsidian Pay wallets.

### `POST /api/v1/Transaction/p2p`

Scope: `core:transactions:create`. Requires [step-up verification](../step-up.md).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `toAccountId` | string | Yes | Recipient user id |
| `amount` | number | Yes | Greater than zero |
| `note` | string | Yes | Free text, may be empty |
| `useEscrow` | boolean | No | `false` (default) settles instantly. `true` opens a dispute window |
| `gasTier` | string | No | Only read when `useEscrow` is `true`. See below |

The sender is always the signed-in user. You cannot send on behalf of someone else.

## Instant transfer

```bash
curl -X POST https://api.obsidianpay.bz/api/v1/Transaction/p2p \
  -H 'Authorization: Bearer <token>' \
  -H 'X-Step-Up: <grant>' \
  -H 'Content-Type: application/json' \
  -d '{
    "toAccountId": "7c1e5b90-2d84-4a1f-9e3c-5d6b7a8c9f01",
    "amount": 75.00,
    "note": "Dinner"
  }'
```

```json
{
  "data": {
    "referenceId": "9d4f7c2e-1b3a-4f5e-8c7d-2a1b3c4d5e6f",
    "state": "PROCESSED",
    "message": "P2P transfer settled instantly.",
    "accepted": false
  }
}
```

Free, final, and immediately spendable by the recipient.

## Protected transfer

Set `useEscrow: true` to hold the funds for a dispute window. The recipient sees the
transfer as in flight until the window closes.

```json
{
  "toAccountId": "7c1e5b90-2d84-4a1f-9e3c-5d6b7a8c9f01",
  "amount": 400.00,
  "note": "Deposit on the truck",
  "useEscrow": true,
  "gasTier": "Normal"
}
```

The response state is `PROCESSING`, and may arrive as `202` with `accepted: true`. The
funds leave the sender's spendable balance immediately and reach the recipient's when
the window closes.

Either party can dispute during the window. See [Disputes](../disputes.md).

## Gas tiers

A protected transfer pays a fee that covers the platform margin plus the network cost.
The tier sets both the fee and the length of the dispute window.

### `GET /api/v1/Transaction/gas-tiers?amount=400`

Scope: `core:transactions:read`

```json
{
  "data": {
    "tiers": [
      {
        "tierName": "Normal",
        "feePercent": "0.85",
        "estimatedProcessingTime": "about 2 minutes",
        "escrowWindowSeconds": 86400
      }
    ]
  }
}
```

| Field | Notes |
| --- | --- |
| `tierName` | Pass this string as `gasTier` |
| `feePercent` | Percentage of the amount, as a string, for example `"0.85"` means 0.85% |
| `estimatedProcessingTime` | Human readable |
| `escrowWindowSeconds` | How long the dispute window stays open |

Quote the tiers for the exact amount the user is sending, because the network component
of the fee varies with the amount and with current network conditions. The fee charged
is the one the server calculates at send time, not the number you display, so re-quote
if the user changes the amount.

The fee is charged as a separate settled transaction against the sender once the
transfer is held.

## Refusals

| Reason in the message | Cause |
| --- | --- |
| `Insufficient balance.` | The spendable balance does not cover the amount. Nothing was created |
| `Invalid amount. Must be a positive number.` | Amount is zero, negative or unparseable |
| `P2P transfers addressed to yourself are not allowed.` | Sender and recipient match |
| `P2P transfers to the system program are not allowed.` | Recipient is the platform account |
| `Recipient account not found.` | Unknown `toAccountId` |
| `Could not verify sender balance.` | Transient. Nothing was created, retry is safe |

All arrive as `400` with the code `core::kineto::p2p::initiate::fail`. The reason is the
text after the last colon.
