---
title: Monitoring & alerts
description: Where to look when you want to know if things are healthy, and what each alert means.
sidebar:
  order: 4
---

## Where to look

| What | Tool | Link |
| --- | --- | --- |
| Dashboards | TODO | TODO |
| Logs | TODO | TODO |
| Errors / exceptions | TODO | TODO |
| Uptime checks | TODO | TODO |
| Cloud provider status | | TODO |

## Alerts

Every alert must have a runbook. An alert nobody knows how to handle just gets ignored.

| Alert | Means | Severity | Goes to | Runbook |
| --- | --- | --- | --- | --- |
| TODO: `api-5xx-rate-high` | API is failing requests | High | TODO | [Service is down](/runbooks/service-is-down/) |

## Who gets paged

TODO: The on-call rotation, the tool that pages people, and how to swap shifts.

## Who watches for unknown problems

TODO: If an AI agent used to watch dashboards and spot anomalies, name who does that now and how often. Add it to [Recurring tasks](/operations/recurring-tasks/).
