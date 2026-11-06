---
title: Backups & restore
description: What is backed up, where, for how long, and exactly how to restore it.
sidebar:
  order: 5
---

A backup you have never restored can't be trusted. Test it on a schedule.

## What is backed up

| Data | Method | Frequency | Kept for | Stored in | Encrypted? |
| --- | --- | --- | --- | --- | --- |
| TODO: Postgres `main` | e.g. automated snapshots + point-in-time recovery | Daily / continuous | TODO days | TODO | TODO |
| TODO: Object storage | e.g. versioning + replication | | | | |
| TODO: Secrets vault | | | | | |
| These docs | git; every clone is a full copy | Every commit | Forever | Code host + laptops | n/a |

## What is NOT backed up

TODO: List it here, so nobody assumes otherwise.

## Restore the database

```sh
# TODO: exact steps. Restore to a NEW instance first, check it, then switch over.
```

**Expected time:** TODO. **Data loss window:** up to TODO minutes.

## Test a restore

Do this monthly. See [Recurring tasks](/operations/recurring-tasks/).

1. Restore the latest backup to a temporary instance.
2. Check that recent rows exist: TODO: example query.
3. Record the date and how long it took below, then delete the temporary instance.

| Date | Who | Duration | Result |
| --- | --- | --- | --- |
| TODO | | | |
