---
title: Catalog apps
description: Onboard, release, roll back, auto-update and publish a stateless app through the Orbit catalog, step by step.
owner: Kar6677thik
sidebar:
  order: 4
---

The Orbit catalog is how new stateless apps get onto Megatron. Each app has one reviewed spec, `catalog/apps/<name>.yaml`, in [orbit-cloud](https://github.com/Kar6677thik/orbit-cloud). GitHub only **builds a sealed bundle**; the **apply happens from the owner's laptop** with a 30-minute token that can touch nothing but that app. Background: [Orbit](/services/orbit/).

Apps in the catalog today: `handbook`, `sprawl-mcp`.

## Before you start

Always reach Megatron as `$MEGATRON`. There is no `megatron` SSH alias on the laptop, and the bare name resolves to something else.

On the laptop (Windows, Git Bash plus PowerShell), in a clone of orbit-cloud:

- [ ] Tailscale is up and signed in: `tailscale status` lists `megatron`.
- [ ] `gh auth status` shows you logged in as `Kar6677thik`.
- [ ] .NET SDK 10 and the `kubectl` client installed (the catalog CLI and `deploy-app.ps1` need them).
- [ ] `ssh $MEGATRON 'echo ok'` works.

Shorthand used below:

```sh
M="$MEGATRON"
K='export KUBECONFIG=$HOME/.kube/config;'      # needed for every non-interactive kubectl on Megatron
```

## What an app's image must be

The admission policy rejects anything else, even when an admin applies it.

- In `ghcr.io/kar6677thik/`, **public**, referenced by **digest** (`@sha256:…`), never by tag.
- A single linux/amd64 image. If you retag with `docker buildx imagetools create`, pass `--prefer-index=false`.
- A build-provenance attestation (`actions/attest-build-provenance` in the app's workflow).
- A **numeric** non-root `USER` (for example `USER 101`).
- Works with a **read-only root filesystem**. Only `/tmp` is writable (16 Mi, in memory).
- Listens on **one port ≥ 1024** (8080 is normal) and answers a **health path** with 200.
- One container, no service-account token, no volumes except `emptyDir`.

The handbook's `Dockerfile` and `deploy/nginx.conf` are a working example for a static site.

## Release a new version

Use this for every change to an existing catalog app (new image, env change). Takes about 15 minutes.

**1. Check the image.**

```sh
APP=sprawl-mcp
DIGEST=sha256:<64 hex>
gh attestation verify oci://ghcr.io/kar6677thik/$APP@$DIGEST --owner Kar6677thik

# the image must be public, or the pod hits ImagePullBackOff. Expect 200:
T=$(curl -s "https://ghcr.io/token?scope=repository:kar6677thik/$APP:pull" | python -c 'import sys,json;print(json.load(sys.stdin)["token"])')
curl -s -o /dev/null -w '%{http_code}\n' -I -H "Authorization: Bearer $T" -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json' https://ghcr.io/v2/kar6677thik/$APP/manifests/$DIGEST
```

Check that the output's source repository commit and the signer workflow (`…/release.yml@refs/heads/main`) are what you expect.

**2. Change the spec and open a PR.**

```sh
git fetch origin && git checkout -b catalog/$APP-${DIGEST:7:7} origin/main
# edit catalog/apps/$APP.yaml: change only `image:` (or env)
dotnet run --project tools/Orbit.Catalog.Cli -- validate catalog
git add catalog/apps/$APP.yaml && git commit -m "Release $APP ${DIGEST:7:12}" && git push -u origin HEAD
gh pr create --fill
```

Wait for the `verify` check, then **merge with a merge commit** (the owner merges): `gh pr merge <pr-number> --merge`. A squash merge would also work, but every release so far used merge commits.

**3. Wait for CI on the merge commit.**

```sh
SHA=$(gh pr view <pr-number> --json mergeCommit -q .mergeCommit.oid)
gh run list --workflow ci.yml --commit $SHA          # wait for success
```

**4. Build and download the bundle.**

```sh
gh workflow run app-bundle.yml --ref main -f source_sha=$SHA -f app=$APP
gh run list --workflow app-bundle.yml -L 1           # note the run id
gh run watch <run-id> --exit-status
gh run download <run-id> --dir .local/releases/bundles/$APP-${SHA:0:7}
cd .local/releases/bundles/$APP-${SHA:0:7}/orbit-app-$APP-*/ && sha256sum -c SHA256SUMS && cat release.json && cd -
```

**5. Check the bundle replaces what is live.** `previousSpecSha256` in `release.json` must equal:

```sh
ssh $M "$K kubectl -n app-$APP get deploy $APP -o jsonpath='{.metadata.annotations.orbit\.catalog/spec-sha256}'"
```

If they differ, stop: someone released out of order or changed the app by hand. Find out which before going on.

**6. Make a 30-minute deployer kubeconfig.** In Git Bash, from the orbit-cloud root. Never print the token. The 30 minutes start now, so carry on straight through steps 7 and 8.

```sh
umask 077
TOKEN=$(ssh $M "$K kubectl create token app-deployer -n app-$APP --duration=30m")
CA=$(ssh $M "$K kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'")
cat > .local/releases/$APP-deployer.kubeconfig <<EOF
apiVersion: v1
kind: Config
clusters: [{name: megatron, cluster: {server: "https://127.0.0.1:26443", certificate-authority-data: "$CA"}}]
users: [{name: $APP-deployer, user: {token: "$TOKEN"}}]
contexts: [{name: $APP-deployer, context: {cluster: megatron, user: $APP-deployer, namespace: app-$APP}}]
current-context: $APP-deployer
EOF
unset TOKEN
```

**7. Open the API tunnel** in a second terminal and leave it running:

```sh
ssh -o ExitOnForwardFailure=yes -N -L 26443:127.0.0.1:6443 $MEGATRON
```

**8. Deploy.**

```powershell
# From the orbit-cloud root, with the step 7 tunnel open. <bundle dir> is the INNER folder:
# .local/releases/bundles/<app>-<sha7>/orbit-app-<app>-<sha>
powershell -File scripts/deploy-app.ps1 -Bundle <bundle dir> -Kubeconfig .local/releases/<app>-deployer.kubeconfig -Context <app>-deployer
```

It checks the checksums, refuses if the live spec is not the one this bundle replaces, does a server-side dry run, shows the diff, applies, waits for the new pods, and writes a record to `.local/releases/<app>/`. Result: **Succeeded**, **Failed** (new pods never became healthy; the old ones keep serving) or **Unknown** (look before doing anything else).

**9. Clean up.** Delete the kubeconfig (`rm .local/releases/$APP-deployer.kubeconfig`) and stop the tunnel with Ctrl+C. Exit code 255 from the tunnel is harmless.

**10. Check it works.**

```sh
ssh $M "$K kubectl -n app-$APP get pods -o wide"                       # Running, 0 restarts, new image
ssh $M "$K kubectl -n app-$APP logs deploy/$APP --tail=500 | grep -ci error"
IP=$(ssh $M "$K kubectl -n app-$APP get svc $APP -o jsonpath='{.spec.clusterIP}'")
ssh $M "curl -s -o /dev/null -w '%{http_code}\n' http://$IP/<health path>"     # expect 200
```

Then hit the app's real URL. For Sprawl MCP: `POST https://canvas-mcp.karthiksurkanti.in/mcp` must return **401** with `resource_metadata`, and `GET https://canvas-mcp.karthiksurkanti.in/.well-known/oauth-protected-resource/mcp` must return JSON.

## Roll back

**Normal way:** revert the release's merge commit, then release the revert exactly as above.

```sh
git checkout -b revert/$APP origin/main
git revert -m 1 <merge sha> && git push -u origin HEAD && gh pr create --fill
```

The reverted spec is byte-identical to the one before, so step 5's check passes and Kubernetes reuses the old ReplicaSet.

**Emergency (admin, faster):**

```sh
ssh $M "$K kubectl -n app-$APP rollout undo deploy/$APP"
```

`rollout undo` changes the pods but not the spec annotation, which still names the bad spec. Release the revert PR next: it passes step 5 and brings the spec and the cluster back in line. Don't release any other spec in between. kubectl now co-owns the image field, so a later release that changes the image may report a field conflict (untested).

## Onboard a new app

Done twice so far (`sprawl-mcp`, `handbook`).

1. Make sure the image meets [the rules above](#what-an-apps-image-must-be) and has a digest in GHCR.
2. Copy `catalog/apps/handbook.yaml` to `catalog/apps/<app>.yaml` and edit it. Then follow [Release a new version](#release-a-new-version) steps 1–5. For a first release, `previousSpecSha256` is `"none"`.
3. **Apply the onboarding kit** (first time only), with the admin kubeconfig on Megatron. It is `onboard.yaml` in the bundle:

   The Namespace must exist before the rest will dry-run, so split off the first document (the Namespace) into `ns.yaml`, then copy both up and apply:

   ```sh
   awk '/^---$/{exit} {print}' <bundle dir>/onboard.yaml > ns.yaml
   scp <bundle dir>/onboard.yaml ns.yaml $M:/tmp/
   ssh $M "$K kubectl apply --server-side --field-manager=orbit-catalog -f /tmp/ns.yaml"
   ssh $M "$K kubectl apply --server-side --field-manager=orbit-catalog --dry-run=server -f /tmp/onboard.yaml"
   ssh $M "$K kubectl apply --server-side --field-manager=orbit-catalog -f /tmp/onboard.yaml && rm /tmp/onboard.yaml /tmp/ns.yaml"
   ```

   It creates the namespace `app-<app>` (restricted, labelled `orbit.catalog/managed=true`), a quota, limit defaults, the `ingress-from-node-only` network policy, the `app-deployer` account, and a read binding for Orbit.
4. Create any Secrets the spec's `secretEnv` names, directly in `app-<app>`.
5. Do steps 6–10 of the release.
6. If it should be on the internet: [Make an app public](#make-an-app-public).
7. Add a service page to this handbook (`templates/service.md`) and a row in the [catalog](/services/).

## Make an app public

On Megatron, as the normal admin user. No sudo needed. Done for `auth` (Orbit Identity, not a catalog app), `canvas-mcp` and `book`.

```sh
ssh $MEGATRON
export KUBECONFIG=$HOME/.kube/config
kubectl -n app-<app> get svc <app> -o jsonpath='{.spec.clusterIP}'      # note the IP
cp $TUNNEL_CONFIG $TUNNEL_CONFIG.pre-<app>-$(date +%Y%m%d-%H%M%S)
nano $TUNNEL_CONFIG
```

Add the rule **directly above** the final `- service: http_status:404`:

```yaml
  - hostname: <host>.karthiksurkanti.in
    service: http://<ClusterIP>:80
    # optional: only expose some paths
    # path: ^/(mcp|\.well-known/oauth-protected-resource(/mcp)?)$
```

Then:

```sh
cloudflared tunnel ingress validate
cloudflared tunnel ingress rule https://<host>.karthiksurkanti.in/x        # shows which rule matches
systemctl --user restart $TUNNEL_SERVICE && systemctl --user is-active $TUNNEL_SERVICE
cloudflared tunnel route dns main <host>.karthiksurkanti.in
```

Check from outside: `curl -sI https://<host>.karthiksurkanti.in/`. To undo, copy the `.pre-` backup back over `config.yml` and restart the service.

## Automatic updates (the updater)

The handbook skips the PR-and-release loop: a CronJob deploys whatever its `:latest` tag points to. Defined in `deploy/updater/handbook.yaml` in orbit-cloud; [Handbook](/services/handbook/) describes it from the app's side.

- Every 5 minutes, `orbit-updater/handbook-updater` asks GHCR (anonymously) for the digest behind `ghcr.io/kar6677thik/handbook:latest`. If `:latest` is an index it takes the single linux/amd64 image inside, and it checks the served digest against the bytes it downloaded. If that digest differs from the live image, it pins the Deployment to it and waits up to 180 s.
- If the rollout fails, it puts the previous image back and records the digest in the annotation `orbit.updater/failed-digest`. **That digest is never retried.** On success it sets `orbit.updater/digest`.
- Its only permission: get and patch on Deployment `handbook` in `app-handbook`.

```sh
ssh $M "$K kubectl -n orbit-updater get jobs --sort-by=.metadata.creationTimestamp"
ssh $M "$K kubectl -n orbit-updater logs job/<job name>"
ssh $M "$K kubectl -n app-handbook get deploy handbook -o jsonpath='{.metadata.annotations}'"
ssh $M "$K kubectl -n orbit-updater create job --from=cronjob/handbook-updater handbook-updater-manual-\$(date +%s)"   # run now
```

**Emergency stop and pin a known-good image:**

```sh
ssh $M "$K kubectl -n orbit-updater patch cronjob handbook-updater -p '{\"spec\":{\"suspend\":true}}'"
ssh $M "$K kubectl -n app-handbook set image deploy/handbook app=ghcr.io/kar6677thik/handbook@sha256:<good digest>"
# after the fix is on :latest, set suspend back to false
```

**Add the updater to another app:**

1. Onboard the app normally.
2. Copy `deploy/updater/handbook.yaml` to `deploy/updater/<app>.yaml`. Rename `handbook-updater` to `<app>-updater` everywhere, and set `REPO`, `NS` and `DEPLOY` in the script and `resourceNames` in the Role. The container name stays `app`.
3. PR and merge it. The namespace `orbit-updater` already exists, so on Megatron run `kubectl apply --dry-run=server -f deploy/updater/<app>.yaml`, then `kubectl apply -f deploy/updater/<app>.yaml`.
4. Check: `kubectl auth can-i patch deployment/<app> -n app-<app> --as=system:serviceaccount:orbit-updater:<app>-updater` answers `yes`.
5. The app's workflow must move `:latest` only after a successful build, with `--prefer-index=false`.

Orbit's **Apps** page shows the handbook as "differs": the updater has moved its image past the catalog's bootstrap digest on purpose.

**Known gap:** a later catalog release of an updater app (to change resources, port or health path) fails with a server-side apply conflict on the image field, because the updater owns it. `deploy-app.ps1` has no option to force it yet (expected, not yet seen). TODO: decide how to handle it before the first time it's needed.
