---
title: Environments
description: Each environment, what it's for, and how they differ.
sidebar:
  order: 2
---

| Environment | URL | Purpose | Data | Who can deploy |
| --- | --- | --- | --- | --- |
| Local | `http://localhost:TODO` | Development | Seed data | Anyone |
| TODO: Staging | TODO | Pre-release testing | Fake / anonymised | TODO |
| TODO: Production | TODO | Real customers | Real | TODO |

## Differences between staging and production

TODO: List every way staging differs from production (smaller instances, disabled integrations, different feature flags). Bugs that "only happen in prod" usually come from one of these.

## Configuration

TODO: Where is each environment's configuration kept (env files, parameter store, a config repo)? How do you change a value safely? Link to [Secrets management](/access/secrets-management/) for anything sensitive.
