---
title: DNS, domains & certificates
description: Domains we own, where DNS is hosted, which sites are public, and how TLS works.
owner: Kar6677thik
sidebar:
  order: 3
---

If a domain expires, everything that uses it goes down at once. Check this page often.

There are two kinds of address:

- **Public** sites on `karthiksurkanti.in`. Cloudflare serves them and carries the traffic to Megatron through a Cloudflare Tunnel, so no port on the home network is opened for them.
- **Private** apps on the tailnet (`https://<app>.<tailnet>`). Only the owner's own devices, signed in to Tailscale, can reach them.

Tunnel rules, their targets, `tailscale serve` mappings and ports are in the owner's private notes ([Private details](/start-here/private-details/)).

## Domains

| Domain | Registrar | Expires | Auto-renew? | Registrar account |
| --- | --- | --- | --- | --- |
| `karthiksurkanti.in` | TODO | TODO: YYYY-MM-DD | TODO | See [Vendor accounts](/access/vendor-accounts/) |

## DNS

DNS for `karthiksurkanti.in` is hosted on **Cloudflare** and managed by hand. Each public app hostname is a proxied CNAME to the tunnel, created on Megatron with:

```sh
cloudflared tunnel route dns <tunnel name> <hostname>
```

The full procedure for publishing a new site is in [Catalog apps → Make an app public](/operations/catalog-apps/#make-an-app-public).

TODO: list any records that are not tunnel CNAMEs (email: MX, SPF, DKIM, DMARC; verification TXT records).

## Public sites

| Site | Serves | Notes |
| --- | --- | --- |
| `book.karthiksurkanti.in` | This handbook | |
| `lib.karthiksurkanti.in` | Slate web | |
| `mcp.karthiksurkanti.in` | Slate MCP | `GET /` returns 404; that is expected |
| `auth.karthiksurkanti.in` | Orbit Identity | only the OAuth protocol endpoints are public; everything else is 404 at the tunnel |
| `canvas-mcp.karthiksurkanti.in` | Sprawl MCP | only `/mcp` and its metadata endpoint are public |

The tunnel's rules live in a config file on Megatron. Each edit leaves a dated backup beside it. Rules are checked top to bottom, the first match wins, and anything unmatched gets 404.

TODO: some older hostnames in the tunnel config point at services that no longer run (see the private notes). Decide whether to remove them.

**Catalog apps' in-cluster addresses are not fixed.** The tunnel rule for a catalog app points at its Service's ClusterIP. If that Service is deleted and recreated, its address changes and the rule must be updated ([A public site is down](/runbooks/public-site-down/)). Orbit, Identity and Sprawl have fixed addresses set in their manifests.

## Private apps (tailnet)

Published on the tailnet with `tailscale serve` on Megatron. Check them with `tailscale serve status` there.

| App | URL |
| --- | --- |
| Orbit console | `https://orbit.<tailnet>` |
| Orbit Identity sign-in | `https://auth.<tailnet>` |
| Sprawl | `https://sprawl.<tailnet>` |
| Slate API | Megatron's own tailnet name |

## TLS certificates

There is no cert-manager in the cluster and no certificate to renew by hand.

| Covers | Issued by | Renewal | Expires |
| --- | --- | --- | --- |
| Public `*.karthiksurkanti.in` sites | Cloudflare (edge certificate) | automatic, by Cloudflare | managed by Cloudflare |
| Private tailnet apps | Tailscale (Let's Encrypt via `tailscale serve`) | automatic, by `tailscaled` | about 90 days, renewed in place |
| Kubernetes API | k3s's own CA | k3s renews its certificates near expiry when the service starts, so restart k3s in the months before (check the k3s docs for the window) | see [Recurring tasks](/operations/recurring-tasks/#dated-deadlines) |

The Kubernetes API certificate doesn't cover Megatron's tailnet address. Clients that connect to it over the tailnet (like Sprawl CI) set `tls-server-name: kubernetes`. Through an SSH tunnel to `127.0.0.1`, as the catalog release procedure does, nothing extra is needed.

### Check when a certificate expires

```sh
echo | openssl s_client -connect book.karthiksurkanti.in:https -servername book.karthiksurkanti.in 2>/dev/null | openssl x509 -noout -enddate
```

### Renew a certificate by hand

- Public sites: nothing to do; Cloudflare renews them. If one fails, check the zone's SSL/TLS → Edge Certificates page in the Cloudflare dashboard.
- Tailnet apps: `tailscaled` renews them automatically. If one has expired, restart `tailscaled` on Megatron and check again.
