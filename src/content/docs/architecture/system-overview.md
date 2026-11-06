---
title: System overview
description: Every major component, what it does, and how they connect.
sidebar:
  order: 1
---

## Diagram

TODO: Add a diagram. Draw it in any tool (Excalidraw, draw.io), export it as SVG into `src/assets/`, and keep the source file next to it so others can edit it. A text diagram is fine too:

```text
            ┌──────────┐
 users ───▶ │   CDN    │
            └────┬─────┘
                 ▼
            ┌──────────┐      ┌──────────┐
            │ Web app  │ ───▶ │   API    │
            └──────────┘      └────┬─────┘
                                   ├──────▶ Postgres (primary data)
                                   └──────▶ Queue ──▶ Workers
```

## Components

| Component | What it does | Runs on | Code | Docs |
| --- | --- | --- | --- | --- |
| TODO: Web app | Customer-facing UI | TODO | TODO: repo link | [Service page](/services/example-service/) |
| TODO: API | Business logic, auth | TODO | TODO | TODO |
| TODO: Database | System of record | TODO | n/a | [Backups](/operations/backups-and-restore/) |

## External dependencies

Third-party services the system can't run without.

| Service | Used for | What breaks without it | Account details |
| --- | --- | --- | --- |
| TODO: e.g. Stripe | Payments | Checkout | [Vendor accounts](/access/vendor-accounts/) |
| TODO: e.g. SendGrid | Email | Sign-up, password reset | [Vendor accounts](/access/vendor-accounts/) |

## Known weak spots

TODO: Be honest. List single points of failure, things nobody fully understands, and tech debt that could cause an outage.
