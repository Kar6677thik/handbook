---
title: Secrets management
description: Where secrets are kept, how applications read them, and how to add one.
owner: Kar6677thik
sidebar:
  order: 2
---

There is no secrets vault. Secrets live in four kinds of place: **Kubernetes Secrets** on Megatron, **credential files on Megatron**, **GitHub repository secrets**, and the **owner's Google Drive and password manager**. This page says which kind holds what. Exact Secret names, key names and file paths are in the owner's private notes ([Private details](/start-here/private-details/)).

## Where secrets live

| Kind of secret | Stored in |
| --- | --- |
| App runtime secrets (tokens, keys, passwords the apps use) | Kubernetes Secrets, each in its app's own namespace |
| Tunnel credentials, cluster admin kubeconfig | files on Megatron |
| CI deploy credentials | GitHub repository and environment secrets |
| Orbit / Identity owner password verifier and authenticator key | Google Drive (the files) and the password manager (the authenticator setup key) |
| Orbit Identity signing, encryption and admin keys | Google Drive |
| Vendor logins (Cloudflare, Tailscale, GitHub, registrar) | TODO: password manager? |
| `sudo` password on Megatron | the owner's password manager |

To see what exists without ever printing a value, on Megatron:

```sh
kubectl get secrets -A --field-selector type!=kubernetes.io/service-account-token
kubectl -n <ns> get secret <name> -o go-template='{{range $k,$v := .data}}{{$k}} {{end}}'   # key names only
```

## How applications read secrets

- **Catalog apps:** the spec's `secretEnv` maps an environment variable to a Secret key in the app's own namespace; the operator creates the Secret by hand before the release. Plain `env` names that look secret (`*_TOKEN`, `*_KEY`, `*_PASSWORD`) are rejected.
- **Orbit and Identity:** Secrets mounted as read-only files, loaded at startup only.
- **Slate:** referenced from the deploy templates on Megatron; changes need a restart.

## Add or change a secret

Create it on the laptop and stream it over SSH, so no file with the value lands on Megatron and nothing prints:

```sh
kubectl create secret generic <name> -n <namespace> --from-file=<key>=<local file> --dry-run=client -o yaml \
  | ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl apply -f -'
ssh $MEGATRON 'export KUBECONFIG=$HOME/.kube/config; kubectl -n <namespace> rollout restart deploy/<app>'
```

Then delete the local file, and keep the source copy in the place the table above names.

## If a secret leaks

1. Rotate it immediately. See [Offboarding & rotation](/access/offboarding-and-rotation/).
2. Check access logs for use of the leaked secret.
3. Treat it as an incident. See [Incident response](/runbooks/incident-response/).
