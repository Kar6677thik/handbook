---
title: Can't reach Megatron
description: SSH to Megatron times out, or every tailnet site (Orbit, Sprawl, Identity sign-in) is unreachable.
owner: Kar6677thik
---

**Symptoms:** `ssh $MEGATRON` fails with `Connection timed out`; `orbit.<tailnet>` or `sprawl.<tailnet>` won't load.
**Impact:** you can't operate anything. Public sites may still be fine (they use the Cloudflare tunnel, not your tailnet connection).
**Urgency:** fix now if you need to deploy or repair something; otherwise within the day.

## 1. Confirm

Is it your machine or Megatron?

```sh
tailscale status
```

- `Tailscale is starting…`, `Logged out`, or `fetch control key … context canceled`: **your laptop** is off the tailnet. Go to 2a. (This is the one that has actually happened.)
- Your laptop is listed but `megatron` shows `offline` or an old "last seen": **Megatron** is off the tailnet. Go to 2b.

Also check a public site: `curl -sI https://book.karthiksurkanti.in/healthz`. If that is 200, Megatron is running and online.

## 2. Mitigate

**2a. Your laptop.** Sign Tailscale back in (tray icon → Log in, or `tailscale up`). Then `tailscale status` lists `megatron`, and `ssh $MEGATRON 'echo ok'` prints `ok`.

**2b. Megatron.**

- If public sites work, Megatron is up but `tailscaled` isn't. Use the fallback way in from the private notes, or go to the machine, then run `sudo systemctl restart tailscaled && tailscale status`.
- If public sites are down too, Megatron is off, asleep, or offline. Go to the machine: check power and network. Log in at its keyboard and run `tailscale status` and `systemctl status k3s`.
- If Megatron's tailnet key expired: re-authenticate it in the Tailscale admin console → Machines → `megatron`. Its key expiry date is on [Recurring tasks](/operations/recurring-tasks/#dated-deadlines); renew it before then.

## 3. Fix the cause

Write down what happened. If Megatron slept or lost power, set it never to suspend and to power on after an outage (a BIOS setting).

## 4. Verify

```sh
ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl get nodes; kubectl get pods -A | grep -vE "Running|Completed"'
```

The node is `Ready` and the second command lists only its header line. Then run the [manual health check](/operations/monitoring-and-alerts/#the-manual-health-check).

## Escalate if

There is nobody to escalate to. If the hardware is dead, go to [Disaster recovery](/operations/disaster-recovery/), and remember there are [no backups](/operations/backups-and-restore/).
