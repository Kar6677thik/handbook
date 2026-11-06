---
title: Templates
description: Starting points for new pages.
lastVerified: 2026-11-06
reviewEvery: 365
sidebar:
  order: 3
---

Templates are kept in the `templates/` folder at the root of the repository. They are not published as pages. Copy one into the right folder under `src/content/docs/` and fill it in.

| Template | Use it for | Copy into |
| --- | --- | --- |
| `templates/service.md` | A service, app, or worker | `src/content/docs/services/` |
| `templates/runbook.md` | A fix for one specific problem | `src/content/docs/runbooks/` |
| `templates/decision.md` | An architecture decision record | `src/content/docs/architecture/decisions/` |
| `templates/page.md` | Anything else | Wherever it fits |

```sh
cp templates/service.md src/content/docs/services/payments.md
```

See [Writing & maintaining these docs](/start-here/writing-docs/) for the frontmatter fields and the rules.
