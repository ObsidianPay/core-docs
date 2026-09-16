---
id: step-up
title: Step-up verification
sidebar_label: Step-up verification
sidebar_position: 4
---

# Step-up verification

Sensitive actions require a fresh code from the user's authenticator app, on top of a
valid access token. The pattern is always the same: the request is refused with `403`,
you obtain a short-lived grant, then you repeat the request with that grant attached.

## The grant

```
X-Step-Up: <grant token>
```

A grant is minted by [`POST /api/v1/Security/totp/verify`](./security.md#verify-a-code)
and lasts a few minutes. It is bound to one user. While you hold one, attach it to every
request: it is ignored where it is not needed and saves a round trip where it is.

Keep grants in memory only. They are bearer credentials.

## The flow

```
POST /api/v1/Transaction/p2p            (no grant)
  -> 403  core::gatekeeper::required

POST /api/v1/Security/totp/verify       { "code": "123456" }
  -> 200  { token, expiresAt }

POST /api/v1/Transaction/p2p            X-Step-Up: <token>
  -> 200
```

Retry the original request once. A second `403` is a server-side problem, not a reason
to prompt again.

## Which actions are gated

| Action | Endpoint | When |
| --- | --- | --- |
| Send money | `POST /api/v1/Transaction/p2p` | Always |
| Withdraw to a bank | `POST /api/v1/Transaction/withdraw` | Always |
| Resolve a dispute | `POST /api/v1/Transaction/dispute/resolve` | Always |
| Resolve a dispute case | `POST /api/v1/Dispute/{caseId}/resolve` | Always |
| Unfreeze a card | `POST /api/v1/cards/{cardId}/unfreeze` | Always |
| Raise or remove a card limit | `PUT /api/v1/cards/{cardId}/limits` | Only when the change loosens a cap |

Freezing a card and lowering a limit are never gated. A user who thinks they have been
compromised must be able to clamp down instantly.

## Users without an authenticator app

By default, a user who has not enrolled passes through gated endpoints. There is no
factor to ask them for, and they should not be locked out of core features.

**One exception: loosening a card spend cap.** That is a privilege increase, and a user
who is refused loses nothing because the card keeps working at its current limits. For
that action only, an unenrolled user is refused with a distinct code.

| Code | Status | Meaning | What to do |
| --- | --- | --- | --- |
| `core::gatekeeper::required` | 403 | Enrolled, no valid grant | Ask for a code, then retry |
| `core::gatekeeper::enrol::required` | 403 | Not enrolled, and this action requires it | Send the user to enrolment, then retry |
| `core::gatekeeper::grant::invalid` | 503 | Verification is temporarily unavailable | Retry later. Do not prompt again |

Never show a code prompt for `core::gatekeeper::enrol::required`. The user has no code
to enter. Route them to [enrolment](./security.md#enrol) first.

## Client pattern

Handle this once, in your HTTP layer, rather than in each screen.

```ts
async function call(path, options, retried = false) {
  const res = await fetch(path, withGrantHeader(options));
  if (res.status !== 403 || retried) return res;

  const code = errorCode(await res.clone().json());
  if (code !== 'core::gatekeeper::required') return res;   // enrol::required is not a code prompt

  const grant = await promptForCode();                     // your UI, returns null if cancelled
  if (!grant) return res;

  storeGrant(grant);
  return call(path, options, true);                        // retry exactly once
}
```

Exclude `POST /api/v1/Security/totp/verify` from this logic. It mints grants, so it can
never be challenged, and including it risks a loop.
