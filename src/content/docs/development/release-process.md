---
title: Release process
description: How a change gets from a branch to production.
sidebar:
  order: 4
---

## The path of a change

1. Branch from `TODO: main`.
2. Open a pull request. TODO: who reviews, how many approvals?
3. CI passes. See [Testing](/development/testing/).
4. Merge. TODO: does merging deploy automatically, or is it manual?
5. Deploy to staging, check, then deploy to production. See [Deployment](/operations/deployment/).

## Versioning & changelog

TODO: How releases are numbered and tagged, and where release notes go.

## Database migrations

TODO: When migrations run, how to write ones that are backward compatible, and how to roll one back.

## Feature flags

TODO: Where flags are managed and how to turn a feature off without deploying.
