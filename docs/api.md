# REST contract

All application routes run on the Next.js Node runtime. Mutations require an exact configured Origin and application/json. Sessions come only from the HttpOnly cookie; clients cannot supply a tenant or role. Bodies are limited to 16 KiB. Errors use `{error:{code,message}}` with no SQL or stack details.

| Method | Path                                        | Behavior                                                                                 |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| POST   | /api/auth/login                             | allowlisted email + local demo password; sets session cookie                             |
| POST   | /api/auth/logout                            | revoke session in DB and remove cookie                                                   |
| GET    | /api/requests?q=&status=&page=1&pageSize=10 | tenant-scoped, escaped search; status is draft/pending/approved/rejected; max pageSize50 |
| POST   | /api/requests                               | create a draft; requester/approver only                                                  |
| GET    | /api/requests/{id}                          | request and chronological audit trail in caller's tenant                                 |
| PATCH  | /api/requests/{id}                          | submit/approve/reject with expected revision; atomic audited transition                  |

Create body:

```json
{
  "title": "Design licenses",
  "supplier": "Figma",
  "category": "Software",
  "description": "Annual seats for the product team",
  "amountMinor": 125029
}
```

Transition body:

```json
{ "action": "reject", "version": 2, "reason": "Please revise the budget" }
```

Categories: Software, Equipment, Services, Travel. Title length3–100; supplier2–100; justification10–2000; amount is a positive integer at most1,000,000,000. Reject requires a trimmed reason of at least3 characters; all decision notes max500. Successful creation returns201. Invalid input400, unauthenticated401, forbidden403, missing/cross-tenant404, revision/state conflict409, unsupported media415, oversized413, login limit429, disabled/unconfigured demo503. Unexpected dependency errors500 with a generic message.
