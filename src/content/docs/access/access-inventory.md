---
title: Access inventory
description: Each system, who has access, at what level, and how to grant or remove it.
sidebar:
  order: 1
---

:::caution
Never write passwords, keys, or tokens on this page or anywhere else in these docs. Record **where** a credential is kept, not what it is.
:::

## Systems

| System | Admins (at least 2) | How to request access | How access is granted | Login method |
| --- | --- | --- | --- | --- |
| TODO: Cloud console (prod) | TODO, TODO | TODO | e.g. IAM group `prod-admins` | SSO / MFA |
| TODO: Code host org | | | | |
| TODO: Secrets vault | | | | |
| TODO: Domain registrar | | | | |
| TODO: DNS provider | | | | |
| TODO: Monitoring | | | | |
| TODO: Payment provider | | | | |

## Break-glass access

TODO: If SSO is down, or every admin is unavailable, how does someone get in? Where are the root / break-glass credentials kept (e.g. a sealed envelope in a safe, or a vault entry with a two-person rule)? Who can open them?

## Access review

Every quarter, check each row above, remove people who no longer need access, and note the date here. See [Recurring tasks](/operations/recurring-tasks/).

| Date | Reviewer | Changes |
| --- | --- | --- |
| TODO | | |
