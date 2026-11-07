---
title: A public site is down
description: book., lib., mcp., auth. or canvas-mcp.karthiksurkanti.in returns an error or doesn't load.
owner: Kar6677thik
---

**Symptoms:** a `*.karthiksurkanti.in` address shows a Cloudflare error page (502, 530, error 1033), a 404 it shouldn't, or times out.
**Impact:** that site is down for everyone. For `auth.`, AI apps can't refresh tokens for Slate MCP and Sprawl MCP.
**Urgency:** fix now.

## 1. Confirm

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://<host>.karthiksurkanti.in/
```

| You see | Most likely |
| --- | --- |
| **530** or Cloudflare error 1033 on **every** host | the tunnel (`cloudflared`) isn't running, or Megatron is offline |
| **502** on one host | the tunnel is fine; the app behind that rule isn't answering (pod down, or the rule has a stale ClusterIP) |
| **404** on a path that should work | the rule's `path:` regex excludes it, or the request fell through to the catch-all |

Some old hostnames return 502 permanently because nothing runs behind them; the private notes list them.

## 2. Mitigate

**Tunnel down (every host fails):**

```sh
ssh $MEGATRON
systemctl --user status $TUNNEL_SERVICE
journalctl --user -u $TUNNEL_SERVICE -n 50
systemctl --user restart $TUNNEL_SERVICE && systemctl --user is-active $TUNNEL_SERVICE
```

If you can't SSH in, see [Can't reach Megatron](/runbooks/megatron-unreachable/).

**One host returns 502:** find what its rule points at, then check that target. On Megatron:

```sh
grep -n -A3 '<host>' $TUNNEL_CONFIG                 # the service: line
export KUBECONFIG=$HOME/.kube/config
kubectl get svc -A -o wide | grep '<ClusterIP from the rule>'    # does a Service still have that IP?
kubectl -n <namespace> get pods                                  # Running and Ready?
curl -s -o /dev/null -w '%{http_code}\n' http://<ClusterIP>:80/  # from Megatron itself
```

- Pod not Running: see [Service is down](/runbooks/service-is-down/).
- The Service now has a **different ClusterIP** (it was deleted and recreated): update the rule. Back up, edit, validate, restart:

  ```sh
  cp $TUNNEL_CONFIG $TUNNEL_CONFIG.pre-fix-$(date +%Y%m%d-%H%M%S)
  nano $TUNNEL_CONFIG
  cloudflared tunnel ingress validate
  systemctl --user restart $TUNNEL_SERVICE
  ```

- `lib.` and `mcp.` point at host-level forwards rather than ClusterIPs; their targets and how to test each are in the private notes.

**A recent tunnel edit broke it:** restore the newest backup and restart.

```sh
cp "$(ls -t $TUNNEL_CONFIG.pre-* | head -1)" $TUNNEL_CONFIG
systemctl --user restart $TUNNEL_SERVICE
```

## 3. Fix the cause

Record what failed. If the tunnel service crashed, read `journalctl --user` for why. If a ClusterIP changed, consider giving that Service a fixed `clusterIP`, as Orbit, Identity and Sprawl have.

## 4. Verify

The `curl` from step 1 returns the expected code (see [Deployment → Verify](/operations/deployment/#verify-any-app)), and the [manual health check](/operations/monitoring-and-alerts/#the-manual-health-check) passes.

## Escalate if

Cloudflare itself is down (cloudflarestatus.com): nothing to do but wait.
