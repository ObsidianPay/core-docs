---
id: merchant-terminals
title: Merchant terminals
sidebar_label: Merchant terminals
---

# Merchant terminals

A terminal is a physical card reader registered to a merchant.

## The terminal object

```json
{
  "id": "6d5c4b3a-2e1f-4098-8765-43210fedcba9",
  "merchantId": "4021",
  "terminalUid": "TRM-00A7F3",
  "label": "Front counter",
  "status": "ACTIVE",
  "registeredAt": "2026-07-14T09:12:00.0000000Z",
  "updatedAt": "2026-07-14T09:12:00.0000000Z"
}
```

`terminalUid` is the reader's own hardware identity. `status` is `ACTIVE` or `DISABLED`.

## List

### `GET /api/v1/merchant-terminals?merchantId=4021`

Scope: `core:merchant_terminals:read`

Returns the terminals for one merchant. The caller must own the merchant, or be an
admin.

## Read

### `GET /api/v1/merchant-terminals/{terminalId}`

Scope: `core:merchant_terminals:read`

## Register

### `POST /api/v1/merchant-terminals`

Scope: `core:merchant_terminals:create`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `merchantId` | string | Yes | Merchant the reader belongs to |
| `terminalUid` | string | Yes | Hardware identity, unique across the platform |
| `label` | string | No | Human label, for example `Front counter` |

Registering a `terminalUid` that already exists fails with
`core::tessera::terminal::already_registered`.

## Disable

### `POST /api/v1/merchant-terminals/{terminalId}/disable`

Scope: `core:merchant_terminals:disable`

Stops the reader being used. Use this when a terminal is lost, stolen or retired.

## Error codes

| Code | Status | Meaning |
| --- | --- | --- |
| `core::tessera::terminal::not_found` | 404 | Unknown terminal, or not visible to the caller |
| `core::tessera::terminal::invalid` | 400 | Invalid request, for example a missing UID |
| `core::tessera::terminal::already_registered` | 409 | That UID is already registered |
| `core::tessera::terminal::update::fail` | 500 | Write failed, nothing changed |
