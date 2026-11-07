---
title: Orbit Identity
description: The OAuth 2.1 server that signs Claude, ChatGPT and other MCP clients in to Slate MCP and Sprawl MCP.
owner: Kar6677thik
sidebar:
  order: 3
---

## What it does

Orbit Identity is a small OAuth 2.1 authorization server (OpenIddict on ASP.NET Core). It replaced Auth0. When an AI app such as Claude connects to Slate MCP (`mcp.karthiksurkanti.in`) or Sprawl MCP (`canvas-mcp.karthiksurkanti.in`), it sends the owner here to sign in and approve access, then gets a token the MCP server accepts.

It is **split-horizon**: the protocol endpoints that apps call are public, but the sign-in and consent pages exist only on the tailnet. Nobody off the tailnet can sign in, even with the owner's password.

**If it's down:** apps can't link or refresh their tokens, so Slate MCP and Sprawl MCP stop working for AI clients once current tokens expire. Slate, Sprawl and everything else keep working.

## At a glance

| | |
| --- | --- |
| Repository | [orbit-cloud](https://github.com/Kar6677thik/orbit-cloud): `src/Orbit.Identity`, `Dockerfile.identity`, `deploy/identity/` |
| Language / framework | .NET 10, OpenIddict, ASP.NET Core Identity, SQLite |
| Image | `ghcr.io/kar6677thik/orbit-identity@sha256:…`, imported into containerd by hand |
| Runs on | Megatron, namespace `identity`, Deployment `identity`, Service with a fixed ClusterIP |
| Listeners | three: the protocol (public through the tunnel), sign-in and consent (tailnet only), and an admin API (not routed anywhere). Ports in the private notes |
| Public URL | `https://auth.karthiksurkanti.in`. Only the OAuth discovery, key and token endpoints are public; everything else is 404 at the tunnel |
| Tailnet URL | `https://auth.<tailnet>`: sign-in with the owner password and authenticator code |
| Storage | a volume holding one SQLite file with linked apps, consents, refresh tokens and the audit log. Reclaim policy **Delete** |
| Logs | `kubectl -n identity logs deploy/identity` |
| Alerts | none |

## Dependencies

| Depends on | For | If it's down |
| --- | --- | --- |
| The Identity keys Secret | Token signing and encryption keys, admin API key | Won't start. Copies are in the owner's Google Drive |
| The Identity owner Secret | Owner sign-in (same files as Orbit) | Can't sign in |
| The Cloudflare tunnel | Public protocol endpoints | Apps can't refresh tokens |
| Tailscale | Sign-in page | Can't link new apps |

**Who depends on it:** Slate MCP and Sprawl MCP (both trust issuer `https://auth.karthiksurkanti.in/` and only the owner's subject ID).

## Resources it issues tokens for

| Resource | Name | Scopes |
| --- | --- | --- |
| `https://mcp.karthiksurkanti.in/mcp` (default) | Slate | `slate.read`, `slate.analyze`, `slate.write`, `slate.organize`, `slate.delete`, `slate.admin` (`slate.admin` and `slate.delete` are never pre-ticked) |
| `https://canvas-mcp.karthiksurkanti.in/mcp` | Sprawl | `canvas.read`, `canvas.write`, `canvas.organize`, `canvas.admin` (never pre-ticked) |

Apps identify themselves with a Client ID Metadata Document (an HTTPS URL they host). There is no client secret to manage and Dynamic Client Registration is off.

## Run it locally

TODO: local run steps (see `tests/Orbit.Kubernetes.Integration/identity.ps1` for the disposable-cluster test).

## Deploy

Manual, with `sudo` on Megatron. Full procedure in `deploy/identity/INSTALL.md`:

1. Build on the laptop: `docker build --platform linux/amd64 -f Dockerfile.identity -t ghcr.io/kar6677thik/orbit-identity:candidate .`
2. `docker save`, `scp` to Megatron, `sudo k3s ctr -n k8s.io images import --base-name ghcr.io/kar6677thik/orbit-identity --digests <archive>`. Use the digest that `sudo k3s ctr -n k8s.io images ls | grep orbit-identity` shows.
3. Put that digest into the owner's `.local/identity.yaml` and apply it:

   ```sh
   scp .local/identity.yaml $MEGATRON:/tmp/identity.yaml
   ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl apply --dry-run=server -f /tmp/identity.yaml && kubectl apply -f /tmp/identity.yaml && kubectl -n identity rollout status deployment/identity --timeout=180s; rm /tmp/identity.yaml'
   ```

   orbit-cloud's `deploy/identity/INSTALL.md` still pipes the file over `ssh megatron`, which fails three ways (no `megatron` alias, no `KUBECONFIG`, stdin read twice). Use the form above until that file is fixed.
4. Check: `curl -s https://auth.karthiksurkanti.in/.well-known/oauth-authorization-server` returns JSON listing both resources' scopes.

**Rollback:** apply the previous manifest (previous digest). Uninstall steps are in INSTALL.md §8.

## Common tasks

### Link a new AI app

In the app (for example Claude), add a connector with the MCP URL. It redirects to `https://auth.<tailnet>`; sign in from a tailnet device and approve the scopes.

### See and revoke linked apps

Through Identity's admin API, which is not routed anywhere: reach it from the laptop through an SSH port forward, so the admin key never lands on Megatron. The key is in the owner's Google Drive; the forward's target is in the private notes. Untested by hand; the routes are in `src/Orbit.Identity/Endpoints/AdminEndpoints.cs` in orbit-cloud.

```sh
ssh -N -L 28082:<identity admin address> $MEGATRON        # terminal 1, leave open
KEY=$(cat path/to/admin.key)
curl -s -H "Authorization: Bearer $KEY" http://127.0.0.1:28082/admin/v1/connections
curl -s -X POST -H "Authorization: Bearer $KEY" http://127.0.0.1:28082/admin/v1/connections/<id>/revoke
unset KEY
```

Other routes: `POST /admin/v1/revoke-all`, `GET /admin/v1/clients`, `POST /admin/v1/clients/disable` and `/enable`, `GET /admin/v1/audit`. Orbit console pages for this (milestone I6) aren't built yet.

## Gotchas

- **Losing the database or keys is not a breach**, just inconvenient: every app has to re-link.
- **Deleting the `identity` namespace deletes the database** (reclaim policy Delete). Back up the PVC first.
- See [Backups & restore](/operations/backups-and-restore/) for its data.
- Bugs already fixed in code that may come back on an upgrade of OpenIddict: client assertions with `typ: JWT` rejected, discovery URLs taken from the Host header, the sign-in code field pattern. See git history.
