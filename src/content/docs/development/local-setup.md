---
title: Local setup
description: From a blank machine to the system running locally.
sidebar:
  order: 1
---

The goal: a new engineer gets from nothing to a running system in one afternoon, using only this page. If it took you longer, fix the step that slowed you down.

## Prerequisites

| Tool | Version | Install |
| --- | --- | --- |
| Git | any recent | https://git-scm.com |
| TODO: Node.js / Python / Go | TODO | TODO |
| TODO: Docker | TODO | TODO |

## Steps

```sh
# 1. Clone
git clone TODO:repo-url
cd TODO

# 2. Install dependencies
TODO

# 3. Configure. Ask for the dev secrets; see /access/secrets-management/
cp .env.example .env

# 4. Start dependencies (database, queue, ...)
TODO: e.g. docker compose up -d

# 5. Create and seed the database
TODO

# 6. Run
TODO
```

You should now be able to open TODO: `http://localhost:3000` and log in as TODO: seed user.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| TODO: port already in use | TODO |
