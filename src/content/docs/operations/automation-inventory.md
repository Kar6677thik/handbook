---
title: Automation inventory
description: Every task AI tooling used to do for us, and the manual procedure that replaces it.
sidebar:
  order: 1
---

This may be the most important page here. AI agents and assistants used to handle many tasks quietly, so nobody noticed them happening. Now that those tools are gone, the tasks don't happen at all unless a person does them, and the failures often show up weeks later.

## How to fill this in

Work through each source below and list everything the AI tooling did:

- Agent configs, prompts, and scheduled jobs (look for `AGENTS.md`, `CLAUDE.md`, `.cursor/`, `.github/workflows/`, cron entries, and AI-provider API keys in the secrets store).
- Billing records from AI providers: whatever was calling the API was doing *something*.
- Bot accounts in GitHub, Slack, ticketing tools, and the cloud console. Look through their activity history.
- Ask everyone: "What used to just happen?"

## Inventory

| Task | Used to be done by | How often | What breaks if skipped | Now done by | Procedure |
| --- | --- | --- | --- | --- | --- |
| TODO: e.g. Triage alerts and restart stuck workers | TODO: e.g. ops agent | Continuous | Queue backs up, jobs stall | TODO: on-call | [Service is down](/runbooks/service-is-down/) |
| TODO: e.g. Review and merge dependency updates | TODO | Weekly | Security vulnerabilities pile up | TODO | TODO |
| TODO: e.g. Code review on pull requests | TODO | Every PR | Bugs reach production | Peer review | [Release process](/development/release-process/) |
| TODO: e.g. Answer support tickets | TODO | Daily | Customers churn | TODO | TODO |
| TODO: e.g. Rotate keys, renew certificates | TODO | Quarterly | Outage on expiry | TODO | [Recurring tasks](/operations/recurring-tasks/) |
| TODO: e.g. Write release notes, changelogs | TODO | Each release | Confusion | TODO | TODO |

## After you've filled it in

- Put every recurring item on the [Recurring tasks](/operations/recurring-tasks/) calendar with a named person.
- Disable the AI integrations and revoke their API keys and bot accounts so they can't fail half-way through a task. See [Offboarding & rotation](/access/offboarding-and-rotation/).
