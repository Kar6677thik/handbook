---
title: Data flow
description: Where data comes from, where it's stored, and where it goes.
sidebar:
  order: 2
---

## Data stores

| Store | Holds | Sensitive? | Backed up? | Retention |
| --- | --- | --- | --- | --- |
| TODO: Postgres `main` | Users, orders | Yes (PII) | Yes, see [Backups](/operations/backups-and-restore/) | Forever |
| TODO: Object storage bucket | Uploads | Maybe | TODO | TODO |
| TODO: Redis | Sessions, cache | No | No (rebuildable) | Hours |

## Key flows

Write one short section per important path through the system. Trace it step by step.

### TODO: User signs up

1. Browser posts to `TODO: /api/signup`.
2. API validates, writes a row to `users`.
3. API enqueues a `send-welcome-email` job.
4. Worker sends the email via TODO: provider.

**If step 4 fails:** TODO: what happens, and how do we notice?

## Personal and regulated data

TODO: List what personal data we hold, where it lives, who may access it, and any legal obligations (GDPR, data deletion requests, etc.).
