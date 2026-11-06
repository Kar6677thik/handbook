---
title: Codebase guide
description: How the code is laid out, the conventions we follow, and where to start reading.
sidebar:
  order: 2
---

## Repositories

| Repo | Contains | Language |
| --- | --- | --- |
| TODO | TODO | TODO |

## Layout

TODO: An annotated tree of the main repository, showing only the folders that matter.

```text
src/
  api/        # TODO: HTTP handlers
  domain/     # TODO: business logic, with no framework code
  jobs/       # TODO: background workers
migrations/   # TODO: database migrations; never edit one that has already run
```

## Where to start reading

TODO: Name the three or four files that, once understood, explain most of the system. The entry point, the core model, the most important flow.

## Conventions

- TODO: Naming, error handling, logging, how to add an endpoint, how to add a migration.
- TODO: Formatter and linter, and the commands to run them.

## Code that was AI-generated

TODO: Note any areas that were mostly written by AI tools and never fully reviewed by a person. Treat them carefully, and add tests before changing them.
