---
title: A catalog release is refused or fails
description: deploy-app.ps1 refuses a bundle or reports Failed or Unknown, or the handbook stops updating.
owner: Kar6677thik
---

**Symptoms:** `scripts/deploy-app.ps1` stops with a refusal, ends with **Failed** or **Unknown**, or the handbook site no longer changes after pushes.
**Impact:** the new version isn't live. In every case below the old version keeps serving.
**Urgency:** within the day.

Background: [Catalog apps](/operations/catalog-apps/). Shorthand: `M="$MEGATRON"; K='export KUBECONFIG=$HOME/.kube/config;'`

## 1. Find your case

| Message or sign | Case |
| --- | --- |
| the live spec is not the one this release replaces | A: out of order or drift |
| checksum mismatch | B: bundle edited or corrupted |
| `namespaces "app-…" not found` during a dry run | C: namespace missing |
| the admission policy denied the request | D: image or spec breaks the rules |
| result **Failed** | E: new pods never became healthy |
| result **Unknown** | F: the tool couldn't tell |
| conflict on `.spec.template.spec.containers[name="app"].image` | G: the updater owns the image field |
| handbook not updating after a push | H: updater |

## 2. Fix

**A. Previous spec mismatch.** Compare the live annotation with `previousSpecSha256` in `release.json`:

```sh
ssh $M "$K kubectl -n app-<app> get deploy <app> -o jsonpath='{.metadata.annotations.orbit\.catalog/spec-sha256}'"
```

Someone released a different spec out of order, applied the catalog by hand, or the bundle was built from the wrong source commit. Release the commits in order, or rebuild the bundle from the right merge commit, then retry. (A `rollout undo` does not cause this: it doesn't touch the annotation.) Never edit `release.json` to force it.

**B. Checksum mismatch.** Download the bundle again with `gh run download`. Never edit files inside a bundle.

**C. Namespace not found.** Apply the Namespace document first, then the rest ([Onboard](/operations/catalog-apps/#onboard-a-new-app)).

**D. Admission denied.** Read the message. Usually a tag instead of a digest, an image outside `ghcr.io/kar6677thik/`, missing limits, or a second container. Fix the spec or the image ([image rules](/operations/catalog-apps/#what-an-apps-image-must-be)).

**E. Failed.** The old pods are still serving. Find out why the new ones never became ready:

```sh
ssh $M "$K kubectl -n app-<app> get pods"
ssh $M "$K kubectl -n app-<app> describe pod <new pod> | tail -30"
ssh $M "$K kubectl -n app-<app> logs <new pod> --tail=100"
```

Common causes: the image writes outside `/tmp` (read-only root filesystem), runs as root or a non-numeric user, listens on the wrong port, or the health path doesn't return 200. Fix the image and release again, or [roll back](/operations/catalog-apps/#roll-back).

**F. Unknown.** Look before acting: `ssh $M "$K kubectl -n app-<app> get deploy,rs,pods -o wide"`. Don't retry blindly.

**G. Image field conflict (updater apps).** Expected, not yet seen: the updater changes the image, so a catalog release that changes other fields conflicts on it, and `deploy-app.ps1` can't force it yet. TODO: agree a procedure.

**H. Handbook not updating.**

```sh
ssh $M "$K kubectl -n app-handbook get deploy handbook -o jsonpath='{.metadata.annotations}'"
ssh $M "$K kubectl -n orbit-updater get jobs --sort-by=.metadata.creationTimestamp | tail -3"
```

- `orbit.updater/failed-digest` equals the newest image: that build rolled out badly and was put back. Fix the site and push again (a new digest). If the cause was outside the image and is now fixed, clear the mark to retry: `ssh $M "$K kubectl -n app-handbook annotate deploy handbook orbit.updater/failed-digest-"`.
- Jobs failing: `ssh $M "$K kubectl -n orbit-updater logs job/<name>"`.
- CronJob suspended: `ssh $M "$K kubectl -n orbit-updater get cronjob handbook-updater -o jsonpath='{.spec.suspend}'"`.
- CI didn't move `:latest`: check the handbook repo's latest `release` workflow run.

## 3. Verify

`deploy-app.ps1` reports **Succeeded**, or the pod runs the expected digest:

```sh
ssh $M "$K kubectl -n app-<app> get pods -o jsonpath='{.items[*].status.containerStatuses[*].imageID}'"
```

## Escalate if

The admission policy or onboarding kit itself looks wrong. That is an Orbit bug: fix it in orbit-cloud, with a case in `tests/Orbit.Kubernetes.Integration/catalog-release.ps1`.
