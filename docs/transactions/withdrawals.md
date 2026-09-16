---
title: Withdrawals
sidebar_label: Withdrawals
---

# Withdrawals

A withdrawal sends money from a wallet to a bank account.

### `POST /api/v1/Transaction/withdraw`

Scope: `core:transactions:create`. Requires [step-up verification](../step-up.md).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `amount` | number | Yes | Greater than zero |
| `bankAccountNumber` | string | Yes | Destination account |
| `bankRoutingNumber` | string | Yes | Destination routing number |
| `note` | string | Yes | Reference shown on the transfer, may be empty |

Bank details are supplied per request. There is no stored list of linked accounts.

```bash
curl -X POST https://api.obsidianpay.bz/api/v1/Transaction/withdraw \
  -H 'Authorization: Bearer <token>' \
  -H 'X-Step-Up: <grant>' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 200.00,
    "bankAccountNumber": "0123456789",
    "bankRoutingNumber": "021000021",
    "note": "Rent"
  }'
```

```json
{
  "data": {
    "referenceId": "5c8d2e91-3f0a-4b7c-9d1e-6a2b3c4d5e7f",
    "chainReferenceId": "0x4c7e...",
    "state": "PROCESSED",
    "message": "Withdrawal initiated and processed successfully. Funds will arrive in your bank account shortly.",
    "accepted": false
  }
}
```

`PROCESSED` means the ledger is settled and the bank transfer has been handed off.
Arrival at the destination bank follows its own schedule.

## Failure handling

The balance is checked and the withdrawal is written in one atomic step, so concurrent
withdrawals cannot overdraw the account. A refusal creates nothing.

| Reason in the message | Cause |
| --- | --- |
| `Insufficient balance for withdrawal.` | Spendable balance too low. Nothing was created |
| `Invalid amount. Must be a positive number.` | Amount is zero, negative or unparseable |
| `Sender account not found.` | The account could not be resolved |
| `Could not verify sender balance.` | Transient. Nothing was created, retry is safe |

These are `400` with the code `core::kineto::withdrawal::initiate::fail`.

If the ledger settles but the bank transfer fails, the transaction ends in `FAIL` with
a reason, the amount is released back to the wallet, and the incident is escalated for
manual handling. Do not retry automatically after a timeout. Read the transaction first
with [`GET /api/v1/Transaction/{referenceId}`](./reading.md).
