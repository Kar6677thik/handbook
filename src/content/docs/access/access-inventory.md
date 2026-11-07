---
title: Access inventory
description: Each system, who has access, at what level, and how to grant or remove it.
owner: Kar6677thik
sidebar:
  order: 1
---

:::caution
Never write passwords, keys, tokens, addresses, usernames or ports on this page or anywhere else in these docs. Record **where** a credential is kept, at the level of "the owner's password manager", not what it is or its file path. See [Private details](/start-here/private-details/).
:::

There is one human operator: the owner (`Kar6677thik`). Everything else listed is a machine identity, and each has the narrowest access that works.

## Systems

| System | Admins | How access is granted | Login method |
| --- | --- | --- | --- |
| Megatron (SSH) | owner | authorised SSH keys on the server; reachable over Tailscale | SSH key; `sudo` needs the owner's password |
| Kubernetes on Megatron | owner | the admin kubeconfig, which stays on Megatron | via SSH |
| Tailscale | owner | admin console; new devices need approval | TODO: identity provider, MFA? |
| Cloudflare | owner | dashboard | TODO |
| GitHub (`Kar6677thik`) | owner | personal account | TODO: MFA? |
| Orbit console | owner only | password + authenticator code | tailnet only |
| Orbit Identity sign-in | owner only | the same password + code; the MCP servers accept only the owner's identity | tailnet only |
| Google Drive (credential copies) | owner | TODO | TODO |
| Domain registrar | owner | TODO | TODO |

## Machine identities

| Identity | Can do | Credential | Lifetime |
| --- | --- | --- | --- |
| `app-deployer` (one per catalog app) | update that app's Deployment and Service; nothing else | minted per release, deleted after | 30 minutes |
| `handbook-updater` | patch the handbook Deployment only | in-cluster | n/a |
| Sprawl deployer | update the Sprawl API Deployment only | a GitHub environment secret in the Sprawl repo | **long-lived**; rotation not yet defined |
| `orbit-reader` | read inventory in approved namespaces; no Secrets, logs, exec or writes | in-cluster | n/a |
| `orbit-release` | update the Orbit Deployment only | minted on demand | short |
| Slate CI | deploys Slate over Tailscale and SSH | GitHub secrets in slate.lib | until rotated |
| Sprawl CI | joins the tailnet per run via GitHub OIDC; no stored Tailscale secret | GitHub OIDC | per run |
| orbit-cloud publish workflow | push Orbit images to GHCR | a repo secret in orbit-cloud | until rotated |
| Handbook CI | push handbook images | built-in `GITHUB_TOKEN` | per run |

The tailnet access rules, device tags and what each CI identity may run on the server are recorded in the private notes.

## Break-glass access

If Tailscale is down or the laptop is lost:

- Physical access: the machine is at the owner's home; log in at its own keyboard.
- Other ways in, if any, are in the private notes.
- Orbit and Identity passwords and the authenticator setup key: the owner's password manager and Google Drive.

## Access review

Every quarter, check each row above, remove keys and devices that no longer need access, and note the date here. See [Recurring tasks](/operations/recurring-tasks/).

```sh
ssh $MEGATRON 'ssh-keygen -lf .ssh/authorized_keys'          # fingerprints of the keys that can log in
ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl get rolebindings,clusterrolebindings -A | grep -v system:'
```

Also review devices in the Tailscale admin console and deploy keys and secrets in each GitHub repo.

| Date | Reviewer | Changes |
| --- | --- | --- |
| TODO | | |
