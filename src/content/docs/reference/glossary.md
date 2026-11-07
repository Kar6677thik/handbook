---
title: Glossary
description: Internal names, acronyms, and jargon, explained.
sidebar:
  order: 1
---

Add any word a newcomer wouldn't know. Keep the list in alphabetical order.

| Term | Meaning |
| --- | --- |
| ADR | Architecture Decision Record. See [Decisions](/architecture/decisions/). |
| Admission policy | A cluster rule the Kubernetes API enforces on every create or update. `orbit-catalog-workloads` rejects catalog pods that break the image rules, even for admins. |
| `app-deployer` | The service account in each catalog app's namespace that can only update that app's Deployment and Service. Tokens are minted for 30 minutes per release. |
| Attestation | A signed record, made by GitHub Actions, of which repo, commit and workflow built an image. Checked with `gh attestation verify`. |
| Bundle | The sealed, checksummed release package `app-bundle.yml` builds for one catalog app from one commit. |
| Catalog | Orbit's list of reviewed app specs, `catalog/apps/*.yaml` in orbit-cloud. See [Catalog apps](/operations/catalog-apps/). |
| ClusterIP | A Service's private address inside the cluster (`10.43.x.x`). The tunnel rules point at these. |
| Digest | An image's content hash (`sha256:…`). Unlike a tag, it can't be moved, so deploys pin digests. |
| GHCR | GitHub Container Registry, `ghcr.io/kar6677thik/…`, where every image is stored. |
| k3s | The small Kubernetes distribution Megatron runs. |
| MagicDNS | Tailscale's DNS: `<name>.<tailnet>` names resolve only on the owner's tailnet. |
| MCP | Model Context Protocol: how AI apps like Claude call tools. Slate MCP and Sprawl MCP are MCP servers. |
| Megatron | The home server everything runs on. See [Inventory](/infrastructure/inventory/). |
| Orbit | The private cluster console and app catalog. See [Orbit](/services/orbit/). |
| Orbit Identity | The OAuth server for the MCP servers. See [Orbit Identity](/services/orbit-identity/). |
| PVC | PersistentVolumeClaim: a Kubernetes disk. Here they live on Megatron's one disk (local-path). |
| RPO | Recovery Point Objective: the most data we can afford to lose. |
| RTO | Recovery Time Objective: the longest we can afford to be down. |
| Runbook | A step-by-step procedure for one situation. See [Runbooks](/runbooks/). |
| Tailnet | The owner's private Tailscale network, `<tailnet>`. |
| `tailscale serve` | Publishes a service on a tailnet name with automatic HTTPS. Orbit, Identity sign-in and Sprawl are set up this way. |
| Tunnel | The Cloudflare Tunnel `main`: `cloudflared` on Megatron carries public `*.karthiksurkanti.in` traffic in without opening ports. |
| Updater | The CronJob that deploys whatever the handbook's `:latest` points at, every 5 minutes. |
| TODO | Slate, Sprawl, AnythingTCG terms |
