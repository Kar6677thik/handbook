---
title: If something is broken
description: The page to open first in an emergency.
sidebar:
  order: 3
---

Stay calm and work through the steps in order.

## 1. Confirm it is really broken

- Open the product the way a user would. TODO: URL(s).
- Look at the dashboards. TODO: URL. See [Monitoring & alerts](/operations/monitoring-and-alerts/).
- Check the cloud provider's status page. TODO: URL.

## 2. Tell people

Post in TODO: incident channel: **what** is broken, **when** it started, and that **you** are looking at it. Then follow [Incident response](/runbooks/incident-response/).

## 3. Find the right runbook

- A whole service is down or erroring: [Service is down](/runbooks/service-is-down/)
- Something changed just before it broke: roll back. See [Deployment, Rollback](/operations/deployment/#rollback)
- Data is lost or corrupted: [Backups & restore](/operations/backups-and-restore/)
- A whole region or provider is gone: [Disaster recovery](/operations/disaster-recovery/)
- Anything else: the [Runbooks](/runbooks/) index

## 4. Escalate if you're stuck

The people and vendors to call are on [Contacts](/reference/contacts/). Escalate early; nobody will blame you for asking.
