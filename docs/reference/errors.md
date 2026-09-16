---
title: Error codes
sidebar_label: Error codes
---

# Error codes

Every failure carries a stable code in the problem document's `type`, prefixed with
`urn:ocs:error:`. Branch on the code. Message text is written for operators and changes
without notice.

```json
{
  "type": "urn:ocs:error:core::gatekeeper::required",
  "title": "This action requires step-up verification.",
  "status": 403,
  "traceId": "00-4e1b3e1e6ac01aa6ddbea28723e785d5-693a598807918896-00"
}
```

Codes are grouped by domain. The domain names are internal service names and are stable.

## General

| Code | Status | Meaning |
| --- | --- | --- |
| `core::error` | 500 | Unexpected server error |
| `core::request::invalid` | 400 | Malformed or invalid request |
| `core::access_denied` | 401, 403 | Not authenticated, or missing the required scope |

## Users

| Code | Status | Meaning |
| --- | --- | --- |
| `core::users::not_found` | 404 | No such user |
| `core::users::status::locked` | 423 | Account locked |
| `core::users::status::unverified` | 403 | KYC not complete |
| `core::users::kineto::balance::fail` | 500 | Balance could not be read |
| `core::auth::unavailable` | 503 | Identity provider unavailable |
| `core::auth::synthdetected::email` | 409 | Email already registered |

## Transactions (`kineto`)

| Code | Status | Meaning |
| --- | --- | --- |
| `core::kineto::unavailable` | 503 | Ledger engine unreachable. Nothing was written |
| `core::kineto::not_found` | 404 | No transaction for that reference |
| `core::kineto::deposit::initiate::fail` | 400 | Deposit refused |
| `core::kineto::deposit::confirm::fail` | 400 | Confirmation refused, for example wrong state |
| `core::kineto::p2p::initiate::fail` | 400 | Transfer refused. Reason follows the last colon |
| `core::kineto::p2p::self::blocked` | 400 | Sender and recipient are the same |
| `core::kineto::p2p::system_program::blocked` | 400 | Recipient is the platform account |
| `core::kineto::purchase::initiate::fail` | 400 | Purchase refused |
| `core::kineto::purchase::amount::invalid` | 400 | Amount is not a positive number |
| `core::kineto::purchase::merchant::invalid` | 400 | Merchant unknown or not active |
| `core::kineto::purchase::card::unsupported` | 400 | Card path not available for this purchase |
| `core::kineto::withdrawal::initiate::fail` | 400 | Withdrawal refused |
| `core::kineto::dispute::raise::invalid` | 400 | Transaction cannot be disputed in its current state |
| `core::kineto::dispute::raise::fail` | 500 | Dispute could not be raised |
| `core::kineto::dispute::resolve::fail` | 500 | Resolution failed |

Refusals such as insufficient balance arrive under the operation's `initiate::fail`
code, with the reason in the message after the last colon. See
[Transactions overview](../transactions/overview.md#balances-and-concurrency).

## Step-up (`gatekeeper`)

| Code | Status | Meaning |
| --- | --- | --- |
| `core::gatekeeper::required` | 403 | Enrolled user, no valid grant. Ask for a code and retry |
| `core::gatekeeper::enrol::required` | 403 | Action requires two-factor and the user has none. Route to enrolment |
| `core::gatekeeper::code::invalid` | 400 | Code rejected. Covers wrong, not enrolled and locked out alike |
| `core::gatekeeper::totp::already_enrolled` | 409 | Already enrolled |
| `core::gatekeeper::enrol::fail` | 500 | Enrolment state not written. Retry is safe |
| `core::gatekeeper::grant::invalid` | 503 | Verification temporarily unavailable |

## Cards and terminals (`tessera`)

| Code | Status | Meaning |
| --- | --- | --- |
| `core::tessera::not_found` | 404 | Unknown card, or not the caller's |
| `core::tessera::type::invalid` | 400 | Unknown card type |
| `core::tessera::request::invalid` | 400, 409 | Invalid request, or the card's state does not allow it |
| `core::tessera::state::invalid` | 409 | Card is in the wrong state for this action |
| `core::tessera::limits::invalid` | 400 | Cap combination rejected. Message is safe to show |
| `core::tessera::issue::fail` | 500 | Card could not be issued |
| `core::tessera::update::fail` | 500 | Card could not be updated |
| `core::tessera::unusable` | 400 | Card cannot pay, for example frozen |
| `core::tessera::terminal::not_found` | 404 | Unknown terminal |
| `core::tessera::terminal::invalid` | 400 | Invalid terminal request |
| `core::tessera::terminal::already_registered` | 409 | That UID is registered already |
| `core::tessera::terminal::update::fail` | 500 | Terminal could not be updated |

## Disputes (`tribunal`)

| Code | Status | Meaning |
| --- | --- | --- |
| `core::tribunal::case::not_found` | 404 | Unknown case, or the caller is not a party |
| `core::tribunal::case::already_open` | 409 | A case is already open for that transaction |
| `core::tribunal::case::closed` | 409 | The case is resolved and read-only |
| `core::tribunal::case::list::fail` | 500 | Cases could not be listed |
| `core::tribunal::message::invalid` | 400 | Empty or oversized message |
| `core::tribunal::message::create::fail` | 500 | Message could not be saved |
| `core::tribunal::participant::invalid` | 403 | Caller is not a party to the case |

## Platform (`vault`)

| Code | Status | Meaning |
| --- | --- | --- |
| `core::vault::totp::create::fail` | 500 | Authenticator key could not be created |
| `core::vault::totp::delete::fail` | 500 | Authenticator key could not be removed |
| `core::vault::totp::validate::fail` | 503 | Code could not be checked |
| `core::vault::secret::get::fail` | 500 | Secret read failed |
| `core::vault::secret::write::fail` | 500 | Secret write failed |

## Handling advice

| Class | What to do |
| --- | --- |
| `400` refusals | Show the reason. Do not retry unchanged |
| `401` | Refresh once, then re-authenticate |
| `403` step-up codes | Follow [step-up verification](../step-up.md) |
| `403` others | The user lacks the scope. Hide the control |
| `404` | Treat as absent, not as an access error. The API answers `404` where confirming existence would leak information |
| `409` | Re-read the resource, its state moved |
| `500` | Nothing changed unless the message says otherwise. Safe to retry once |
| `503` | A dependency is down. Back off and retry |

Always capture `traceId` from failures. It identifies the request in our logs.
