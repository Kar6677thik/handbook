---
title: '0001: Keep documentation as Markdown in git'
description: Why these docs are Markdown files built with Astro Starlight.
lastVerified: 2026-11-06
reviewEvery: 365
---

**Status:** Accepted · **Date:** 2026-11-06

## Context

Until now, AI tools did most of our operational work and answered most questions about our systems, so very little was written down. With those tools gone, humans need a single, trustworthy place that explains everything. That place must keep working even when other systems are down.

## Decision

- Write all documentation as Markdown files in one git repository.
- Render them as a static website with [Astro Starlight](https://starlight.astro.build/). It provides built-in offline search, navigation, and dark mode.
- Give each page an owner and a `lastVerified` date, and flag stale pages automatically.

## Consequences

- **Good:** The docs can be read with no tooling at all: a text editor or the git host is enough. The built site is plain HTML and can be hosted anywhere or opened from a laptop during an outage. Every change is reviewed and versioned like code.
- **Bad:** Editing needs basic git and Markdown skills. Non-engineers may need a short walkthrough.
- **Rejected alternatives:** Wiki tools (Confluence, Notion) are hosted SaaS, so they can go offline or be lost when an account lapses, and their content is hard to export. Docusaurus and MkDocs would also work, but Starlight needed the least setup and its defaults are cleaner.
