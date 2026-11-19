---
title: Orbit Hub
description: One MCP connector in front of my apps, with one sign-in and per-app permissions, using token exchange instead of passing tokens through.
owner: Kar6677thik
sidebar:
  order: 4
---

## What it does

The Hub is one MCP connector in front of my apps. I add it once, sign in once through [Orbit Identity](/services/orbit-identity/), and reach every app it serves, instead of adding and signing in to a separate connector per app.

- **Milestone 1 (live):** the Hub serves [Hey Ann](/services/hey-ann/).
- **Milestone 2 (next):** [Slate](/services/slate/), [Sprawl](/services/sprawl/) and [Socrates](/services/socrates/) join, with a measured choice of how many tools to show at once.
- **Later:** cross-app prompts (a Slate note becomes Socrates questions, Socrates weak areas become Hey Ann cards), and a public, path-limited route so claude.ai and ChatGPT can use it too.

Each app's own connector keeps working. The Hub is the main way in; the per-app connectors are the fallback.

**If it's down:** AI clients connected through the Hub lose all its apps at once (I accepted that single point of failure in return for one connector). The apps themselves and their own connectors are unaffected.

## At a glance

| | |
| --- | --- |
| Code | orbit-cloud (private repo); design notes in its `docs/17-orbit-hub.md` |
| Stack | Node with TypeScript and the official MCP SDK, used as both MCP server (to clients) and MCP client (to the apps) |
| Runs on | Megatron, its own namespace, one stateless pod; default-deny networking that allows only what it needs |
| State | none: no volume, nothing to back up. Tool lists are cached in memory |
| Reached at | tailnet only for now (`https://<hub-url>`, see the private notes) |
| Health | a readiness endpoint, probed every minute; an outage shows as an alert in Orbit |

## How sign-in works

1. **One sign-in, one consent page.** The client (for example Claude Code) signs in to Orbit Identity once. The consent page lists permissions **grouped by app**. Read and write are ticked by default; delete and admin permissions (`slate.delete`, `slate.admin`, `canvas.admin`) never are.
2. **The client's token is only for the Hub.** Its audience is the Hub, so no app would accept it, and the Hub never forwards it. There is no passthrough.
3. **A fresh, narrow token per app.** Before calling an app, the Hub performs an **OAuth token exchange** (RFC 8693) at Identity. It proves its own identity with a signed client assertion and asks for a token for that one app. Identity returns a short-lived token (5 minutes at most) that:
   - is addressed to that app only;
   - names me as the user;
   - carries **only the permissions I ticked for that app**, never more;
   - includes an `act` claim naming the Hub, so every app call is visibly made on my behalf by the Hub.
4. **The apps needed no changes to their sign-in.** The exchanged token looks exactly like the tokens they already accepted from their own connectors.

Token exchange is switched on for the Hub's client only. It may exchange only Hub tokens, only for the registered apps, and only for the same or fewer permissions. Every exchange is recorded in Identity's audit log.

**Revoking:** revoke the Hub connection in Orbit and new exchanges stop at once. App tokens already issued expire within 5 minutes.

## Tools, prompts and instructions

- **Names are prefixed by app:** `heyann_get_board`, `heyann_add_cards`, and later `slate_…`, `sprawl_…`, `socrates_…`. Two apps already have a tool with the same name, so the prefix keeps them apart.
- **Instructions come along.** The Hub's instructions include each app's own server instructions, under a heading per app, only for the apps my token has permissions for. That's how app-specific rules (like Hey Ann's strict screen-time wallet) reach the model.
- **Tool names in instructions and tool descriptions are rewritten** to their Hub names, mechanically: only names written in backticks are changed.
- **Tool results are never changed.** They contain my own notes and cards, and rewriting them could corrupt data. When a result mentions a tool by its plain name, the Hub's instructions tell the model which prefixed tool that means.

## Connect a client

Claude Code, on a device on my tailnet:

```sh
claude mcp add -s user --transport http orbit-hub https://<hub-url>
```

Then, in an interactive session, run `/mcp`, pick `orbit-hub` and choose **Authenticate**. The browser opens Orbit Identity's sign-in (tailnet only) and the consent page; tick what the Hub may do in each app. The real URL is in the private notes.

claude.ai, Claude Desktop and ChatGPT can't reach the Hub until the public route lands; use the per-app connectors there for now.

## Deploy

The Hub and its Identity changes live in orbit-cloud and are released by the platform operator, like Orbit Identity. Changes go through a reviewed PR; the owner merges.

## Gotchas

- **An empty tool list** means the token has no permissions for any app the Hub serves; reconnect and tick some on the consent page.
- **A new app tool doesn't appear** until the Hub refreshes that app's tool list (it does so when the app announces a change).
- **Prompts and instructions should write tool names in backticks.** Plain words are never rewritten, so a bare `search` in prose stays as it is.
- **Claude Code doesn't render MCP Apps** (like Sprawl's diagrams); it shows the text result. claude.ai and Claude Desktop will, once the public route exists.
