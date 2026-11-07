---
title: Automation inventory
description: Every task AI tooling used to do for us, and the manual procedure that replaces it.
owner: Kar6677thik
sidebar:
  order: 1
---

This may be the most important page here. AI agents and assistants used to handle many tasks quietly, so nobody noticed them happening. Now that those tools are gone, the tasks don't happen at all unless a person does them, and the failures often show up weeks later.

## How to fill this in

Work through each source below and list everything the AI tooling did:

- Agent configs, prompts, and scheduled jobs (look for `AGENTS.md`, `CLAUDE.md`, `.cursor/`, `.github/workflows/`, cron entries, and AI-provider API keys in the secrets store).
- Billing records from AI providers: whatever was calling the API was doing *something*.
- Bot accounts in GitHub, Slack, ticketing tools, and the cloud console. Look through their activity history.
- Ask everyone: "What used to just happen?"

## What actually runs by itself

Only three things are scheduled or triggered without a person. Everything else below happened because an AI agent was asked to do it.

| Automation | Trigger | Where it's defined |
| --- | --- | --- |
| Handbook auto-updater | every 5 minutes | `deploy/updater/handbook.yaml` in orbit-cloud ([Catalog apps](/operations/catalog-apps/#automatic-updates-the-updater)) |
| Slate build and deploy | push to slate.lib `main` | slate.lib `.github/workflows/main.yml` ([Deployment → Slate](/operations/deployment/#slate)) |
| Sprawl build and API deploy | Sprawl release, if `SPRAWL_DEPLOY` is `true` | Sprawl `.github/workflows/release.yml` ([Deployment → Sprawl API](/operations/deployment/#sprawl-api)) |

## Inventory

Recorded from the Orbit Cloud agent's own log, 6 Nov 2026. "On demand" means it happened whenever the owner asked, typically several times a week.

| Task | Used to be done by | How often | What breaks if skipped | Now done by | Procedure |
| --- | --- | --- | --- | --- | --- |
| Release a new version of a catalog app (Sprawl MCP): verify attestation, open spec PR, wait for CI, build bundle, check it, mint token, open tunnel, deploy, clean up, acceptance checks | Orbit Cloud agent (owner merged the PR) | about 10 times on 5–6 Nov 2026; on demand | New Sprawl MCP versions never reach production | owner, about 15 minutes each | [Catalog apps → Release](/operations/catalog-apps/#release-a-new-version) |
| Onboard a new app into the catalog (`sprawl-mcp` 5 Nov, `handbook` 6 Nov) | Orbit Cloud agent | on demand | New apps can't be hosted | owner | [Catalog apps → Onboard](/operations/catalog-apps/#onboard-a-new-app) |
| Add a public hostname: tunnel rule, restart, DNS record (`auth` 3 Nov, `canvas-mcp` 5 Nov, `book` 6 Nov) | Orbit Cloud agent | on demand | New sites unreachable | owner | [Catalog apps → Make an app public](/operations/catalog-apps/#make-an-app-public) |
| Write and install the handbook auto-updater, run its first cycle | Orbit Cloud agent | once (6 Nov) | n/a, done; copy it for other apps | owner | [Catalog apps → Updater](/operations/catalog-apps/#automatic-updates-the-updater) |
| Build, install and change Orbit Identity (install 3 Nov, Slate MCP cutover from Auth0, second resource for Sprawl 5 Nov) | Orbit Cloud agent, owner typed sudo | on demand | MCP sign-in changes impossible | owner | [Orbit Identity](/services/orbit-identity/), orbit-cloud `deploy/identity/INSTALL.md` |
| Edit Slate's root-owned templates on Megatron (Slate MCP `Mcp__WebAppUrl`, slate-web intelligence secret, 6 Nov), with backup, live ConfigMap patch and restart | Orbit Cloud agent, owner typed sudo | on demand | Slate config changes silently lost on next deploy | owner | [Deployment → Slate](/operations/deployment/#slate) |
| Fix Orbit's own tooling (e.g. bundle picked the wrong previous spec, PR #8) | Orbit Cloud agent | on demand | Releases refused | owner (developer) | orbit-cloud repo and its tests |
| Merge PRs | Orbit Cloud agent, only for PRs the owner explicitly named (#17 and #18 with permission relayed through another thread, #19 and #20 through the Handbook thread) | rare | none: the owner merges by default | owner | GitHub |
| Coordinate between projects (Orbit, Sprawl, Slate, Handbook): pass digests, contracts and blockers between them | AI agents in separate threads | on demand | Changes that span repos get stuck or half-done | owner: read each repo's PRs and this handbook | TODO: decide where cross-project notes live |
| Health and acceptance checks after every change | Orbit Cloud agent | after every change | Broken releases go unnoticed | owner | [Deployment → Verify](/operations/deployment/#verify-any-app) |
| Notice that a site is down | **nobody**: there is no monitoring, and agents only checked after changes | continuous | Outages last until someone happens to notice | TODO: set up an uptime check | [Monitoring & alerts](/operations/monitoring-and-alerts/) |
| Rotate credentials | **nobody**: nothing has ever been rotated; deployer tokens expire after 30 minutes by design | TODO | Leaked or long-lived credentials stay valid | TODO | [Offboarding & rotation](/access/offboarding-and-rotation/) |
| Renew Megatron's Tailscale node key | **nobody** | once, due **2027-03-02** | Megatron drops off the tailnet: no SSH, no Orbit, Sprawl or Identity sign-in, no Slate/Sprawl CI deploys | TODO: owner | [Recurring tasks](/operations/recurring-tasks/) |
| Back up data | **nobody**: no backup exists | TODO: daily? | Losing Megatron loses Sprawl, Identity and AnythingTCG data, maybe Slate | TODO | [Backups & restore](/operations/backups-and-restore/) |
| Write and maintain this handbook | Handbook agent with the Orbit Cloud agent | on demand | Docs go stale | page owners | [Writing docs](/start-here/writing-docs/) |

## After you've filled it in

- Put every recurring item on the [Recurring tasks](/operations/recurring-tasks/) calendar with a named person.
- Disable the AI integrations and revoke their API keys and bot accounts so they can't fail half-way through a task. See [Offboarding & rotation](/access/offboarding-and-rotation/).
