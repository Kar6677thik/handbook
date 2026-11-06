---
title: Secrets management
description: Where secrets are kept, how applications read them, and how to add one.
sidebar:
  order: 2
---

## Where secrets live

TODO: The tool (1Password, Bitwarden, Vault, AWS Secrets Manager, ...), how to get access, and how it's organised.

| Kind of secret | Stored in | Path / vault |
| --- | --- | --- |
| TODO: Production app secrets | TODO | TODO |
| TODO: Developer `.env` values | TODO | TODO |
| TODO: Vendor logins | TODO | TODO |
| TODO: Break-glass / root credentials | TODO | TODO |

## How applications read secrets

TODO: Are they injected as environment variables at deploy time, or read from a secrets API at runtime? Which file or pipeline wires them in?

## Add or change a secret

```sh
# TODO: exact steps, including how to roll the change out to running services
```

## If a secret leaks

1. Rotate it immediately. See [Offboarding & rotation](/access/offboarding-and-rotation/).
2. Check access logs for use of the leaked secret.
3. Treat it as an incident. See [Incident response](/runbooks/incident-response/).
