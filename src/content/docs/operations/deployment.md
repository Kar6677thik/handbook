---
title: Deployment
description: How each app reaches Megatron, how to check it worked, and how to roll it back.
owner: Kar6677thik
sidebar:
  order: 3
---

Always reach Megatron as `$MEGATRON`. There is no `megatron` SSH alias on the laptop, and the bare name resolves to something else.

There is no single deploy pipeline. Each app reaches Megatron in one of five ways:

| App | How it deploys | Trigger | Who/what does it |
| --- | --- | --- | --- |
| Handbook | Auto-updater pulls `:latest` | push to `main` of handbook | GitHub Actions, then the CronJob on Megatron. [Handbook](/services/handbook/) |
| Sprawl MCP, any new catalog app | Orbit catalog release | a merged spec PR in orbit-cloud | **the owner, from the laptop**. [Catalog apps](/operations/catalog-apps/) |
| Slate API, web, MCP | CI SSHes into Megatron and runs root-owned scripts | push to `main` of slate.lib (`slate.lib.web` is a folder inside it) | GitHub Actions over Tailscale. [Slate](#slate) below |
| Sprawl API | CI updates the image with a narrow token | push to `main` of Sprawl (`release.yml`), only when the API image's inputs changed and repo variable `SPRAWL_DEPLOY` is `true` | GitHub Actions over Tailscale. [Sprawl API](#sprawl-api) below |
| Orbit, Orbit Identity | Image imported by hand, manifest applied by hand | manual | the owner, with sudo. [Orbit](/services/orbit/), [Orbit Identity](/services/orbit-identity/) |
| AnythingTCG | `deploy/k3s/` in the AnythingTCG repo | manual | owner. TODO: document the steps |

## Before you deploy

- [ ] CI is green on the commit you're deploying.
- [ ] You know how to roll it back (each section below).
- [ ] Tailscale is up on your machine and `ssh $MEGATRON 'echo ok'` works, for anything you deploy by hand.
- [ ] Megatron has disk space: `ssh $MEGATRON 'df -h'` (Slate web refuses to deploy below 15 GiB free on its data disk).

## Verify (any app)

```sh
M="$MEGATRON"; K='export KUBECONFIG=$HOME/.kube/config;'
ssh $M "$K kubectl get pods -A -o wide | grep -v Running"        # anything not Running?
ssh $M "$K kubectl -n <ns> get pods -o wide"                      # new image, 0 restarts
ssh $M "$K kubectl -n <ns> logs deploy/<name> --tail=200"
```

Then load the app's public or tailnet URL. Expected answers:

| URL | Expect |
| --- | --- |
| `https://book.karthiksurkanti.in/healthz` | 200 `ok` |
| `https://lib.karthiksurkanti.in/` | 200 |
| `POST https://lib.karthiksurkanti.in/api/slate/v1/sync` with the headers below | 401 (a bare POST gives 400) |
| `POST https://mcp.karthiksurkanti.in/mcp` (no auth) | 401 |
| `POST https://canvas-mcp.karthiksurkanti.in/mcp` (no auth) | 401 with `resource_metadata` |
| `https://auth.karthiksurkanti.in/.well-known/oauth-authorization-server` | JSON |
| `https://orbit.<tailnet>/health/live` (tailnet) | 200 |

The Slate web check needs these headers:

```sh
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Origin: https://lib.karthiksurkanti.in' -H 'X-Slate-Server: https://lib.karthiksurkanti.in' \
  -H 'Authorization: Bearer deliberately-invalid' -H 'Content-Type: application/json' --data '{}' https://lib.karthiksurkanti.in/api/slate/v1/sync
```

## Slate

On every push to slate.lib `main`, its workflow `main.yml`:

1. builds images tagged with the commit SHA and pushes them to GHCR (`slate.lib`, `slate.lib-web`, `slate.lib-mcp`);
2. joins the tailnet with `tailscale/github-action` (secrets `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`);
3. SSHes in to Megatron (credentials are repo secrets in slate.lib) and uploads the release files;
4. runs the matching root-owned deploy script for the API, web or MCP. A separate script publishes release files into Slate's data folder.

The API deploy applies the **repo's** `deploy/k3s` files and uses no template. Only web and MCP use root-owned templates.

The scripts accept only Slate's own images for that commit. They render the **root-owned template** for web or MCP by inserting the image, `kubectl apply`, wait for the rollout, then test: web expects `POST /api/slate/v1/sync` → 401; MCP expects its health check → 200 and `POST /mcp` → 401. The web script also refuses to deploy if Slate's data disk has under 15 GiB free.

**The gotcha:** web and MCP **config lives in those root templates, not the repo.** A config change made only in the repo is lost on the next deploy. To change config:

```sh
ssh -t $MEGATRON
sudo cp $SLATE_MCP_TEMPLATE $SLATE_MCP_TEMPLATE.before-<change>-$(date +%Y%m%d-%H%M%S)
sudo nano $SLATE_MCP_TEMPLATE
# make the same change live now, or wait for the next deploy:
export KUBECONFIG=$HOME/.kube/config
kubectl -n slate-mcp patch configmap slate-mcp-config --type merge -p '{"data":{"Key":"value"}}'
kubectl -n slate-mcp rollout restart deploy/slate-mcp
```

**Rollback:** revert the commit on slate.lib `main`; CI redeploys the previous code. TODO: can `main.yml` be run by hand for an older SHA? For a template change, `sudo cp` the `.before-…` file back and patch live.

## Sprawl API

Sprawl's `release.yml` job `deploy-api` runs only when the repo variable `SPRAWL_DEPLOY` is `"true"`. It joins the tailnet per run through GitHub OIDC (no stored Tailscale secret), then runs `kubectl set image deployment/sprawl` with a service account that can only update that Deployment.

**Rollback (untested):** `kubectl -n sprawl rollout undo deploy/sprawl` with the admin kubeconfig. It restarts the API, which signs the owner out, and whether the previous version can read data the new one wrote is unknown.

## Rollback summary

| App | Fastest safe rollback |
| --- | --- |
| Handbook | `git revert <bad commit> && git push`; live in about 5 minutes |
| Catalog apps | revert the spec PR and release it ([Catalog apps → Roll back](/operations/catalog-apps/#roll-back)) |
| Slate | revert on slate.lib `main` |
| Sprawl API | `kubectl -n sprawl rollout undo deploy/sprawl` (untested; signs the owner out) |
| Orbit | `scripts/release-orbit.ps1` with the archived previous Deployment (orbit-cloud `deploy/README.md`) |
| Orbit Identity | apply the previous manifest |
| Tunnel config | copy the newest `$TUNNEL_CONFIG.pre-<change>-*` back, `systemctl --user restart $TUNNEL_SERVICE` |

**Database migrations:** Slate, Sprawl and Identity keep data on volumes on Megatron. TODO: for each, can the previous version read data written by the new one?
