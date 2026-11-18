---
title: Socrates
description: My spaced-repetition quiz platform, where Claude or ChatGPT writes questions and grades answers through MCP.
owner: Kar6677thik
sidebar:
  order: 6
---

## What it does

A personal quiz platform with spaced repetition (FSRS-6, fitted to my own review history) and a per-tag mastery model. Claude or ChatGPT writes questions, grades written answers and targets weak spots through MCP. Agent-written questions start as drafts I approve, every agent write is logged, and most can be undone.

Many question types: multiple choice, cloze, numeric, matching, ordering, written and essay (rubric graded), JavaScript code with tests in a sandbox, image hotspots and flashcards. It imports from Anki, CSV/TSV, Markdown and its own JSON. It can also generate questions from Slate notes or Sprawl cards.

- **UI and API:** private (tailnet only), password and authenticator code.
- **MCP:** public at `socrates-mcp.karthiksurkanti.in/mcp`, signed in through [Orbit Identity](/services/orbit-identity/).

## At a glance

| | |
| --- | --- |
| Repository | [Kar6677thik/socrates](https://github.com/Kar6677thik/socrates) |
| Stack | TypeScript on Node 24 (no build step for the server), Hono, MCP SDK, SQLite, a local embedding model; React 19 and Vite UI |
| Runs on | Megatron, namespace `socrates`, Deployment `socrates` (1 replica, `Recreate`). Not a catalog app: a hand-reviewed namespace |
| Data | one SQLite database and a media folder on a volume |
| Health | `/health/live`; `/health/ready` (503 if the database check fails) |
| Alerts | monitored every minute; an outage shows as an alert in the Orbit console. Nothing sends a notification yet |

## Run it locally

```sh
npm install
npm start          # builds the UI on first run, serves at http://localhost:4321
npm run seed       # optional sample questions
npm test && npm run typecheck
```

Locally there's no login and it listens on localhost only.

## Deploy

By hand from the PC; there's no CI.

1. Build: `docker build --platform linux/amd64 -t ghcr.io/kar6677thik/socrates:candidate .` (the build fails if typecheck or tests fail), then `docker save` it to a tar and copy it with `deploy/import-image.sh` to Megatron.
2. On Megatron, run the import script with `sudo`. **Use the digest it prints**; the one `docker build` showed won't resolve.
3. First time only: create the owner sign-in Secret with `node --no-warnings scripts/credentials.ts ./.owner` (password verifier plus authenticator secret; shred the local copy after), and the ConfigMap holding Orbit Identity's public keys.
4. Put the digest into `deploy/socrates.yaml`, then `kubectl apply --dry-run=server`, `kubectl apply`, and `kubectl -n socrates rollout status deploy/socrates`.

### Verify

```sh
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' https://socrates-mcp.karthiksurkanti.in/mcp   # expect 401
```

A token without Socrates scopes gets 403 `insufficient_scope`; too many requests get 429.

## Config

Environment variables prefixed `SOCRATES_` (public origin, allowed hosts, trusted proxy, MCP origin, OAuth issuer, resource, allowed subjects and clients, data and model folders), plus `TZ`: the study day rolls over at 04:00 local time. The sign-in files and the off-host backup credentials come from Secrets. The app refuses to start on unsafe or incomplete settings.

## MCP

22 tools and 3 prompts, in groups: tags, questions (bulk add with dry run, duplicate checks, search, update, upload image), grading, performance (weak areas, recommendations, study tasks) and sessions. Scopes: `socrates.read` and `socrates.write`; no tool hard-deletes, so there's no admin scope.

**Link a client:** Claude → Settings → Connectors → Add custom connector with `https://socrates-mcp.karthiksurkanti.in/mcp`, then sign in and consent on Orbit Identity from a tailnet device. Revoking the grant in Orbit cuts access.

## Backups and restore

- **In the app:** a verified copy every day, 14 kept, plus one before every schema upgrade. Settings → Data can also back up now or export everything.
- **Off the machine:** those copies and the media are shipped to an encrypted repository. Details in the private notes.

**Restore from an in-app copy:** scale to 0, replace the database file on the volume with the chosen copy, scale to 1. **From off-host:** scale to 0, apply `deploy/restore.yaml` (newest copy by default), check the Job's logs, delete the Job, scale to 1. The current database is moved aside, never deleted.

## Gotchas

- **A restart signs me out** (sessions are in memory). Use a password separate from Orbit's and Sprawl's.
- **The pod has no network access.** The embedding model is built into the image and Identity's keys are a mounted file. When Identity's signing key is rotated, refresh that file and restart **before** the new key starts signing.
- **One writer only:** keep 1 replica and `Recreate`.
- Without `TZ`, the study day rolls over in UTC.
