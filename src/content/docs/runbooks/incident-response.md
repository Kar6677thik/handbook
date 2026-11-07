---
title: Incident response
description: Roles, communication, and the order of work during an incident.
sidebar:
  order: 1
---

## 1. Declare it

If customers are affected, or might be, it's an incident. Declaring one is cheap. Post in TODO: incident channel:

> **Incident:** what is broken · **Impact:** who is affected · **Lead:** your name

## 2. Assign roles

Even with only two people, split the work:

- **Lead:** coordinates and makes decisions. Doesn't type commands.
- **Fixer:** investigates and changes things. Says each action out loud before doing it.
- **Comms:** posts updates every TODO: 30 minutes to the channel and, if needed, the status page (TODO: link).

## 3. Mitigate first, investigate later

Restore service first; work out why afterwards. In rough order of preference:

1. Roll back the last deploy. See [Deployment, Rollback](/operations/deployment/#rollback-summary).
2. Turn off the feature flag.
3. Scale up or restart. See [Service is down](/runbooks/service-is-down/).
4. Fail over. See [Disaster recovery](/operations/disaster-recovery/).

Write down **everything** you do, with timestamps, in the incident channel.

## 4. Close it

- Confirm with real checks that the impact has ended.
- Post a final update.

## 5. Follow up

Within a week, write a short blameless review: what happened, the timeline, what went well, what didn't, and the follow-up tasks with owners. TODO: where reviews are stored. Then **update the runbooks and docs** that were wrong or missing.
