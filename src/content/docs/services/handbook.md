---
title: Handbook (this site)
description: The engineering handbook at book.karthiksurkanti.in, and how a push to main reaches it.
owner: Kar6677thik
lastVerified: 2026-11-06
---

## What it does

Serves this handbook as a static website. Nothing calls it. If it's down, people can still read every page as Markdown in the [repository](https://github.com/Kar6677thik/handbook) under `src/content/docs/`.

## At a glance

| | |
| --- | --- |
| Repository | [Kar6677thik/handbook](https://github.com/Kar6677thik/handbook) |
| Language / framework | Astro + Starlight, static HTML served by nginx |
| Image | `ghcr.io/kar6677thik/handbook` (public package) |
| Runs on | k3s on Megatron, namespace `app-handbook`, Deployment `handbook` |
| Production URL | https://book.karthiksurkanti.in |
| Health check | https://book.karthiksurkanti.in/healthz returns `ok` |
| Public route | Cloudflare Tunnel → the Service's ClusterIP → the pod |
| Cluster config | [orbit-cloud](https://github.com/Kar6677thik/orbit-cloud): `catalog/apps/handbook.yaml` (the app) and `deploy/updater/handbook.yaml` (the auto-updater) |
| Logs | `kubectl -n app-handbook logs deploy/handbook` |
| Alerts | TODO: none yet |

## Dependencies

| Depends on | For | If it's down |
| --- | --- | --- |
| GitHub Actions + GHCR | Building and storing images | No new deploys. The running site is unaffected. |
| Megatron (k3s) | Running the container | Site is down |
| Cloudflare Tunnel (`cloudflared` user service on Megatron) | Public HTTPS route | Site is unreachable from the internet |
| Cloudflare DNS (`karthiksurkanti.in` zone) | The `book` CNAME to the tunnel | Site is unreachable |

## Run it locally

```sh
git clone https://github.com/Kar6677thik/handbook.git
cd handbook
npm install
npm run dev        # http://localhost:4321 (search only works in build + preview)
```

To run the production container locally (needs Docker):

```sh
docker build -t handbook .
docker run --rm -p 8080:8080 --read-only --tmpfs /tmp handbook
# open http://localhost:8080
```

## Deploy

Deploys are automatic. **Merging or pushing to `main` deploys the site within about 5 minutes.** There is nothing to click and there are no deploy secrets.

1. `.github/workflows/release.yml` runs on every push to `main`. It builds the image, pushes `:sha-<commit>`, attests its build provenance, then copies it to `:latest` byte-for-byte and checks that both tags have the same digest.
2. Every 5 minutes, the `handbook-updater` CronJob in namespace `orbit-updater` reads the digest behind `:latest`. If it's new, it pins Deployment `handbook` to `ghcr.io/kar6677thik/handbook@sha256:<digest>` and waits up to 180 seconds for the rollout.
3. If the rollout fails, the updater restores the previous image and records the bad digest in the annotation `orbit.updater/failed-digest`. **That digest is never retried.** To move on, push a fixed commit, which produces a new digest.

The updater's only permission is to get and patch the `handbook` Deployment in `app-handbook`. CI has no access to the cluster: moving `:latest` is the deploy.

### Watch a deploy

```sh
# CI side
gh run list --repo Kar6677thik/handbook --workflow release.yml -L 3

# Cluster side (on Megatron)
kubectl -n orbit-updater get jobs --sort-by=.metadata.creationTimestamp
kubectl -n orbit-updater logs job/<latest job name>
kubectl -n app-handbook get deploy handbook -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl -n app-handbook get deploy handbook -o jsonpath='{.metadata.annotations}{"\n"}'
```

### Roll back

Revert the bad commit and push it to `main`. The fixed build becomes the new `:latest` and rolls out within 5 minutes:

```sh
git revert <bad-commit>
git push
```

## The image contract

The orbit-cloud catalog's admission policy rejects pods that break these rules, so a change to `Dockerfile` or `deploy/nginx.conf` must keep all of them:

- One container, running as a **numeric** non-root user (`USER 101`).
- **Read-only root filesystem.** Only `/tmp` is writable (16 MiB, in memory). That's why `deploy/nginx.conf` replaces the whole nginx config and puts the pid file and every temp directory under `/tmp`.
- Listens on port **8080** and answers **`/healthz`** with 200.
- Limits: 100m CPU and 64Mi memory (set in the catalog entry).
- Pulled by digest from `ghcr.io/kar6677thik/`, with no pull secret, so the package must stay **public**.

## Gotchas

- **Some changes aren't automatic.** Changes to CPU or memory, the port, the health path or the replica count need a PR to `catalog/apps/handbook.yaml` in orbit-cloud and a catalog release. That release reports a field conflict on the image, because the updater owns that field. That's expected.
- **The tunnel points at a ClusterIP.** The handbook's tunnel rule targets the Service's ClusterIP. If the Service is ever deleted and recreated, the IP changes and the rule must be updated, followed by a restart of the `cloudflared-main-slate-web` user service.
- **HTTP isn't redirected to HTTPS.** "Always Use HTTPS" is off for the whole `karthiksurkanti.in` zone in Cloudflare. TODO: decide whether to turn it on.
- **"Last updated" dates come from git.** The Docker build copies `.git` in, and CI checks out full history (`fetch-depth: 0`). A shallow clone gives every page the same date.
