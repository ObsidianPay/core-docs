---
id: conventions
title: Conventions
sidebar_label: Conventions
sidebar_position: 3
---

# Conventions

Shapes and rules that apply to every endpoint.

## Success responses

Successful responses are wrapped in an envelope. The payload is always under `data`.

```json
{
  "data": { "referenceId": "6f1c...", "state": "PROCESSED", "message": "..." }
}
```

Paginated endpoints add `meta`:

```json
{
  "data": [ { "id": "..." } ],
  "meta": { "total": 84, "page": 1, "pageSize": 20, "totalPages": 5 }
}
```

`204 No Content` responses have no body.

## Error responses

Errors are [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) problem documents,
sent as `application/problem+json`.

```json
{
  "type": "urn:ocs:error:core::tessera::limits::invalid",
  "title": "The per-transaction cap cannot exceed the 24-hour cap.",
  "status": 400,
  "detail": "The per-transaction cap cannot exceed the 24-hour cap.",
  "traceId": "00-4e1b3e1e6ac01aa6ddbea28723e785d5-693a598807918896-00"
}
```

The machine-readable code is `type` with the `urn:ocs:error:` prefix removed, for
example `core::tessera::limits::invalid`.

**Branch on the code, not on the message.** Message text is written for operators and
changes without notice. Codes are stable. See the [error reference](./reference/errors.md).

Validation failures add an `errors` object keyed by field name:

```json
{
  "status": 400,
  "errors": { "email": ["The Email field is not a valid e-mail address."] }
}
```

## Status codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `202` | Accepted, still processing. Poll for the result |
| `204` | Success, no body |
| `400` | Invalid request or a refused operation, such as insufficient balance |
| `401` | Missing, expired or invalid access token |
| `403` | Authenticated but not permitted, or step-up verification is required |
| `404` | Not found, or not visible to this caller |
| `409` | Conflict with current state, such as a card that cannot change |
| `423` | Account locked |
| `500` | Server error. Nothing was changed unless the message says otherwise |
| `503` | A dependency is unavailable. Retry later |

## Data types

| Type | Format |
| --- | --- |
| Identifiers | UUID strings, for example `9d4f7c2e-1b3a-4f5e-8c7d-2a1b3c4d5e6f` |
| Money in requests | JSON numbers, for example `125.50` |
| Money in transaction responses | Decimal strings with 8 decimal places, for example `"125.50000000"` |
| Timestamps | ISO 8601 UTC, for example `2026-09-16T14:05:09.1234567Z` |
| Currency | JDX on the ledger, pegged 1:1 to the reserve. Balances report `BZD` |

Money is stored at 8 decimal places. Parse it as a decimal type, never as a float.

## Idempotency and retries

The REST API does not accept a client idempotency key. A repeated request is a new
request.

- Transfers cannot overdraw an account, no matter how many arrive at once. See
  [Balances and concurrency](./transactions/overview.md#balances-and-concurrency).
- Two identical transfers that both fit the balance will both go through.

So: disable the submit control until a request settles, and do not retry a spend
automatically after a timeout. Check
[`GET /api/v1/Transaction/{referenceId}`](./transactions/reading.md) first.

Reads (`GET`) are safe to retry at any time.

## Pagination

List endpoints take `page` (from 1) and `pageSize`. `pageSize` is capped at 100.

```
GET /api/v1/Transaction/account/{accountId}?page=2&pageSize=50
```

## Rate limits and CORS

Rate limits are applied per deployment. If you receive `429`, back off and retry.
Browser origins must be allow-listed before they can call the API. Contact your
integration contact to add one.
