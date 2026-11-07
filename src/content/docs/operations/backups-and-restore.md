---
title: Backups & restore
description: What is backed up, where, for how long, and exactly how to restore it.
owner: Kar6677thik
sidebar:
  order: 5
---

:::danger[There are no automatic backups]
As of 6 Nov 2026 nothing on Megatron is backed up on a schedule: no timers, no cron jobs, no snapshots. If Megatron's disk died today, the data marked **lost** below would be gone.
:::

A backup you have never restored can't be trusted. Test it on a schedule.

## What is backed up

| Data | Method | Frequency | Kept for | Stored in | Encrypted? |
| --- | --- | --- | --- | --- | --- |
| Orbit owner password verifier and authenticator key | copied by hand | once | until replaced | owner's Google Drive (and password manager for the authenticator key) | Drive account only |
| Orbit Identity keys | copied by hand at install | once (3 Nov 2026) | until replaced | owner's Google Drive | Drive account only |
| Tunnel config | dated copies on each edit | each change | forever | **same disk**, next to the config | no |
| Slate templates | dated copies on each edit | each change | forever | **same disk**, next to the templates | no |
| A one-off pre-install backup (k3s datastore, server token, Slate data and config, per the install record) | 7-Zip archive made by hand | once, 29 Oct 2026 | until deleted | **owner's laptop only** (location in the private notes). Not off-site unless the owner also copied it: TODO confirm | TODO confirm |
| App images | GHCR | every build | per GHCR retention | GitHub | n/a |
| All code, catalog specs, manifests in repos | git | every commit | forever | GitHub and clones | n/a |
| These docs | git; every clone is a full copy | every commit | forever | GitHub and laptops | n/a |

That archive predates Orbit Identity, Sprawl and the handbook, so nothing created since 29 Oct 2026 is in it, and it lives on a single laptop.

## What is NOT backed up

| Data | Where it lives | If lost |
| --- | --- | --- |
| Sprawl canvases | a volume on Megatron | **every canvas is gone** |
| Orbit Identity database (linked apps, consents, audit log) | a volume on Megatron | every AI app has to re-link; audit history gone |
| AnythingTCG data | volumes on Megatron | gone |
| Slate notes | Slate's data folder on Megatron | gone, **unless** Slate's git sync pushes them to a remote. TODO: check |
| The k3s datastore | on Megatron | the whole cluster state; rebuild from repos and by hand |
| Every Kubernetes Secret | in the k3s datastore | recreate each from its source (see [Secrets management](/access/secrets-management/)) |
| Tunnel credentials and config | on Megatron | recreate the tunnel in Cloudflare and rewrite the rules from the private notes |
| Slate's root-owned deploy scripts and templates | on Megatron | partial copies in the slate repos; the rest from the private notes |
| Tailscale `serve` setup | on Megatron | redo from the private notes |

All of these sit on Megatron's single disk.

## If Megatron died today

**Recoverable** from GitHub and Drive: every image, every catalog spec and manifest, Orbit and Identity credentials. **Lost:** everything in the table above. Rebuilding means: install Linux and k3s, install and set up Tailscale, recreate the tunnel, recreate each Secret from its source, reinstall Orbit and Identity (`deploy/INSTALL.md`, `deploy/identity/INSTALL.md`), re-apply the catalog admission policy and onboard each catalog app, rerun the Slate and Sprawl CI deploys, and rebuild Slate's host scripts. TODO: write this as a runbook in [Disaster recovery](/operations/disaster-recovery/).

## Restore the database

TODO: nothing to restore from yet. Once backups exist, write the exact steps for each of: Sprawl PVC, Identity PVC, AnythingTCG Postgres, Slate data, k3s datastore. Restore to a new location first, check it, then switch over.

**Expected time:** TODO. **Data loss window:** today, everything since the app was installed.

## Proposed first backups

Not decided yet; listed so the decision is easy to make.

1. A nightly job on Megatron that copies the app volumes, Slate's data, the k3s datastore and the tunnel config into an encrypted archive, then uploads it off the machine (for example Google Drive with rclone). The datastore is k3s's embedded SQLite, not etcd, so `k3s etcd-snapshot` doesn't apply: stop k3s or use `sqlite3 … ".backup …"` for a consistent copy, never copy the live file mid-write. Exact paths go in the private notes.
2. A monthly restore test (below).

## Test a restore

Do this monthly once backups exist. See [Recurring tasks](/operations/recurring-tasks/).

1. Restore the latest backup to a temporary location.
2. Check recent data: open the newest Sprawl canvas, list Identity's linked apps, open a recent Slate note.
3. Record the date and how long it took below, then delete the temporary copy.

| Date | Who | Duration | Result |
| --- | --- | --- | --- |
| TODO | | | |
