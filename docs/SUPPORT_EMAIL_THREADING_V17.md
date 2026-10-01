# LINGXIFIELD Support Mail Bridge

The site already sends support notifications through Resend. V17 closes the missing return path.

## Production environment variables

Required for inbound email synchronization:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET` — webhook signing secret (`whsec_...`)
- `LINGXIFIELD_SUPPORT_INBOUND_DOMAIN` — Resend receiving domain only, without `@`
- `LINGXIFIELD_SUPPORT_NOTIFY_EMAIL` — support operator email
- `LINGXIFIELD_SUPPORT_ADMIN_EMAILS` — comma-separated allowed operator sender addresses
- `LINGXIFIELD_SUPPORT_ACTION_SECRET` — long random secret used for email action links
- `LINGXIFIELD_SUPPORT_FROM_EMAIL` — existing verified sender, e.g. `灵犀场 <support@lingxifield.com>`

## Resend dashboard

Create one webhook endpoint:

`https://lingxifield.com/api/support/inbound`

Enable:
- `email.received`
- `email.opened` (optional but recommended for automatic "viewed" state)

The handler verifies Svix/Resend signatures and rejects unsigned calls.

## Workflow

1. User submits an issue.
2. Ticket is `received`.
3. Support notification email includes the ticket identity.
4. Opening the notification can mark `viewed` when open events are enabled.
5. Replying to the notification goes to `ticket-<uuid>@<inbound-domain>`.
6. Resend sends `email.received`.
7. The handler verifies the webhook, verifies the sender, deduplicates the event, retrieves the email body, forwards it to the customer, and marks `processing`.
8. The support email also contains signed `Viewed / Processing / Completed` actions.
9. `Completed` marks the ticket `fixed` and records `completedAt`.
10. `/account/support` polls while visible and refreshes on window focus.

No schema migration is required. Lifecycle metadata is stored inside the existing ticket `context` JSON object, preserving current production data.
