---
title: Example service
description: A filled-out service page layout. Copy templates/service.md to create real ones, then delete this page.
owner: TODO
---

:::note
This is an example. For each real service, copy `templates/service.md` into this folder, fill it in, and add it to the [service catalog](/services/). Delete this page once real ones exist.
:::

## What it does

TODO: Two or three sentences. Who or what calls it, and what breaks if it stops?

## At a glance

| | |
| --- | --- |
| Repository | TODO: link |
| Language / framework | TODO |
| Runs on | TODO: platform, cluster, region |
| Production URL | TODO |
| Dashboards | TODO: link |
| Logs | TODO: where and how to query |
| Alerts | TODO: which alerts fire for this service, linking to their runbooks |

## Dependencies

| Depends on | For | If it's down |
| --- | --- | --- |
| TODO: Postgres `main` | All reads/writes | Service returns 500s |

**Who depends on this service:** TODO

## Run it locally

```sh
# TODO: exact commands, from a fresh clone
```

## Configuration

| Variable | Meaning | Where it's set | Secret? |
| --- | --- | --- | --- |
| TODO: `DATABASE_URL` | Postgres connection string | TODO | Yes, at vault path `TODO` |

## Deploy

TODO: How this service is deployed, if different from the standard [Deployment](/operations/deployment/) process.

## Common tasks

### TODO: e.g. Restart it

```sh
# TODO
```

## Gotchas

TODO: The things that surprise people. Odd behaviour, manual steps, history.
