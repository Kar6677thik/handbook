---
title: Inventory
description: Every account, server, and managed resource we pay for or depend on.
sidebar:
  order: 1
---

If something we run is missing from this page, nobody will look after it. When you find an unlisted resource, add it here.

## Cloud accounts

| Provider | Account / project ID | Purpose | Billing owner | Console access |
| --- | --- | --- | --- | --- |
| TODO: AWS | `123456789012` | Production | TODO | See [Access inventory](/access/access-inventory/) |
| TODO: AWS | `210987654321` | Staging | TODO | |

## Compute

| Name | Type | Environment | Region | Managed by | Notes |
| --- | --- | --- | --- | --- | --- |
| TODO: `api-prod` | e.g. ECS service / VM / k8s deployment | prod | TODO | Terraform `infra/api.tf` | |

## Databases & storage

| Name | Engine / type | Environment | Size | Backups | Managed by |
| --- | --- | --- | --- | --- | --- |
| TODO: `main-db` | Postgres 16 | prod | TODO | [Backups](/operations/backups-and-restore/) | TODO |

## Infrastructure as code

TODO: Where is the infrastructure defined (Terraform, Pulumi, CloudFormation, or "clicked together in the console")? Which repo and folder? How is it applied, and where is the state stored?

```sh
# TODO: the exact commands to preview and apply infrastructure changes
terraform -chdir=infra plan
terraform -chdir=infra apply
```

## Things created by hand

TODO: List every resource that is **not** in infrastructure-as-code. These are the easiest to lose track of, and the hardest to rebuild.
