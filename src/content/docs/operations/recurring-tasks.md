---
title: Recurring tasks
description: The maintenance calendar. Everything that must be done on a schedule, and who does it.
owner: Kar6677thik
sidebar:
  order: 2
---

Each recurring obligation goes here, with a named person responsible. Without a name, it won't get done.

## Dated deadlines

These break things on a fixed date if nobody acts.

| What expires | When | What breaks | How to renew |
| --- | --- | --- | --- |
| Megatron's Tailscale node key | **2027-03-02** 13:43 UTC | Megatron drops off the tailnet: no SSH, no Orbit, no Sprawl or Identity sign-in, Slate and Sprawl CI can't deploy | Tailscale admin console → Machines → megatron: renew, or disable key expiry |
| Kubernetes API certificate on Megatron | **2027-10-23** | `kubectl`, CI deploys and catalog releases fail TLS | restart k3s in the months before; it renews certificates near expiry (check the k3s docs for the window) |
| Domain `karthiksurkanti.in` | TODO: date | every public site | registrar, TODO |

## Calendar

| Task | How often | Next due | Owner | How |
| --- | --- | --- | --- | --- |
| Manual health check | Daily (until monitoring exists) | daily | Kar6677thik | [Monitoring & alerts](/operations/monitoring-and-alerts/#the-manual-health-check) |
| Check Megatron's disk space (`df -h / /srv`) | Weekly | TODO | Kar6677thik | [Monitoring & alerts](/operations/monitoring-and-alerts/) |
| Test a backup restore | Monthly, once backups exist | blocked: no backups yet | Kar6677thik | [Backups & restore](/operations/backups-and-restore/#test-a-restore) |
| Review stale docs (`npm run audit`) | Monthly | TODO | Kar6677thik | [Writing docs](/start-here/writing-docs/) |
| Review access: SSH keys, Tailscale devices, RBAC bindings | Quarterly | TODO | Kar6677thik | [Access inventory](/access/access-inventory/#access-review) |
| Rotate long-lived credentials (`KUBE_DEPLOYER_TOKEN` in Sprawl, Slate CI SSH key, Tailscale OAuth client, `PACKAGE_TOKEN`) | TODO: yearly? | TODO | Kar6677thik | [Offboarding & rotation](/access/offboarding-and-rotation/) |
| Check domain and certificate expiry | Monthly | TODO | Kar6677thik | [DNS, domains & certificates](/infrastructure/dns-domains-certificates/) |
| Apply OS updates on Megatron (`sudo apt upgrade`), then reboot and check every app comes back | TODO: monthly? | TODO | Kar6677thik | [Monitoring & alerts](/operations/monitoring-and-alerts/#the-manual-health-check) |
| Review bills (Cloudflare, Tailscale, GitHub, registrar) | Monthly | TODO | Kar6677thik | [Vendor accounts](/access/vendor-accounts/) |
| Disaster recovery drill | Yearly | TODO | Kar6677thik | [Disaster recovery](/operations/disaster-recovery/) |

Put these into a shared calendar with reminders too. This page is the source of truth; the calendar is what reminds people.
