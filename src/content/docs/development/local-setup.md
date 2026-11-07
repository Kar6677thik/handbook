---
title: Local setup
description: From a blank Windows laptop to one that can build the repos and operate Megatron.
owner: Kar6677thik
sidebar:
  order: 1
---

The goal: someone gets from nothing to a laptop that can build every repo **and** run every procedure in this handbook, in one afternoon, using only this page. If it took you longer, fix the step that slowed you down.

All procedures assume a Windows laptop with Git Bash and PowerShell, because that's what the owner uses.

## Prerequisites

| Tool | Version | Why | Install |
| --- | --- | --- | --- |
| Git (with Git Bash) | any recent | every repo; most commands in this handbook are Git Bash | https://git-scm.com |
| Tailscale | current | the only way to reach Megatron | https://tailscale.com/download, then sign in to the owner's tailnet |
| GitHub CLI `gh` | current | PRs, workflow runs, attestation checks | `winget install GitHub.cli`, then `gh auth login` as `Kar6677thik` |
| `kubectl` | within one minor version of the cluster's k3s (check with `kubectl version`) | `deploy-app.ps1`, creating Secrets locally | `winget install Kubernetes.kubectl` |
| .NET SDK | **10.0.401** (orbit-cloud `global.json`) | Orbit, the catalog CLI, credentials tool | https://dotnet.microsoft.com/download |
| Node.js | 24.15 (orbit-cloud), 22+ (handbook) | Orbit's Angular app, this handbook | https://nodejs.org |
| PowerShell 7 | current | `release-orbit.ps1`, `smoke-container.ps1` (others run on Windows PowerShell 5.1) | `winget install Microsoft.PowerShell` |
| Docker Desktop | current | building Orbit and Identity images, disposable k3s tests | https://docker.com |
| Python 3 | any | small JSON parsing in some commands | https://python.org |

## Steps

```sh
# 1. Tailscale: sign in, then check you can see Megatron
tailscale status                       # lists megatron

# 2. SSH: your public key must be authorised on Megatron (see the private notes).
#    Add it from a machine that already has access, or at Megatron's keyboard.
export MEGATRON='<from private notes>'
ssh $MEGATRON 'echo ok'

# 3. Clone the repos
mkdir -p ~/Documents/Study/Projects && cd ~/Documents/Study/Projects
gh repo clone Kar6677thik/orbit-cloud
gh repo clone Kar6677thik/handbook
# also: Sprawl, slate.lib, AnythingTCG as needed

# 4. Build Orbit and run its tests (Windows PowerShell, from orbit-cloud)
#    ./scripts/build-local.ps1  then the test commands on the Orbit page

# 5. Build the handbook
cd handbook && npm install && npm run build
```

You should now be able to open `https://localhost:7443` after `./scripts/start-local.ps1` (see [Orbit](/services/orbit/#run-it-locally)), and `http://localhost:4321` after `npm run dev` in the handbook.

## The `.local` folder in orbit-cloud

`orbit-cloud/.local/` is git-ignored and holds the owner's working files: release records and bundles (`.local/releases/`) and the filled-in Identity manifest. Deployer kubeconfigs and copied keys must be deleted right after use.

**Don't wipe this folder** on the owner's laptop: it currently holds files that exist nowhere else (listed in the private notes). Move them to their proper place before replacing the laptop.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ssh $MEGATRON` times out | Tailscale isn't signed in on the laptop: [Can't reach Megatron](/runbooks/megatron-unreachable/) |
| kubectl on Megatron says `permission denied` loading its config file | prefix remote commands with `export KUBECONFIG=$HOME/.kube/config;` |
| `no matches found` from a kubectl command on Megatron | Megatron's shell is zsh, which expands `[*]`; quote the argument |
| A second `sudo` in one non-interactive SSH session fails | put the commands in one script and run it with a single `sudo` |
| `#Requires -Version 7.0` error | run that script with `pwsh`, not `powershell` |
