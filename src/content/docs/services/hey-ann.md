---
title: Hey Ann
description: My Kanban board that Claude and ChatGPT run through MCP, with undo for every change and a screen-time wallet.
owner: Kar6677thik
sidebar:
  order: 7
---

## What it does

A personal Kanban board that Claude and ChatGPT run for me. A message that starts "Hey Ann, …" turns a brain dump into cards (dates read in my time zone, likely duplicates flagged instead of created), applies status updates, plans the day, triages and writes standup, daily and weekly summaries. Every change is a batch that can be undone, from the board or from chat.

The board itself has columns from Backlog to Done, WIP limits, swimlanes, a focus timer, recurring cards, checklists, projects and live updates. A **screen-time wallet** earns minutes when focused work reaches Done; a companion Android app blocks chosen apps when the balance is empty.

- **Board:** private (tailnet only), password sign-in remembered per device.
- **MCP:** public at `heyann-mcp.karthiksurkanti.in/mcp`, signed in through [Orbit Identity](/services/orbit-identity/).

## At a glance

| | |
| --- | --- |
| Repository | [Kar6677thik/Hey_Ann](https://github.com/Kar6677thik/Hey_Ann) |
| Stack | TypeScript on Node 24, Hono, MCP SDK, `node:sqlite` with FTS5; React 19, Vite and Tailwind UI; an Android companion app |
| Runs on | Megatron, namespace `heyann`, Deployment `heyann` (1 replica, `Recreate`). Not a catalog app: a hand-reviewed namespace |
| Data | one SQLite database on a volume: cards, undo history, wallet ledger, paired phones, sessions (stored as hashes) |
| Health | `/health/live`; `/health/ready` (503 if not ready) |
| Alerts | an uptime probe on the health endpoint is part of the deploy plan; TODO: confirm it alerts |

## Run it locally

```sh
npm install
npm run seed      # optional: a realistic board with 3 weeks of history
npm start         # http://localhost:4321 (MCP at /mcp; Settings → Connect AI shows the token)
npm test
```

## Deploy

The same procedure as [Socrates](/services/socrates/#deploy), by hand from the PC:

1. `docker build --platform linux/amd64 -t ghcr.io/kar6677thik/hey-ann:candidate .` (fails if typecheck or tests fail), save to a tar, copy it to Megatron with `deploy/import-image.sh`.
2. Import with `sudo` on Megatron and **note the digest it prints**.
3. First time only: `npm run password -- ./.owner` writes the password verifier (16+ characters); create the Secret from it and shred the local copy. Create the ConfigMap with Orbit Identity's public keys.
4. Put the digest into `deploy/heyann.yaml`, then `kubectl apply --dry-run=server`, `kubectl apply`, and `kubectl -n heyann rollout status deploy/heyann`. Open browser tabs reconnect on their own.

### Verify

```sh
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' https://heyann-mcp.karthiksurkanti.in/mcp   # expect 401
```

## Config

Environment variables prefixed `HEYANN_` (public origin, allowed hosts, trusted proxy, MCP origin, OAuth issuer, resource, allowed subjects and clients, data folder, and the starting time zone, which Settings can override). The password verifier and the off-host backup credentials come from Secrets.

## MCP

16 tools. Read: `get_board`, `find_cards`, `get_card`, `whats_next`, `summary`, `triage`, `insights`, `history`, `ann_guide`. Write: `add_cards`, `update_cards`, `archive_cards` (soft delete, needs `confirm=true`), `focus`, `plan_day`, `undo`, `configure_board`. Scopes: `heyann.read` and `heyann.write`.

**Link a client:**

- **Claude:** Settings → Connectors → Add custom connector, named "Hey Ann", with the MCP URL. Leave the OAuth client fields empty; consent on Orbit Identity from a tailnet device.
- **ChatGPT:** Settings → Apps & Connectors → Advanced → Developer mode → Create, choose OAuth, then enable it per chat.
- **Claude Code:** `claude mcp add --transport http hey-ann https://heyann-mcp.karthiksurkanti.in/mcp`

Paste the trigger snippet from the repo's `docs/SETUP-CLIENTS.md` into your custom instructions so "Hey Ann" fires reliably.

## Backups and restore

- **In the app:** a verified copy every day, 14 kept, plus one before every schema upgrade; Settings → Data → *Back up now* on demand.
- **Off the machine:** an encrypted copy of those backups. Details in the private notes.

**Restore:** the same as Socrates: scale to 0, replace the database with the chosen copy (in-app) or apply `deploy/restore.yaml` (off-host), then scale to 1. The current database is moved aside, never deleted.

## Gotchas

- **No authenticator code;** the tailnet is the first factor. Use a long password separate from the other apps'. Settings → *Sign out everywhere* revokes all devices.
- **Ambiguous card references:** Ann changes nothing and asks which card you meant.
- **Voice mode** is unreliable with custom connectors; type or dictate into the text box instead.
- **The wallet ledger sits outside board undo,** and wallet rule changes take effect next Monday.
- Same rules as Socrates for Identity key rotation, the import digest and one replica.
