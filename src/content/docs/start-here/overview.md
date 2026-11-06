---
title: Overview
description: The five-minute picture of what we run and why.
sidebar:
  order: 1
---

Read this page first. After it you should be able to explain to someone else what we build, who uses it, and roughly how it fits together.

## What we do

TODO: Two or three sentences. What does the business or product do? Who are the users?

## The system in one paragraph

TODO: Describe the whole system plainly. For example: "Users reach the web app at example.com. It talks to the API, which stores data in Postgres and puts slow work on a queue that workers process. Everything runs on X in region Y."

The details are in [System overview](/architecture/system-overview/).

## The things that matter most

These are the parts that hurt most when they break. Learn them first.

| What | Why it matters | Where to read more |
| --- | --- | --- |
| TODO: e.g. Primary database | All customer data lives here | [Backups & restore](/operations/backups-and-restore/) |
| TODO: e.g. Payments service | Revenue stops if it breaks | [Services](/services/) |
| TODO: e.g. Domain & DNS | If it expires, everything goes offline | [DNS, domains & certificates](/infrastructure/dns-domains-certificates/) |

## Tasks that used to run themselves

Until now, AI tooling took care of a lot of work automatically. All of that work now has to be done by a person, on a schedule. The full list is in the [Automation inventory](/operations/automation-inventory/). Read it in your first week.

## Where to go next

1. [Your first week](/start-here/first-week/)
2. [System overview](/architecture/system-overview/)
3. [Local setup](/development/local-setup/)
