---
title: Disaster recovery
description: How to rebuild everything if a region, account, or provider is lost.
sidebar:
  order: 6
---

Read this before you need it. During a disaster you won't have time to work it out.

## Targets

- **RTO** (how long we can be down): TODO
- **RPO** (how much data we can lose): TODO

## Scenarios

### Cloud region outage

TODO: Do we fail over to another region, or wait? Who makes that call? What are the steps?

### Cloud account lost or compromised

TODO: Where are the off-account backups? How do we rebuild from infrastructure-as-code into a new account?

### Code host unavailable

Every developer's clone is a full copy of each repository. TODO: list who has full clones of what, and where any mirror is.

### Key person unavailable

TODO: Which knowledge or access does only one person have? Fix each case: write it down here, or give access to a second person.

## Offline copy of these docs

Keep a recent build of this site where you can reach it during an outage:

```sh
npm run build
# copy dist/ to a laptop / USB / a second hosting provider
npx serve dist
```

## Drills

| Date | Scenario | What went wrong | Follow-ups |
| --- | --- | --- | --- |
| TODO | | | |
