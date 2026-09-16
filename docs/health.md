---
id: health
title: Health
sidebar_label: Health
---

# Health

### `GET /api/v1/Lightswitch`

Public. No authentication.

```json
{
  "status": "Up",
  "timestampUtc": "2026-09-16T14:00:00.0000000Z",
  "environment": "Production",
  "version": "1.4.2",
  "uptimeSeconds": 861204,
  "checks": {
    "database": { "status": "Up", "durationMs": 4 },
    "auth": { "status": "Up", "durationMs": 11 },
    "transactioncore": { "status": "Up", "durationMs": 7 }
  }
}
```

| Status | Meaning |
| --- | --- |
| `Up` | Healthy |
| `Degraded` | Responding, but slowly |
| `Down` | Unavailable |

The endpoint returns `200` when the platform is usable and `503` when it is not, so a
monitor can watch the status code alone.

`checks` covers the database, the identity provider and the ledger engine. If
`transactioncore` is down, reads may still work while payments fail.

This response is not wrapped in the usual `data` envelope.
