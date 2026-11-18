---
title: Slate
description: My Markdown library, with a web app, native clients and an MCP server, deployed by CI on every push to main.
owner: Kar6677thik
sidebar:
  order: 4
---

## What it does

Slate is a private knowledge library for one person. Notes are Markdown files kept in Git, so they're readable without Slate; attachments live outside Git. It has three parts:

- **API:** files, search (Lucene), Git commits and sync, history and device-token sign-in. The Windows and Android apps talk to it. Private.
- **Web:** a Next.js app at `lib.karthiksurkanti.in`. It reaches the API through its own proxy and has optional AI features (meaning search, Ask Slate, analyses).
- **MCP:** lets Claude and ChatGPT use the library. It keeps no data and signs in through [Orbit Identity](/services/orbit-identity/). Public at `mcp.karthiksurkanti.in/mcp`.

**If it's down:** the API being down stops everything; web or MCP alone only stops that client. The notes themselves are safe in Git and on the data volume.

## At a glance

| | |
| --- | --- |
| Repository | [Kar6677thik/slate.lib](https://github.com/Kar6677thik/slate.lib) (API, web in `slate.lib.web/`, MCP in `src/Slate.Lib.Mcp`) |
| Stack | .NET 10 (API, MCP, MAUI clients), Next.js 16 and React 19 (web) |
| Runs on | Megatron, namespaces `slate` (API), `slate-web`, `slate-mcp`; one replica each |
| Reached | web and MCP through the public tunnel; the API only on the tailnet. Nothing is exposed on the local network |
| Data | a retained volume holding the Git repository of notes, attachments and the token database |
| Health | API `/health/live` (process) and `/health/ready` (library, token database, writable storage); web `/api/health`; MCP `/health/live` |
| Logs | `kubectl -n <namespace> logs deploy/<name>` |
| Alerts | none |

## Dependencies

| Depends on | For | If it's down |
| --- | --- | --- |
| Orbit Identity | MCP sign-in | AI clients can't connect once their tokens expire |
| A Git remote (deploy key) | Off-site copy of the notes | Sync stops; notes stay safe locally |
| GHCR (pull credential in the cluster) | Images | New deploys fail; running pods are fine |
| An OpenAI-compatible endpoint (optional) | Web AI features | Web falls back to keyword search |
| The Cloudflare tunnel | Public web and MCP | Those sites are unreachable |

## Run it locally

```sh
dotnet restore slate.lib.sln && dotnet build slate.lib.sln --no-restore
dotnet run --project src/Slate.Lib.Api --no-build --no-launch-profile -- --initialize-library   # first time only
dotnet run --project src/Slate.Lib.Api --no-build --no-launch-profile -- --initialize-git       # first time only
dotnet run --project src/Slate.Lib.Api --no-build --no-launch-profile

cd slate.lib.web && pnpm install --frozen-lockfile && pnpm dev      # web at localhost:3000
```

## Deploy

Automatic, by `.github/workflows/main.yml` on every push to `main`:

1. Pull requests and pushes run the builds and tests: Windows, MCP, web checks and Playwright end-to-end tests.
2. A plan step looks at what changed and deploys only that: the API and web together, the MCP, or both.
3. Images are pushed to GHCR, tagged with the commit SHA.
4. The runner joins the tailnet, copies a small bundle to Megatron and runs a root-owned deploy script for each part. The API's manifests come from the repo (`deploy/k3s`). **Web and MCP are rendered from templates that live only on the server**, so their config is not in the repo.

**Changing web or MCP config:** a change made only in the repo is lost on the next deploy. Edit the server-side template too (back it up first), then apply the same change live or wait for the next deploy. The step-by-step procedure is in [Deployment → Slate](/operations/deployment/#slate).

### Verify

```sh
curl -s https://lib.karthiksurkanti.in/api/health                                # web is up
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' https://mcp.karthiksurkanti.in/mcp   # expect 401
```

### Roll back

Set the Deployment back to the previous SHA-tagged image (`kubectl set image`, then `rollout status`). This never touches the data. If a stored format changed, scale to zero and restore the matching backup first. MCP keeps no state, so the image alone is enough.

## MCP

About 50 tools in five groups (read and search, analysis and learning, writes, comments, organising) and four prompts. Scopes: `slate.read`, `slate.analyze`, `slate.write`, `slate.organize`, `slate.delete`, `slate.admin`. Delete and admin are never pre-ticked on the consent screen, and deletes are switched off in config.

## Backups

Notes are committed after 30 quiet seconds and pushed to the Git remote, so the notes themselves have an off-site copy. Attachments and the token database don't yet: an off-host encrypted backup for Slate is being written. TODO: update this once it lands (see [Backups & restore](/operations/backups-and-restore/)).

## Gotchas

- **Signed in but no access:** a 401 saying "user is not approved" means the allowed-subject list doesn't match. An HTTP 200 with an empty tool list means the token has no Slate scopes.
- **Pods don't see changed secrets** until they restart.
- **Never edit notes in the server's checkout.** Edit another clone, push, then Sync. A diverged history stops sync and has to be fixed in a separate clone.
- **Two Slate processes must never share one data folder.** The API runs one replica with `Recreate` for that reason.
- The search index is disposable and is rebuilt after a restore.
