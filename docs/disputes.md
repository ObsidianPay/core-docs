---
id: disputes
title: Disputes
sidebar_label: Disputes
---

# Disputes

A dispute is a case attached to one transaction, with a message thread between the two
parties and an arbitrator. Cases are visible only to their participants and to admins.

## The case object

```json
{
  "id": "0a1b2c3d-4e5f-4061-8273-849506a7b8c9",
  "referenceId": "9d4f7c2e-1b3a-4f5e-8c7d-2a1b3c4d5e6f",
  "raisedByUserId": "1f2e3d4c-5b6a-4790-8123-456789abcdef",
  "counterpartyUserId": "7c1e5b90-2d84-4a1f-9e3c-5d6b7a8c9f01",
  "status": "OPEN",
  "reason": "Goods never arrived",
  "resolutionOutcome": null,
  "resolutionReason": null,
  "resolvedByUserId": null,
  "createdAt": "2026-09-16T14:20:00.0000000Z",
  "resolvedAt": null,
  "messages": []
}
```

`status` is `OPEN` or `RESOLVED`. `messages` is populated when reading a single case,
and omitted from lists.

## List cases

### `GET /api/v1/Dispute`

Scope: `core:disputes:read`

| Parameter | Default | Notes |
| --- | --- | --- |
| `all` | `false` | Admin only. Lists every case. Ignored for other callers |
| `status` | | `OPEN` or `RESOLVED`. Applies to the admin listing |
| `page` | `1` | |
| `pageSize` | `20` | Maximum 100 |

Non-admins always get their own cases, whatever `all` is set to, so the flag cannot be
used to probe for admin rights.

```json
{ "data": { "cases": [ { "id": "...", "status": "OPEN" } ], "totalCount": 3 } }
```

## Read a case

### `GET /api/v1/Dispute/{caseId}`

Scope: `core:disputes:read`. Includes the first page of the thread.

Callers who are not a party to the case receive `404`, not `403`. The API does not
confirm that someone else's case exists.

## Messages

### `GET /api/v1/Dispute/{caseId}/messages`

Scope: `core:disputes:read`. Paginated with `page` and `pageSize`.

```json
{
  "data": {
    "messages": [
      {
        "id": "5f6a7b8c-9d0e-4f12-8345-67890abcdef1",
        "disputeCaseId": "0a1b2c3d-4e5f-4061-8273-849506a7b8c9",
        "senderUserId": "1f2e3d4c-5b6a-4790-8123-456789abcdef",
        "isSystemMessage": false,
        "body": "The package was never delivered.",
        "createdAt": "2026-09-16T14:22:10.0000000Z"
      }
    ],
    "totalCount": 12
  }
}
```

`senderUserId` is `null` when `isSystemMessage` is true. System messages record events
such as the case opening or closing.

### `POST /api/v1/Dispute/{caseId}/messages`

Scope: `core:disputes:message`

```json
{ "body": "Tracking shows it was returned to sender." }
```

Returns the created message. Posting to a resolved case fails: the thread is read-only
once closed.

## Resolve

### `POST /api/v1/Dispute/{caseId}/resolve`

Scope: `core:disputes:resolve`. Arbitrator action. Requires
[step-up verification](./step-up.md).

```json
{ "releaseToRecipient": false, "resolutionReason": "No proof of delivery" }
```

| Field | Meaning |
| --- | --- |
| `releaseToRecipient: true` | The recipient keeps the money |
| `releaseToRecipient: false` | The sender is refunded by a reversing transaction |

A refund appends a reversing entry rather than deleting anything, so the ledger keeps
the full history. The response carries the reversing transaction's reference.

The same decision can be applied directly to a transaction with
`POST /api/v1/Transaction/dispute/resolve`, which takes `referenceId`,
`releaseToRecipient` and `resolutionReason`. Prefer the case endpoint when a case
exists, since it also closes the thread.

## Live updates

A SignalR hub pushes case activity so a thread does not need polling.

```
wss://api.obsidianpay.bz/hubs/disputes
```

Authenticate the connection with the same bearer token. Then join the cases you are
viewing:

| Direction | Name | Payload |
| --- | --- | --- |
| Client to server | `JoinCase` | `caseId` |
| Client to server | `LeaveCase` | `caseId` |
| Server to client | `MessagePosted` | The new message |
| Server to client | `CaseOpened` | A case raised against you |
| Server to client | `CaseResolved` | The case, now read-only |

`JoinCase` runs the same participant check as the REST endpoints, so it cannot be used
to listen to a case you are not part of.

Keep the REST endpoints as the source of truth on load and reconnect. Treat the hub as
an accelerator, not a replacement.
