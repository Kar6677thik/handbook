---
title: Orbit
description: The private console for the Megatron cluster, and the app catalog that releases stateless apps onto it.
owner: Kar6677thik
sidebar:
  order: 2
---

## What it does

Orbit has two parts, both in the [orbit-cloud](https://github.com/Kar6677thik/orbit-cloud) repo:

1. **The console** (v0.1): a private web page where the owner signs in and sees what runs on Megatron: Deployments, pods, Services, events and current CPU and memory, plus an **Apps** page comparing each catalog app with what is actually running. It is **read-only**: it cannot change anything in the cluster.
2. **The app catalog** (v0.2): a reviewed YAML spec per stateless app (`catalog/apps/<name>.yaml`), a policy that limits what any app may ask for, and tools that render, release and verify each app. Today's catalog apps are `handbook` and `sprawl-mcp`.

If the console is down, nothing else breaks: apps keep running and every release procedure works without it. Nothing calls it.

## At a glance

| | |
| --- | --- |
| Repository | [Kar6677thik/orbit-cloud](https://github.com/Kar6677thik/orbit-cloud) |
| Language / framework | ASP.NET Core (.NET 10) API serving a compiled Angular 22 app, one container, no database |
| Image | `ghcr.io/kar6677thik/orbit-cloud@sha256:…` (private package; imported into containerd by hand, so the cluster holds no registry credential) |
| Runs on | Megatron, namespace `orbit-system`, Deployment `orbit` (1 replica, Recreate), Service with a fixed ClusterIP |
| URL | `https://orbit.<tailnet>`, **tailnet only** (`tailscale serve`). There is no public address, by decision |
| Sign-in | Owner password **and** a 6-digit authenticator code. Session lasts 30 minutes |
| Health check | `/health/live`, `/health/ready` (process health only; stays healthy while the cluster API is unreachable) |
| Logs | `kubectl -n orbit-system logs deploy/orbit`. Request lines only; no bodies or tokens |
| Alerts | none |
| Design docs | `docs/01`–`09` (design), `docs/15-milestones.md` (status), `docs/reference.md` (config, security contract, API) |

## Dependencies

| Depends on | For | If it's down |
| --- | --- | --- |
| Kubernetes API on Megatron | Reading inventory (service account `orbit-reader`, get/list only) | The console shows data as stale, then hides it; sign-in still works |
| metrics-server | CPU and memory samples | Metrics show as unavailable, never as zero |
| Tailscale | Reaching the console | Console unreachable; nothing else affected |
| The owner credential Secret in `orbit-system` | Owner sign-in | Orbit refuses to start |

**Who depends on Orbit:** nobody at runtime. The **catalog** (repo files and CLI) is what releases `handbook` and `sprawl-mcp`.

## Run it locally

On Windows, from an orbit-cloud clone. Needs .NET SDK 10.0.401, Node 24.15 and a trusted localhost dev certificate.

```powershell
./scripts/build-local.ps1
dotnet dev-certs https --check
dotnet run --project tools/Orbit.Credentials -- .local/owner.verifier      # asks for a new password, hidden
./scripts/start-local.ps1 -VerifierFile .local/owner.verifier
# open https://localhost:7443 (fake inventory + samples/demo-catalog)
```

Tests:

```powershell
dotnet restore Orbit.slnx --locked-mode
dotnet build Orbit.slnx -c Release --no-restore
dotnet test Orbit.slnx -c Release --no-build
Push-Location src/Orbit.Web; npm ci --no-audit --no-fund; npm test; npm run build; Pop-Location
```

## The catalog in one paragraph

A spec names a digest-pinned image from `ghcr.io/kar6677thik/`, a port of 1024 or above, resources within `catalog/policy.yaml` (at most 2 replicas, 500m CPU and 256 Mi memory), a health path and optional non-secret `env` and `secretEnv` references. Unknown fields are errors. Rendering always adds the hardening: non-root, read-only root filesystem, all capabilities dropped, `/tmp` as a 16 Mi memory volume, no service-account token. On the cluster, the admission policy `orbit-catalog-workloads` enforces the same rules for every `orbit.catalog/managed=true` namespace, even for an admin. Each app's namespace `app-<name>` has a quota, ingress from the node only, and an `app-deployer` account that can only create and update its Deployment and Service.

Procedures: [Catalog apps](/operations/catalog-apps/).

```powershell
dotnet run --project tools/Orbit.Catalog.Cli -- validate catalog          # also runs in CI
dotnet run --project tools/Orbit.Catalog.Cli -- render catalog <app>      # the exact YAML that will be applied
```

## Deploy

Orbit itself is released by hand, separately from the catalog apps:

1. `publish.yml` (manual, on `main`, needs the exact commit to have passed CI) builds and pushes the image and records its digest. It uses the repo secret `PACKAGE_TOKEN`.
2. `release.yml` (manual) checks where that image came from and produces a checksummed bundle.
3. The image is pulled on the laptop, saved as an archive, copied to Megatron and imported: `sudo k3s ctr -n k8s.io images import --base-name ghcr.io/kar6677thik/orbit-cloud --digests <archive>`. The `--base-name … --digests` flags are required or the pod fails with `ImagePullBackOff`.
4. `scripts/release-orbit.ps1` (PowerShell 7) replaces the Deployment using the narrow `orbit-release` account and verifies the running digest.

The full procedure and rollback are in `deploy/README.md` and `deploy/INSTALL.md`. **Not yet done in production:** a real upgrade and rollback (milestone M3). The installed version is believed to still be the 29 Oct 2026 install (image from commit `8e03550`). TODO: confirm with `kubectl -n orbit-system get deploy orbit -o wide`.

## Common tasks

### Check it's up

```sh
ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl -n orbit-system get pods -o wide'
# from a tailnet device:
curl -s -o /dev/null -w '%{http_code}\n' https://orbit.<tailnet>/health/live
```

### Reset the owner password or lost authenticator

Generate new files on the laptop (`dotnet run --project tools/Orbit.Credentials -- .local/owner.verifier`, and `-- --totp .local/owner.totp` for a new authenticator). Replace only the matching key of Orbit's owner credential Secret, raise `Orbit__CredentialVersion` in the Deployment, and restart Orbit. Changing the Secret alone does nothing until restart. Keep the authenticator setup key in the password manager so a lost phone is not a lockout. Orbit Identity uses the same two files.

## Gotchas

- **Orbit is read-only on purpose.** It never gains write access; releases happen from the owner's laptop with short-lived, narrow tokens.
- **The catalog is baked into the image.** A newly onboarded app only appears on the Apps page after Orbit is rebuilt and released.
- **Sessions die on restart.** Signing keys are in memory, so every restart signs the owner out.
- The **Apps** page will show `handbook` as "differs": the updater moves its image away from the catalog's bootstrap digest. That is expected.
