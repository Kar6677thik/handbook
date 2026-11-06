---
title: Deployment
description: How to deploy each service, check that it worked, and roll back.
sidebar:
  order: 3
---

## Before you deploy

- [ ] CI is green on the commit you're deploying.
- [ ] You know how to roll back (below).
- [ ] You've told TODO: channel what you're deploying.
- [ ] Avoid deploying TODO: e.g. late on a Friday, or during peak hours.

## Deploy

TODO: Exact commands or button-clicks for each service. If it's automated through CI, say what triggers it and where to watch progress.

```sh
# TODO
```

## Verify

- [ ] TODO: health check URL returns OK
- [ ] TODO: error rate on the dashboard hasn't risen
- [ ] TODO: click through the main flow

## Rollback

TODO: The fastest safe way back to the previous version, as exact commands. Test this before you need it.

```sh
# TODO
```

**When a database migration is involved:** TODO: can the previous version run against the migrated schema? If not, what do you do?
