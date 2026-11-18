---
title: AnythingTCG
description: A self-hosted server for my trading-card game app, with Postgres, deployed by hand. Still in progress.
owner: Kar6677thik
sidebar:
  order: 8
---

## What it does

AnythingTCG lets people create their own trading-card game: import artwork, configure rarities and packs, and keep the cards they discover. Local games run entirely offline in the app. A community game connects to a hosted server through one base URL; one server hosts one community and one game, and new accounts need an invitation by default.

**Status: in progress.** Collection, economy and social features are being built; battles are on hold. The current client is a Flutter Android app.

**If it's down:** community players can't open packs or sync. Local games keep working.

## At a glance

| | |
| --- | --- |
| Repository | AnythingTCG (private) |
| Stack | ASP.NET Core on .NET 10, PostgreSQL 18; Flutter Android client |
| Runs on | Megatron, namespace `anythingtcg`: the server (1 replica, `Recreate`) on the stock ASP.NET image with the app files supplied from the server, and a Postgres StatefulSet |
| Data | Postgres: accounts, card catalog revisions, pack openings, inventory, economy and social data. An assets volume: images and audio, stored by content hash |
| Health | `/health/live`, `/health/ready` (database and community set up); discovery document at `/.well-known/anythingtcg` |
| How it's reached | in the private notes |
| Alerts | none |

## Dependencies

Only Postgres. No Redis, message broker or identity provider. Network policies allow only the server-to-database and DNS traffic.

## Run it locally

Install the .NET SDK version in `global.json` and PostgreSQL, and set the database connection string, the server's canonical URL, the asset path and the bootstrap credentials. Then:

```sh
Server__Migrate=true dotnet run --project apps/server -- --migrate-only
dotnet run --project apps/server
dotnet run --project apps/server.tests
```

Android client: `cd apps/mobile && flutter build apk --release --target-platform android-arm64`.

## Deploy

By hand, with the repo's `deploy/k3s/deploy.sh`:

1. On the PC, publish the server for Linux (`dotnet publish -r linux-x64`) and copy the published files to the server.
2. On Megatron, run `deploy.sh` with the public URL set. It refuses to run if the server files are missing.
3. First run only: it creates the namespace and generates random database and owner passwords into a Secret, without printing them.
4. It fills in the manifest, applies it, restarts the server so the new files load, and waits for the rollout.

At startup an init container applies database migrations; the server refuses to start with pending migrations.

**There is no rollback.** Migrations only go forward on purpose. Going back means restoring the database and assets backup together with the matching old build.

## Backups

TODO: none for the k3s setup yet. The repo documents only a Compose-style backup (stop the server, `pg_dump -Fc`, archive the assets volume, keep the pair together). An off-host backup is planned with the platform work; see [Backups & restore](/operations/backups-and-restore/).

## Gotchas

- **Never recreate the database:** the server and game IDs are created once and stored there, so a new database is a different community.
- **Keep old assets:** past pack openings point to past card definitions. Retire card and variant IDs; never delete them.
- **Bootstrap credentials only create the first owner;** password resets use the server's `--reset-password` command.
- **Losing the Android signing key** forces players to uninstall the app and lose their local games.
- The README still mostly describes the old desktop client; the deploy is documented only in `deploy.sh` and the manifest.
