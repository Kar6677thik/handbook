---
title: Monitoring & alerts
description: Where to look when you want to know if things are healthy, and what each alert means.
owner: Kar6677thik
sidebar:
  order: 4
---

:::caution[Alerts exist, but nothing notifies you]
Some sites have uptime probes that check them every minute; an outage shows as a site-down alert in the Orbit console. Orbit only evaluates alerts while it's open, and nothing pushes a notification (no email, phone or chat). Until a notifier exists, open Orbit or run the manual check below at least daily.
:::

## Where to look

| What | Tool | How |
| --- | --- | --- |
| Cluster overview: workloads, pods, events, current CPU and memory | Orbit console | `https://orbit.<tailnet>` (tailnet; password + code). Read-only, no history |
| Pods, events, logs | `kubectl` on Megatron | `ssh $MEGATRON`, `export KUBECONFIG=$HOME/.kube/config`, then the commands below |
| Logs | `kubectl logs` | kept only while the pod exists; nothing is shipped anywhere |
| Host health | SSH | `df -h`, `free -m`, `uptime`, `systemctl --failed`, `systemctl --user status $TUNNEL_SERVICE` |
| Uptime checks | blackbox probes, every minute | site-down alerts on the Orbit console (Socrates and Hey Ann so far; other sites TODO) |
| Provider status | | cloudflarestatus.com, status.tailscale.com, githubstatus.com |

## The manual health check

Takes two minutes. From any machine:

```sh
for u in https://book.karthiksurkanti.in/healthz https://lib.karthiksurkanti.in/ \
         https://auth.karthiksurkanti.in/.well-known/oauth-authorization-server; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done
# expect 200 for all three
curl -s -o /dev/null -w '%{http_code}  mcp\n'        -X POST -H 'content-type: application/json' -d '{}' https://mcp.karthiksurkanti.in/mcp         # expect 401
curl -s -o /dev/null -w '%{http_code}  canvas-mcp\n' -X POST -H 'content-type: application/json' -d '{}' https://canvas-mcp.karthiksurkanti.in/mcp  # expect 401
```

From a tailnet device:

```sh
ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config
  kubectl get pods -A | grep -vE "Running|Completed"      # anything listed is a problem
  kubectl get events -A --field-selector type=Warning --sort-by=.lastTimestamp | tail -20
  kubectl -n orbit-updater get cronjob handbook-updater    # LAST SCHEDULE recent, SUSPEND False
  df -h | tail -n +2'                              # alarm above 85% used
```

If anything is wrong: [If something is broken](/start-here/if-something-is-broken/).

## Alerts

Every alert must have a runbook. An alert nobody knows how to handle just gets ignored.

| Alert | Means | Severity | Goes to | Runbook |
| --- | --- | --- | --- | --- |
| Site down | a probed site failed two checks in a row (about 2 minutes) | critical | the Orbit console only; no notification | [A public site is down](/runbooks/public-site-down/) |

Suggested first alerts (not set up): an external uptime check on the five public URLs above (a free hosted checker works), and disk usage above 85% on Megatron.

## Who gets paged

Nobody; there is no paging. The owner is the only operator.

## Who watches for unknown problems

The Orbit Cloud agent only ran checks after its own changes; nobody watched continuously. Now: the owner, with the manual check above. Put it on [Recurring tasks](/operations/recurring-tasks/).
