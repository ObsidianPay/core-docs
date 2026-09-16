---
title: Purchases
sidebar_label: Purchases
---

# Purchases

A purchase pays a merchant from the signed-in user's wallet. Mechanically it is a
transfer, with the merchant resolved from a merchant id rather than an account id.

### `POST /api/v1/Transaction/purchase`

Scope: `core:transactions:create`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `merchantId` | string | Yes | Numeric merchant id. The receiving account is resolved server side |
| `amount` | number | Yes | Greater than zero |
| `note` | string | Yes | Free text, may be empty |
| `useEscrow` | boolean | No | `false` (default) settles instantly. `true` gives the buyer a protection window |
| `gasTier` | string | No | Only read when `useEscrow` is `true`. See [gas tiers](./transfers.md#gas-tiers) |
| `cardId` | string | No | Attribute the purchase to one of the user's cards |

```bash
curl -X POST https://api.obsidianpay.bz/api/v1/Transaction/purchase \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "merchantId": "4021",
    "amount": 32.50,
    "note": "Table 6",
    "cardId": "2b7d9e10-4c3f-4a55-9e6b-1d2c3b4a5f60"
  }'
```

```json
{
  "data": {
    "referenceId": "b81c0f77-5a2d-4c9e-8f31-77ab2c4d9e10",
    "state": "PROCESSED",
    "message": "Purchase settled instantly.",
    "accepted": false
  }
}
```

Instant is the default because most in-person payments should behave like handing over
cash. Use `useEscrow: true` for higher value or remote orders where the buyer wants
recourse.

## Cards

Passing `cardId` records which card was used and applies that card's spend caps on top
of the account limits. The card must belong to the signed-in user and be usable, which
means active and not frozen. See [Cards](../cards.md).

Card caps are checked before the payment goes through. A purchase over a cap is refused
with the cap named in the message.

## Merchants

`merchantId` must belong to an active merchant. Failures come back as `400` with
`core::kineto::purchase::merchant::invalid`, or `404` when no such merchant exists.

## Refusals

Same shape as transfers, under the code `core::kineto::purchase::initiate::fail`.
Insufficient balance creates nothing.

Card-present payments through a terminal are a separate flow and are not part of this
endpoint yet.
