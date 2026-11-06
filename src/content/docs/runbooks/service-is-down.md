---
title: Service is down
description: Generic triage for a service that is erroring, slow, or unreachable.
sidebar:
  order: 2
---

**Symptoms:** health check failing, 5xx errors rising, timeouts, users reporting "it's not loading".

## 1. How bad is it? (2 minutes)

- Is it every user or some? Every endpoint or one?
- When did it start? Look at the dashboard: TODO: link.
- **Did anything change just before it started?** A deploy, a config change, an infrastructure change, a vendor incident. If so, [roll it back](/operations/deployment/#rollback) first and investigate afterwards.

## 2. Is it running?

```sh
# TODO: show running instances / pods / containers and their restart counts
```

If it's crash-looping, read the logs from the last crash:

```sh
# TODO: fetch recent logs for the service
```

## 3. Are its dependencies healthy?

Check each item in the "Dependencies" table on the [service's page](/services/). The usual suspects:

- **Database:** connections maxed out? Disk full? Slow queries?
- **External APIs:** check their status pages.
- **Disk / memory:** full or exhausted on the host?
- **Certificates / domains:** expired? See [DNS, domains & certificates](/infrastructure/dns-domains-certificates/).

## 4. Restart or scale

```sh
# TODO: safe restart command
# TODO: scale up command
```

## 5. Escalate

If none of this works within TODO: 30 minutes, escalate. See [Contacts](/reference/contacts/).
