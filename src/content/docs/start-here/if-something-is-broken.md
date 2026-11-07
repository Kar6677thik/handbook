---
title: If something is broken
description: The page to open first in an emergency.
sidebar:
  order: 3
---

Stay calm and work through the steps in order.

## 1. Confirm it is really broken

- Run the [manual health check](/operations/monitoring-and-alerts/#the-manual-health-check): it tests every public site in one go.
- Check you can reach Megatron: `ssh $MEGATRON 'echo ok'`. If not, see [Can't reach Megatron](/runbooks/megatron-unreachable/).
- Check the providers: cloudflarestatus.com, status.tailscale.com, githubstatus.com.

## 2. Tell people

Post in TODO: incident channel: **what** is broken, **when** it started, and that **you** are looking at it. Then follow [Incident response](/runbooks/incident-response/).

## 3. Find the right runbook

- A `*.karthiksurkanti.in` site is down: [A public site is down](/runbooks/public-site-down/)
- You can't SSH in, or tailnet sites are unreachable: [Can't reach Megatron](/runbooks/megatron-unreachable/)
- A release won't go out, or the handbook stopped updating: [A catalog release is refused or fails](/runbooks/catalog-release-problems/)
- A whole service is down or erroring: [Service is down](/runbooks/service-is-down/)
- Something changed just before it broke: roll back. See [Deployment, Rollback](/operations/deployment/#rollback-summary)
- Data is lost or corrupted: [Backups & restore](/operations/backups-and-restore/)
- A whole region or provider is gone: [Disaster recovery](/operations/disaster-recovery/)
- Anything else: the [Runbooks](/runbooks/) index

## 4. Escalate if you're stuck

The people and vendors to call are on [Contacts](/reference/contacts/). Escalate early; nobody will blame you for asking.
