---
title: Offboarding & rotation
description: Removing a person's (or a bot's) access, and rotating credentials.
sidebar:
  order: 3
---

## When someone leaves

- [ ] Disable their SSO / identity account (this cuts most access at once).
- [ ] Remove them from each system in the [Access inventory](/access/access-inventory/) that doesn't use SSO.
- [ ] Rotate any shared credential they knew.
- [ ] Reassign the pages they owned (search for `owner: Their Name`).
- [ ] Reassign their [recurring tasks](/operations/recurring-tasks/).

## Retiring AI agents and bots

Treat each AI integration like an employee who has left:

- [ ] Revoke the AI provider API keys and cancel the subscriptions.
- [ ] Remove the bot accounts and the GitHub/GitLab apps.
- [ ] Remove the webhooks and scheduled jobs that called them.
- [ ] Make sure every task they did is on the [Automation inventory](/operations/automation-inventory/).

## Rotating credentials

| Credential | Rotate every | How | Last rotated |
| --- | --- | --- | --- |
| TODO: DB admin password | TODO | TODO | TODO |
| TODO: Cloud access keys | | | |
| TODO: Third-party API keys | | | |
