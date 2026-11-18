---
title: Sprawl
description: My infinite canvas, one per topic, mostly written by Claude through MCP, with every change in a revertible log.
owner: Kar6677thik
sidebar:
  order: 5
---

## What it does

Sprawl is a minimalist infinite canvas, one per topic, that keeps growing. Each canvas is regions of cards (ideas, notes, open questions, links, code) joined by labelled connections. Claude adds most of the content through MCP; I edit in the UI. Every change goes into an append-only log, so any canvas can be replayed or reverted to any version, and undo never rewrites history.

Two parts:

- **API and web:** one process that serves the canvas UI, the API and SQLite. Private (tailnet only).
- **MCP:** a stateless MCP server that reads and writes through the API's separate device listener. Public at `canvas-mcp.karthiksurkanti.in/mcp`, signed in through [Orbit Identity](/services/orbit-identity/). It is an Orbit catalog app.

**If it's down:** API down stops both the UI and the MCP; MCP down only stops AI clients.

## At a glance

| | |
| --- | --- |
| Repository | [Kar6677thik/Sprawl](https://github.com/Kar6677thik/Sprawl) |
| Stack | .NET 10, SQLite with FTS5, React 19 with React Flow and ELK, MCP SDK |
| Runs on | Megatron: API in namespace `sprawl` (1 replica, `Recreate`); MCP in `app-sprawl-mcp` |
| Data | one SQLite database on a volume: canvases, regions, cards, connections and the change log |
| Health | `/health/live` and `/health/ready` on both (the MCP's are not reachable publicly) |
| Alerts | none |

## Dependencies

| Depends on | For | If it's down |
| --- | --- | --- |
| Orbit Identity | MCP sign-in | AI clients can't connect once tokens expire |
| The API's device listener | Everything the MCP does | MCP readiness fails; tools error |
| Orbit catalog | Releasing the MCP | No new MCP versions |
| GHCR (public images) | Images | New deploys fail |

## Run it locally

On Windows, from a clone (needs .NET SDK 10 and Node 24):

```powershell
./scripts/build-local.ps1
./scripts/start-local.ps1      # seeds a sample canvas and starts API + MCP
```

Use **Development sign-in** in the browser (loopback only). Tests: `dotnet test Sprawl.slnx -c Release`, then `npm test` in `src/Sprawl.Web`.

## Deploy

- **API:** `release.yml` runs on every push to `main`. It rebuilds only the images whose inputs changed, runs all tests, publishes to public GHCR with attestations, and, only when the repo variable `SPRAWL_DEPLOY` is `true`, updates the `sprawl` Deployment's image. It joins the tailnet per run through GitHub OIDC (no stored Tailscale secret) and uses a service account that can only update that one Deployment.
- **MCP:** never deployed by Sprawl's CI. A new digest goes into the catalog spec in orbit-cloud and is released the usual way: [Catalog apps](/operations/catalog-apps/).

### Verify

```sh
curl -s https://canvas-mcp.karthiksurkanti.in/.well-known/oauth-protected-resource      # JSON, resource = the /mcp URL
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' https://canvas-mcp.karthiksurkanti.in/mcp   # expect 401
```

### Roll back

Before an upgrade, use **Ctrl+K → Back up now** in the UI. If the API misbehaves, apply the previous image digest; if data must go back too, restore from backup (below). For the MCP, revert the catalog spec and release it.

## MCP

23 tools (read, write, organise and diagram) and 13 prompts, plus an MCP App that renders diagrams inside Claude. Scopes: `canvas.read`, `canvas.write`, `canvas.organize`, `canvas.admin`. Each tool needs its own scope; admin doesn't imply the others. Grant read, write and organise, and leave admin (deletes) off unless you want Claude to delete.

## Backups and restore

Two layers:

1. Every day the API writes a consistent copy of the database while it keeps running, integrity-checks it and keeps a rolling set on the volume.
2. Those copies are shipped to an encrypted repository off the machine. The details are in the private notes.

**Restore:** scale the API to zero, apply the repo's restore Job (newest copy by default; an earlier one can be chosen), wait for it, then scale back to one. The current database is moved aside, never deleted. See [Backups & restore](/operations/backups-and-restore/).

## Gotchas

- **Any API restart signs me out:** cookie keys live only in memory, by design. `Recreate` also means a few seconds of downtime.
- **The catalog only accepts upper-case env names,** so the MCP spec uses names like `MCP__APIBASEURL`. .NET config is case-insensitive, so they still bind.
- **The Tailscale OIDC trust must use GitHub's immutable subject form;** the plain `repo:owner/name` form fails with 403.
- **Deleting the `sprawl` namespace deletes the database.** Back up first.
- **The images must stay public:** neither namespace has a pull credential.
