---
title: Monitoring & alerts
description: Where to look when you want to know if things are healthy, and what each alert means.
owner: Kar6677thik
sidebar:
  order: 4
---

:::caution[Nothing alerts today]
There is no uptime check, no alerting and no metrics history. If a site goes down, nobody is told. Until that changes, run the manual check below at least daily.
:::

## Where to look

| What | Tool | How |
| --- | --- | --- |
| Cluster overview: workloads, pods, events, current CPU and memory | Orbit console | `https://orbit.<tailnet>` (tailnet; password + code). Read-only, no history |
| Pods, events, logs | `kubectl` on Megatron | `ssh $MEGATRON`, `export KUBECONFIG=$HOME/.kube/config`, then the commands below |
| Logs | `kubectl logs` | kept only while the pod exists; nothing is shipped anywhere |
| Host health | SSH | `df -h / /srv`, `free -m`, `uptime`, `systemctl --failed`, `systemctl --user status cloudflared-main-slate-web.service` |
| Uptime checks | none | TODO |
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
  df -h / /srv | tail -n +2'                              # alarm above 85% used
```

If anything is wrong: [If something is broken](/start-here/if-something-is-broken/).

## Alerts

Every alert must have a runbook. An alert nobody knows how to handle just gets ignored.

| Alert | Means | Severity | Goes to | Runbook |
| --- | --- | --- | --- | --- |
| none exist yet | | | | |

Suggested first alerts (not set up): an external uptime check on the five public URLs above (a free hosted checker works), and disk usage above 85% on Megatron.

## Who gets paged

Nobody; there is no paging. The owner is the only operator.

## Who watches for unknown problems

The Orbit Cloud agent only ran checks after its own changes; nobody watched continuously. Now: the owner, with the manual check above. Put it on [Recurring tasks](/operations/recurring-tasks/).
