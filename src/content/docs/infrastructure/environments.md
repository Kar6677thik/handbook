---
title: Environments
description: Each environment, what it's for, and how they differ.
owner: Kar6677thik
sidebar:
  order: 2
---

There is **one production environment, Megatron, and no staging.** Changes are tested locally or in a throwaway k3s cluster, then released straight to Megatron.

| Environment | Where | Purpose | Data | Who can deploy |
| --- | --- | --- | --- | --- |
| Local (Orbit) | `https://localhost:7443` on the owner's Windows laptop (`scripts/start-local.ps1`) | Developing the Orbit console. "Fake" mode serves invented inventory and the sample catalog in `samples/demo-catalog` | fake | anyone with a clone |
| Local (handbook) | `http://localhost:4321` (`npm run dev`) | Writing these docs | n/a | anyone with a clone |
| Disposable k3s | created by `scripts/new-disposable-cluster.ps1` in orbit-cloud | Integration tests: `tests/Orbit.Kubernetes.Integration/` (`hardening.ps1`, `catalog-release.ps1`, `identity.ps1`) | throwaway | anyone with Docker |
| **Production** | Megatron | Everything real | real, and **not backed up** | owner; Slate and Sprawl CI; the handbook updater |

## Differences between test and production

- Fake mode is refused outside `Development`, and production refuses to start without the TOTP file.
- Disposable k3s has no tunnel, no Tailscale `serve`, no Slate and no real Secrets.
- Production images reach Megatron in three different ways: pulled from public GHCR by digest (catalog apps, Sprawl), pulled with a pull secret (Slate), or imported by hand into containerd from an archive (`k3s ctr images import`, Orbit and Identity).

## Configuration

| App | Non-secret config lives in | Change it by |
| --- | --- | --- |
| Catalog apps (`handbook`, `sprawl-mcp`) | `env:` in `catalog/apps/<name>.yaml` in orbit-cloud | a catalog release ([Catalog apps](/operations/catalog-apps/)) |
| Orbit | `deploy/runtime.template.yaml` in orbit-cloud (`Orbit__…` variables; see `docs/reference.md`) | `scripts/release-orbit.ps1` (see `deploy/README.md`) |
| Orbit Identity | `deploy/identity/identity.yaml`; filled-in copy in the owner's `.local/identity.yaml` | `deploy/identity/INSTALL.md` |
| Slate web, Slate MCP | **root-owned templates on Megatron** (`$SLATE_WEB_TEMPLATE`, `$SLATE_MCP_TEMPLATE`), not the repo | the Slate procedure in [Deployment](/operations/deployment/#slate) |
| Slate API | `deploy/k3s/` in slate.lib | Slate CI |
| Sprawl API | Sprawl repo `deploy/api/` | Sprawl CI |

Secret values never go in any of these; see [Secrets management](/access/secrets-management/).
