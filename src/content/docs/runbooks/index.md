---
title: Runbooks
description: Step-by-step procedures for specific problems.
sidebar:
  order: 0
  label: All runbooks
---

A runbook is a checklist for one specific situation. Write it for someone who is tired, stressed, and has never seen this problem before.

## How to write one

- Copy `templates/runbook.md` into this folder.
- Start with the **symptom** the reader sees (the alert name, the error message), not the root cause.
- Give exact commands, and say what correct output looks like.
- Say when to stop and escalate.
- After each incident, update the runbook you used, or write the one that was missing.

## Index

| Runbook | Use when |
| --- | --- |
| [Incident response](/runbooks/incident-response/) | Any customer-facing problem. Start here. |
| [Service is down](/runbooks/service-is-down/) | A service is erroring, timing out, or unreachable |
| [Restore from backup](/operations/backups-and-restore/) | Data is lost or corrupted |
| [Disaster recovery](/operations/disaster-recovery/) | A region, account, or provider is gone |
| TODO | Add one for every alert in [Monitoring & alerts](/operations/monitoring-and-alerts/) |
