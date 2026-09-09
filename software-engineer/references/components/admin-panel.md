# Component guide: Admin / back-office panel

## P0 — blocking
- **Which admin roles exist** (super admin, ops, support, finance, read-only) and precisely what
  each can do. "Admin" is rarely one role — ask before assuming.
- **Which entities are managed here**, and per entity: create / read / update / delete /
  read-only. Some entities are viewable but never editable from the panel.
- **Sensitive actions** (refund, payout, ban, delete, price change, impersonate) — who may do
  them, do they need approval, are they reversible, are they logged.
- Who creates admin accounts, and how the first one exists.

## P1
- Dashboard: which numbers the operator actually acts on (not "some charts").
- Listing pages per entity: columns, filters, search fields, sort, bulk actions, export.
- Audit trail: who changed what and when, how far back, who can see it.
- Manual overrides of automated behavior: force-cancel, reassign, unblock, replay a job,
  resend a notification. These are real features and are usually forgotten.
- Impersonation / "view as user": allowed? logged? restricted to which role?
- Support workflows: how staff answer "where is my order/booking" from this panel.

## P2
- Saved views, scheduled reports, notification template editing, in-panel help.

## Do not ask
UI framework, table library, theme.
