---
id: security
title: Two-factor security
sidebar_label: Two-factor security
---

# Two-factor security

Users secure sensitive actions with a TOTP authenticator app. These endpoints manage
enrolment and mint the grants that [step-up verification](./step-up.md) consumes.

All of them require a signed-in caller and act on that caller only.

## Status

### `GET /api/v1/Security/totp`

```json
{
  "data": {
    "enrolled": true,
    "enrolledAt": "2026-08-20T09:00:00.0000000Z",
    "lockedUntil": null
  }
}
```

This is the only endpoint that reports enrolment state. The code-submitting endpoints
deliberately return one uniform failure, so they cannot be used to probe an account.

`lockedUntil` is set after repeated wrong codes. While it is in the future, code
submission fails.

## Enrol

### `POST /api/v1/Security/totp/enrol`

```json
{
  "data": {
    "url": "otpauth://totp/ObsidianPay:ana@example.com?secret=...&issuer=ObsidianPay",
    "barcode": "iVBORw0KGgoAAAANSUhEUg..."
  }
}
```

`url` is the provisioning URI and `barcode` is the same secret rendered as a PNG for
scanning. Both carry the shared secret. Show them to the user, then discard them. Never
log, cache or persist either one.

This call does **not** enable two-factor. The key stays pending until it is confirmed.

### `POST /api/v1/Security/totp/enrol/confirm`

```json
{ "code": "123456" }
```

Proves the authenticator holds the key, and completes enrolment. Until this succeeds,
the user counts as not enrolled.

Calling enrol while already enrolled fails with
`core::gatekeeper::totp::already_enrolled`.

## Verify a code

### `POST /api/v1/Security/totp/verify`

```json
{ "code": "123456" }
```

```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "expiresAt": "2026-09-16T14:35:00.0000000Z"
  }
}
```

Exchanges a current code for a short-lived grant. Send that grant in the `X-Step-Up`
header on the sensitive request that follows. One grant covers several requests until
it expires.

Exclude this endpoint from any automatic step-up retry logic in your client. It mints
grants, so it can never itself be challenged.

## Remove two-factor

### `DELETE /api/v1/Security/totp`

```json
{ "code": "123456" }
```

Requires a current code. Removing the account's strongest factor must not be possible
from a stolen session alone.

## Failure handling

Every rejected code returns `400` with `core::gatekeeper::code::invalid`, whether the
code was wrong, the user is not enrolled, or the account is locked out. This is
deliberate: a specific message would turn the endpoint into an oracle for account state.

Show one message for all of them, for example "Invalid or expired code", and let the
user retry. Read `GET /api/v1/Security/totp` when you need to know whether they are
enrolled or locked out.

| Code | Status | Meaning |
| --- | --- | --- |
| `core::gatekeeper::code::invalid` | 400 | Code rejected. Reason is deliberately not disclosed |
| `core::gatekeeper::totp::already_enrolled` | 409 | Enrolment attempted while already enrolled |
| `core::gatekeeper::enrol::fail` | 500 | Enrolment state could not be written. Previous state intact, retry is safe |
| `core::gatekeeper::grant::invalid` | 503 | The secrets service is unavailable. Retry later |
