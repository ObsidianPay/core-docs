---
id: authentication
title: Authentication
sidebar_label: Authentication
sidebar_position: 2
---

# Authentication

Every endpoint except registration, login, token refresh, health and the KYC webhook
requires a bearer token.

```
Authorization: Bearer <accessToken>
```

Tokens are JWTs issued by the platform identity provider. Treat them as opaque.

## Register

### `POST /api/v1/Users/register`

| Field | Type | Rules |
| --- | --- | --- |
| `firstName` | string | 3 to 128 characters |
| `lastName` | string | 3 to 128 characters |
| `email` | string | Valid email address, unique |
| `phoneNumber` | string | Valid phone number |
| `username` | string | Up to 16 characters, unique |
| `password` | string | Provider password policy applies |

```bash
curl -X POST https://api.obsidianpay.bz/api/v1/Users/register \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Ana",
    "lastName": "Mendez",
    "email": "ana@example.com",
    "phoneNumber": "+5016701234",
    "username": "anam",
    "password": "..."
  }'
```

Returns `200` with the new user. `409` means the email or username is taken.

New users start with KYC status `PENDING`. Verification runs through our partner, and
its result arrives by webhook.

## Log in

### `POST /api/v1/Users/login`

```json
{ "email": "ana@example.com", "password": "..." }
```

```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 300
  }
}
```

`expiresIn` is seconds. Refresh before it elapses.

| Status | Meaning |
| --- | --- |
| `401` | Wrong email or password |
| `403` | Account not permitted to sign in |
| `423` | Account locked |

## Refresh

### `POST /api/v1/Users/refresh-token`

```json
{ "refreshToken": "eyJhbGciOi..." }
```

Returns a new token pair in the same shape as login. Replace both tokens: the refresh
token rotates.

When refresh fails with `401`, the session is over. Send the user back to login.

## Permissions

Authorization is policy based. Each endpoint requires a scope such as
`core:transactions:create`, resolved per user at request time.

### `GET /api/v1/Users/{id}/scopes`

Returns what the signed-in user may do. Use it to decide which controls to show, never
as the security boundary. The API enforces the same rules regardless.

```json
{
  "data": {
    "roles": ["customer"],
    "scopes": ["transactions:create", "transactions:read", "cards:read"]
  }
}
```

A `403` without a step-up error code means this user lacks the scope.

## Sensitive actions

Some actions need a second factor on top of the bearer token, for example sending
money or raising a card limit. Those return `403` with a step-up error code. See
[Step-up verification](./step-up.md).

## Handling tokens

- Keep tokens in memory where possible. Avoid `localStorage` in browsers.
- Never put a token in a URL or a log.
- Retry a `401` once after refreshing, then stop and re-authenticate.
