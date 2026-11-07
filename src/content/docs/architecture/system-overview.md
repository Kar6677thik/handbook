---
title: System overview
description: Every major component, what it does, and how they connect.
owner: Kar6677thik
sidebar:
  order: 1
---

Everything runs on **one machine, Megatron**: a home server running single-node k3s (Kubernetes). There is no cloud compute. Public traffic arrives through a Cloudflare Tunnel; private traffic arrives over the owner's Tailscale network. Images are built by GitHub Actions and stored in GitHub Container Registry (GHCR).

Addresses, ports and routing details are deliberately not shown here; see [Private details](/start-here/private-details/).

## Diagram

```text
            INTERNET                               TAILNET (owner's devices only)
               │                                              │
     Cloudflare edge (TLS)                     Tailscale (TLS via `tailscale serve`)
               │                                              │
     Cloudflare Tunnel (cloudflared                           │
     running on Megatron)                                     │
               │                                              │
┌──────────────┴───────────────── Megatron (k3s) ─────────────┴──────────────┐
│                                                                            │
│  Public:   book.  → Handbook          Private:  Orbit console              │
│            lib.   → Slate web                   Orbit Identity sign-in     │
│            mcp.   → Slate MCP                   Sprawl                     │
│            auth.  → Orbit Identity              Slate API                  │
│            canvas-mcp. → Sprawl MCP                                         │
│                                                                            │
│  handbook-updater (every 5 min) ── pulls the newest handbook image         │
└────────────────────────────────────────────────────────────────────────────┘
        ▲                                ▲
        │ images (by digest)             │ deploys: catalog releases from the owner's laptop,
   GHCR (ghcr.io/kar6677thik/*)          │ Slate and Sprawl CI over Tailscale, the handbook updater
        ▲
   GitHub Actions (build, attest, push)
```

Public sites are listed on [DNS, domains & certificates](/infrastructure/dns-domains-certificates/).

## Components

| Component | What it does | Runs on (namespace) | Code | Docs |
| --- | --- | --- | --- | --- |
| Orbit | Private console: read-only view of the cluster, and the app catalog that renders and releases stateless apps | `orbit-system` | orbit-cloud (private repo) | [Orbit](/services/orbit/) |
| Orbit Identity | OAuth 2.1 server (replaced Auth0) for Slate MCP and Sprawl MCP | `identity` | orbit-cloud | [Orbit Identity](/services/orbit-identity/) |
| Catalog apps | Stateless apps released through the Orbit catalog: `handbook`, `sprawl-mcp` | `app-<name>` | each app's own repo | [Catalog apps](/operations/catalog-apps/) |
| Handbook | This site | `app-handbook` | [handbook](https://github.com/Kar6677thik/handbook) | [Handbook](/services/handbook/) |
| Slate (API, web, MCP) | Notes app: API, Next.js web UI, MCP server | `slate`, `slate-web`, `slate-mcp` | slate.lib | TODO: Slate service page |
| Sprawl (API, MCP) | Canvas app and its MCP server | `sprawl`, `app-sprawl-mcp` | [Sprawl](https://github.com/Kar6677thik/Sprawl) | TODO: Sprawl service page |
| AnythingTCG | App server and its Postgres | `anythingtcg` | AnythingTCG repo | TODO: AnythingTCG service page |
| k3s system | DNS, storage, metrics | `kube-system` | k3s defaults | [Inventory](/infrastructure/inventory/) |

## External dependencies

| Service | Used for | What breaks without it | Account details |
| --- | --- | --- | --- |
| Cloudflare | DNS for `karthiksurkanti.in`, TLS and the tunnel for every public site | Every public site | [Vendor accounts](/access/vendor-accounts/) |
| Tailscale | Private network: admin access, private apps, CI deploys for Slate and Sprawl | All admin access and every private app | [Vendor accounts](/access/vendor-accounts/) |
| GitHub | Code, Actions (builds), GHCR (images) | No new builds or deploys; running apps keep running | [Vendor accounts](/access/vendor-accounts/) |
| Google Drive | Owner's copy of Orbit credentials and Identity keys | Recovery of those credentials | [Secrets management](/access/secrets-management/) |
| Home internet and power | Everything | Everything | n/a |

## Known weak spots (reliability)

- **One machine.** Any hardware fault on Megatron takes down every app.
- **No automatic backups.** See [Backups & restore](/operations/backups-and-restore/).
- **No monitoring.** Nothing alerts when a site goes down. See [Monitoring & alerts](/operations/monitoring-and-alerts/).
- **Dated expiries** (Tailscale device key, Kubernetes API certificate). See [Recurring tasks](/operations/recurring-tasks/#dated-deadlines).
- **Config that only exists on the box:** Slate's deploy templates, the tunnel config.

Security gaps are tracked in the owner's private notes, not here.
