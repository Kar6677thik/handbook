---
title: Inventory
description: Every account, server, and managed resource we pay for or depend on.
owner: Kar6677thik
sidebar:
  order: 1
---

If something we run is missing from this page, nobody will look after it. When you find an unlisted resource, add it here.

Addresses, usernames, ports and other details that would help an attacker are kept out of this page on purpose. See [Private details](/start-here/private-details/).

## Accounts

| Provider | Purpose | Billing | Console |
| --- | --- | --- | --- |
| Cloudflare | DNS for `karthiksurkanti.in`, the tunnel that carries public traffic | TODO | dash.cloudflare.com |
| Tailscale | Private network for admin access and private apps | TODO | login.tailscale.com/admin |
| GitHub (`Kar6677thik`) | Code, Actions, container images (GHCR) | TODO | github.com |
| Google Drive | Copies of Orbit credentials and Identity keys | TODO | drive.google.com |
| Domain registrar for `karthiksurkanti.in` | Domain registration | TODO | TODO |

Login details for each are in the owner's password manager.

## The server: Megatron

| | |
| --- | --- |
| What it is | One laptop-class home server; one disk shared by the OS and app data |
| Kubernetes | k3s, single node |
| Admin access | SSH over Tailscale to `$MEGATRON`, then the admin kubeconfig. Exact target in the private notes |
| Power | Configured to keep running with the lid closed |
| Tailscale device key | expires on a fixed date; see [Recurring tasks](/operations/recurring-tasks/#dated-deadlines) |

Over non-interactive SSH, always set the kubeconfig first:

```sh
ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl get pods -A'
```

## Workloads in the cluster

Image digests change on every release, so they are not listed here. Read the live state with `kubectl get deploy,statefulset,cronjob -A -o wide`.

| Namespace | Workload | Image source | Reached at | Data |
| --- | --- | --- | --- | --- |
| `orbit-system` | Orbit console | GHCR `orbit-cloud` (private package) | tailnet only | none |
| `identity` | Orbit Identity | GHCR `orbit-identity` (private package) | public `auth.karthiksurkanti.in` (protocol only); sign-in on the tailnet | volume |
| `sprawl` | Sprawl API | GHCR `sprawl` | tailnet only | volume |
| `app-sprawl-mcp` | Sprawl MCP (catalog app) | GHCR `sprawl-mcp` | public `canvas-mcp.karthiksurkanti.in` | none |
| `app-handbook` | Handbook (catalog app) | GHCR `handbook` | public `book.karthiksurkanti.in` | none |
| `orbit-updater` | CronJob `handbook-updater`, every 5 minutes | a public kubectl image | none | none |
| `slate` | Slate API | GHCR `slate.lib` | tailnet only | volume |
| `slate-web` | Slate web (Next.js) | GHCR `slate.lib-web` | public `lib.karthiksurkanti.in` | none |
| `slate-mcp` | Slate MCP | GHCR `slate.lib-mcp` | public `mcp.karthiksurkanti.in` | none |
| `anythingtcg` | AnythingTCG server and its Postgres | built on the host | see private notes | volumes |
| `apps` | `hello` demo | Docker Hub | none | none. Looks like a leftover; TODO: remove? |
| `kube-system` | k3s system components | k3s defaults | n/a | n/a |

Cluster-wide: the admission policy `orbit-catalog-workloads` applies to every namespace labelled `orbit.catalog/managed=true`. Network policies restrict traffic in the Orbit, Identity, Sprawl and catalog namespaces.

## On the host, outside Kubernetes

| Thing | What it is |
| --- | --- |
| `cloudflared` | A user service on Megatron running the Cloudflare tunnel for every public hostname |
| Slate MCP proxy | A small system service that forwards Slate MCP traffic to the cluster |
| Slate deploy scripts and templates | Root-owned files that Slate CI runs to deploy. They hold Slate web and MCP config. Locations in the private notes |

There are no backup timers or cron jobs. Other host services and the firewall setup are recorded in the private notes.

## Infrastructure as code

There is no single infrastructure-as-code tool. What exists:

| Piece | Defined in | Applied by |
| --- | --- | --- |
| Catalog apps (`app-*`) | `catalog/apps/<name>.yaml` in orbit-cloud (private repo) | [Catalog apps](/operations/catalog-apps/) |
| Orbit, its RBAC and network policy | `deploy/` in orbit-cloud | by hand, `deploy/INSTALL.md` |
| Orbit Identity | `deploy/identity/` in orbit-cloud | by hand, `deploy/identity/INSTALL.md` |
| Handbook updater | `deploy/updater/handbook.yaml` in orbit-cloud | by hand with the admin kubeconfig |
| Slate API | `deploy/k3s/` in slate.lib | Slate CI |
| Slate web and MCP | root-owned templates on Megatron, **not** the repo | Slate CI |
| Sprawl API | Sprawl repo | Sprawl CI (only when repo variable `SPRAWL_DEPLOY` is `true`) |
| AnythingTCG | `deploy/k3s/` in the AnythingTCG repo | by hand |

## Things created by hand

These exist only on Megatron or in an account console. They are the hardest to rebuild.

- The k3s installation itself.
- The Cloudflare tunnel's config and credentials.
- Tailscale `serve` configuration, the tailnet access rules and device tags.
- Every Kubernetes Secret (see [Secrets management](/access/secrets-management/)).
- Slate's root-owned scripts and templates.
- AnythingTCG's namespace and app files.
