---
title: Orbit Hub
description: One MCP connector in front of my apps, with one sign-in and per-app permissions, using token exchange instead of passing tokens through.
owner: Kar6677thik
sidebar:
  order: 4
---

## What it does

The Hub is one MCP connector in front of my apps. I add it once, sign in once through [Orbit Identity](/services/orbit-identity/), and reach every app it serves, instead of adding and signing in to a separate connector per app.

- **Live:** all four apps sit behind the Hub: [Slate](/services/slate/), [Sprawl](/services/sprawl/), [Socrates](/services/socrates/) and [Hey Ann](/services/hey-ann/). It shows a curated core of tools per app plus discovery tools for the rest, and offers four cross-app prompts (below).
- **Still to come:** study rewards pushed directly from Socrates to Hey Ann (never relayed by the model), and a public, path-limited route so claude.ai and ChatGPT can use the Hub too.

Each app's own connector keeps working. The Hub is the main way in; the per-app connectors are the fallback.

**If it's down:** AI clients connected through the Hub lose all its apps at once (I accepted that single point of failure in return for one connector). The apps themselves and their own connectors are unaffected.

## At a glance

| | |
| --- | --- |
| Code | orbit-cloud (private repo); design notes in its `docs/17-orbit-hub.md` |
| Stack | Node with TypeScript and the official MCP SDK, used as both MCP server (to clients) and MCP client (to the apps). It reaches the apps inside the cluster, not over the internet |
| Runs on | Megatron, its own namespace, one stateless pod; default-deny networking that allows only what it needs |
| State | none: no volume, nothing to back up. Tool lists are cached in memory |
| Reached at | tailnet only for now (`https://<hub-url>`, see the private notes) |
| Health | a readiness endpoint, probed every minute; an outage (two failed probes in a row) raises an alert in Orbit |

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

- **Names are prefixed by app:** `slate_…`, `sprawl_…`, `socrates_…`, `heyann_…` (for example `heyann_add_cards`, `slate_search_notes`). Two apps have a tool with the same name, so the prefix keeps them apart.
- **A curated core, plus discovery.** Listing every tool from all four apps would cost a lot of context in every request and make tool choice worse. So by default the Hub lists each app's **core** tools (picked per app, about nine each) plus three discovery tools:
  - `hub_find_tools` searches every tool the token allows;
  - `hub_enable` adds an app's or a toolset's tools to the list (the client is told the list changed);
  - `hub_call` calls any allowed tool directly, for clients that ignore list changes.

  This default was kept after a measurement: the same tool-choice accuracy as listing everything, at about **39% of the context**. A single setting switches back to listing everything.
- **Prompts.** Each app's own prompts are offered with the same prefix. The Hub adds four cross-app prompts, built only from tools the token allows:
  - **note to questions:** a Slate note becomes Socrates questions that link back to it;
  - **weak areas to cards:** Socrates' weak areas become Hey Ann cards, without duplicates;
  - **canvas and note links:** a Sprawl card and a Slate note get linked both ways;
  - **open-question review:** Sprawl's open questions are routed and answered.
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
- **A tool isn't in the list:** it's probably outside the core. Ask the model to find it with `hub_find_tools` and turn it on with `hub_enable`, or call it through `hub_call`.
- **A new app tool doesn't appear** until the Hub refreshes that app's tool list (it does so when the app announces a change).
- **Prompts and instructions should write tool names in backticks.** Plain words are never rewritten, so a bare `search` in prose stays as it is.
- **Claude Code doesn't render MCP Apps** (like Sprawl's diagrams); it shows the text result. claude.ai and Claude Desktop will, once the public route exists.
