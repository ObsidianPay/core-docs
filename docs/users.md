---
id: users
title: Users and balances
sidebar_label: Users and balances
---

# Users and balances

## Read a user

### `GET /api/v1/Users/{id}`

Scope: `core:users:read`

Returns the profile: name, username, email, phone number, KYC status and verification
flags. Users can read themselves. Reading another user requires the scope through an
administrative role.

| KYC status | Meaning |
| --- | --- |
| `PENDING` | Submitted or not yet started |
| `VERIFIED` | Approved. Full access |
| `REJECTED` | Declined. Contact support |

## Balance

### `GET /api/v1/Users/{id}/balance`

Scope: `core:users:read`

```json
{
  "data": {
    "totalBalance": 1250.00,
    "availableBalance": 850.00,
    "currency": "BZD"
  }
}
```

| Field | Meaning |
| --- | --- |
| `availableBalance` | Spendable right now. This is what a payment is checked against |
| `totalBalance` | Available plus money still held, such as a deposit inside its hold window or a protected transfer waiting out its dispute window |
| `currency` | Always `BZD` |

Show `availableBalance` as the headline figure. The difference between the two is money
the user owns but cannot spend yet, and is worth explaining wherever it appears.

Balances move without the user acting: a hold expiring, an incoming transfer, a dispute
resolving. Re-fetch after any payment, and after a refusal for insufficient balance.

## Permissions

### `GET /api/v1/Users/{id}/scopes`

Requires a signed-in caller.

```json
{
  "data": {
    "roles": ["customer"],
    "scopes": ["transactions:create", "transactions:read", "cards:read"]
  }
}
```

Use this to decide which controls to render. The API enforces the same rules on every
call regardless of what the client shows.

## KYC webhook

### `POST /api/v1/Kyc/submit`

Called by the identity verification provider, not by API consumers. It is authenticated
by the provider's own signature and updates the user's KYC status.
