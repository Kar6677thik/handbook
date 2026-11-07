---
title: Private details
description: Why addresses, usernames and ports aren't in this handbook, where they are instead, and how the placeholders in commands work.
owner: Kar6677thik
sidebar:
  order: 5
---

This handbook is **public**: the site and its repository can be read by anyone. So it deliberately leaves out everything that would help someone attack the home server: IP addresses, the tailnet name, SSH usernames, ports, file paths of credentials, firewall and exposure details, exact software versions, and known security gaps.

Those details live in the **owner's private ops notes**. TODO: owner, name the place (for example a password-manager entry called "Megatron ops"), without its contents.

## Placeholders used in commands

Commands in this handbook use placeholders. Set them from the private notes before you start:

| Placeholder | Means | Set it like |
| --- | --- | --- |
| `$MEGATRON` | SSH target for the home server (`user@address`) | `export MEGATRON='<from private notes>'` |
| `<tailnet>` | the tailnet's DNS suffix, in private app URLs such as `https://orbit.<tailnet>` | read it from the notes, or `tailscale status` on a signed-in device |
| `$TUNNEL_CONFIG` | path of the Cloudflare tunnel's config file on Megatron | `export TUNNEL_CONFIG='<from private notes>'` (on Megatron) |
| `$TUNNEL_SERVICE` | name of the systemd **user** service that runs the tunnel | `export TUNNEL_SERVICE='<from private notes>'` (on Megatron) |
| `$SLATE_MCP_TEMPLATE`, `$SLATE_WEB_TEMPLATE` | root-owned deploy templates for Slate MCP and Slate web | from the private notes (on Megatron) |
| `<ClusterIP>`, `<port>` | a Service's in-cluster address and port | look it up: `kubectl -n <namespace> get svc -o wide` |

Most commands also use `K='export KUBECONFIG=$HOME/.kube/config;'`, because non-interactive SSH sessions on Megatron don't load the admin kubeconfig on their own.

## What belongs in the private notes

- How to reach Megatron: addresses, SSH user, which keys are authorised.
- The tailnet name, device names and tags, and the tailnet access rules.
- Every route: tunnel rules with their targets, `tailscale serve` mappings, ports.
- Where each credential file and backup sits.
- Firewall rules and which services listen where.
- Known security gaps and exposures, and the plan to fix each one.

## Rule for writing here

If a detail would tell a stranger where the server is, how to log in to it, or what is weak about it, it goes in the private notes, not in this handbook. `npm run check:confidential` blocks the common cases automatically, and the build fails if it finds one. See the repository's `CLAUDE.md`.
