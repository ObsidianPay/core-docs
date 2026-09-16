---
title: Changelog
sidebar_label: Changelog
---

# Changelog

Behaviour changes that affect API consumers. Newest first.

## 2026-09-16

### Balance checks are atomic

Spend checks now run in the same database lock as the ledger write.

- Concurrent payments can no longer overdraw an account. Whichever fit the balance
  succeed; the rest are refused.
- **A refused payment creates nothing.** There is no `referenceId` and no entry in
  transaction history. Previously a refusal could leave a `FAIL` record.
- Insufficient balance still arrives as `400` under the operation's `initiate::fail`
  code.

One exception: a protected transfer that covers the amount but not the fee still
settles to `FAIL`, because the fee is only known after the gas tier is resolved.

### Idempotency keys are scoped per account

Internally, the reference identifying a transaction is now derived from the sending
account and the key together. Two accounts using the same key no longer collide.

`referenceId` is still an opaque identifier in every response, including `202`
responses. No client change is required. Do not derive or parse it.

### Loosening a card spend cap requires two-factor

`PUT /api/v1/cards/{cardId}/limits` now refuses a loosening change from a user with no
authenticator enrolled, with the new code `core::gatekeeper::enrol::required` (403).

- Loosening means raising a cap or clearing one to `null`.
- Tightening is unchanged: lowering a cap or setting a first one never prompts.
- Every other step-up gated endpoint still lets unenrolled users through.

Clients must not show a code prompt for this code. Route the user to enrolment, then
retry. See [Step-up verification](../step-up.md).

### `SELF` transactions are refused

The `SELF` transaction type had no settlement path and left funds reserved
indefinitely. It is now refused at the boundary. No REST endpoint sends it.
