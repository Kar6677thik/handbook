---
title: Architecture decisions
description: A log of significant technical decisions and the reasons behind them.
sidebar:
  order: 0
  label: All decisions
---

When a decision is expensive to reverse, or someone will one day ask "why on earth is it like this?", record it as a decision record (ADR).

## How to add one

1. Copy `templates/decision.md` into this folder as `NNNN-short-title.md`, using the next number.
2. Fill it in. Keep it short; one page is plenty.
3. Never delete an old decision. If a later decision replaces it, set the old one's status to `Superseded by NNNN`.

## Log

| # | Decision | Status |
| --- | --- | --- |
| 0001 | [Keep documentation as Markdown in git](/architecture/decisions/0001-docs-as-markdown/) | Accepted |
| TODO | Back-fill the big past decisions: hosting provider, database, language/framework, auth approach | |
