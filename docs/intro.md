---
id: intro
title: Introduction
sidebar_label: Introduction
sidebar_position: 1
slug: /
---

# Obsidian Pay API

Obsidian Pay is a Belize payments platform. This is the reference for its public REST
API, served by ObsidianCore.

Everything the API exposes runs through two services:

| Service | Role |
| --- | --- |
| **ObsidianCore** | The REST gateway you call. Accounts, cards, merchants, disputes, authentication. |
| **TransactionCore** | The ledger engine behind it. Not reachable from the internet; ObsidianCore calls it for you. |

Balances and transfers are recorded in an append-only ledger denominated in JDX, which
is backed 1:1 by the fiat reserve.

## Base URL

```
https://api.obsidianpay.bz
```

Every route is versioned under `/api/v1/`. Ask your integration contact for the sandbox
host.

## A first request

```bash
# 1. Sign in
curl -X POST https://api.obsidianpay.bz/api/v1/Users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"..."}'

# 2. Use the access token
curl https://api.obsidianpay.bz/api/v1/Users/<userId>/balance \
  -H 'Authorization: Bearer <accessToken>'
```

```json
{
  "data": {
    "totalBalance": 250.00,
    "availableBalance": 200.00,
    "currency": "BZD"
  }
}
```

## Where to go next

| If you want to | Read |
| --- | --- |
| Sign in and call a protected route | [Authentication](./authentication.md) |
| Understand response and error shapes | [Conventions](./conventions.md) |
| Send, deposit or withdraw money | [Transactions overview](./transactions/overview.md) |
| Handle the 403 that asks for a code | [Step-up verification](./step-up.md) |
| Look up an error code | [Error reference](./reference/errors.md) |

## Support

Include the `traceId` from any error response when you contact support. It identifies
the exact request in our logs.
