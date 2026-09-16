---
id: cards
title: Cards
sidebar_label: Cards
---

# Cards

An OPay Tap card is linked to a wallet. It holds no stored value, so its reach is the
whole wallet balance, and its spend caps are what contain the loss if it is stolen.

## The card object

```json
{
  "id": "2b7d9e10-4c3f-4a55-9e6b-1d2c3b4a5f60",
  "userId": "1f2e3d4c-5b6a-4790-8123-456789abcdef",
  "cardNumber": null,
  "last4": "4417",
  "cardType": 1,
  "cardTypeName": "STANDARD",
  "printedName": "ANA MENDEZ",
  "status": "ACTIVE",
  "frozen": false,
  "issuedAt": "2026-08-01T10:00:00.0000000Z",
  "activatedAt": "2026-08-03T12:30:00.0000000Z",
  "frozenAt": null,
  "perTxnCap": 250.00,
  "dailyCap": 800.00,
  "lifetimeCap": null
}
```

`cardNumber` is `null` except for the holder reading their own card. Treat it as a
payment credential: never log, cache or store it.

| Status | Meaning |
| --- | --- |
| `UNISSUED` | Created, not yet activated by the holder |
| `ACTIVE` | Usable, unless `frozen` is true |
| `BLOCKED` | Terminal. The holder cannot reverse it |

`frozen` is separate from status. A frozen card is still `ACTIVE` but cannot spend.

## List and read

### `GET /api/v1/cards`

Scope: `core:cards:read`. Returns the signed-in user's cards.

```json
{ "data": { "cards": [ { "id": "...", "last4": "4417" } ] } }
```

### `GET /api/v1/cards/{cardId}`

Scope: `core:cards:read`. Returns `404` when the card is not the caller's.

## Issue

### `POST /api/v1/cards`

Scope: `core:cards:create`. Administrative.

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | string | Who the card belongs to |
| `cardType` | integer | Card product |
| `printedName` | string | Name printed on the card, up to 64 characters |

The response carries the full card number exactly once, for the print pipeline. It is
never returned again.

## Activate

### `POST /api/v1/cards/{cardId}/activate`

Scope: `core:cards:activate`

```json
{ "cardNumber": "6000 0000 0000 4417" }
```

The holder proves possession by entering the printed number. Spacing and dashes are
tolerated. The card must be `UNISSUED`.

## Freeze and unfreeze

### `POST /api/v1/cards/{cardId}/freeze`

Scope: `core:cards:freeze`. No step-up. Freezing is the emergency control and must
always be one tap away.

### `POST /api/v1/cards/{cardId}/unfreeze`

Scope: `core:cards:freeze`. Requires [step-up verification](./step-up.md), because
unfreezing restores spending.

## Spend caps

Three optional caps, all in BZD, all nullable. `null` means no cap.

| Cap | Applies to |
| --- | --- |
| `perTxnCap` | A single payment |
| `dailyCap` | Rolling 24 hours |
| `lifetimeCap` | The card's whole life |

### `PUT /api/v1/cards/{cardId}/limits`

Scope: `core:cards:limits`

```json
{ "perTxnCap": 250.00, "dailyCap": 800.00, "lifetimeCap": null }
```

**This replaces all three caps.** A field you leave out is sent as `null`, which removes
that cap. Always send the full set.

#### Tightening and loosening

A change **loosens** if any single cap loosens.

| Current | Requested | Loosening |
| --- | --- | --- |
| `null` | `null` | No, nothing changed |
| `null` | a value | No, this adds a bound |
| a value | `null` | Yes, this removes a bound |
| a value | larger | Yes |
| a value | equal or smaller | No |

| Change | What it takes |
| --- | --- |
| Tightening | Nothing extra. Always allowed, never prompts |
| Loosening, user enrolled in 2FA | A valid step-up grant |
| Loosening, user not enrolled | Refused with `core::gatekeeper::enrol::required`. The user must enrol first |

Loosening a cap is the one action where an unenrolled user is refused rather than let
through. It is a privilege increase, and refusing costs the user nothing because the
card keeps working at its current caps. See [Step-up verification](./step-up.md).

#### Cap validation

| Rule | Message |
| --- | --- |
| Caps must be greater than zero | A cap of 0 is rejected. To stop all spending, freeze the card |
| `perTxnCap` cannot exceed `dailyCap` | |
| `dailyCap` cannot exceed `lifetimeCap` | |
| `perTxnCap` cannot exceed `lifetimeCap` | |

Failures are `400` with `core::tessera::limits::invalid`. The message is written for
the cardholder, so it is safe to show as-is.

Validation runs before the step-up check, so an invalid change is never worth a code
prompt. Apply the same order in your client.

## Block

### `POST /api/v1/cards/{cardId}/block`

Scope: `core:cards:manage`. Administrative and permanent. A blocked card cannot be
unblocked; issue a replacement instead.

## Error codes

| Code | Status | Meaning |
| --- | --- | --- |
| `core::tessera::not_found` | 404 | Unknown card, or not the caller's |
| `core::tessera::request::invalid` | 409 | The card's state does not allow this change |
| `core::tessera::limits::invalid` | 400 | Cap combination rejected |
| `core::tessera::unusable` | 400 | Card cannot be used to pay, for example frozen |
| `core::tessera::update::fail` | 500 | Write failed, nothing changed |
