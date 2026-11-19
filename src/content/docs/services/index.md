---
title: Service catalog
description: Every service we run, its owner, and how critical it is.
sidebar:
  order: 0
  label: Catalog
---

Every deployable thing gets a row in this table and its own page. The page layout is in `templates/service.md`.

| Service | What it does | Criticality | Owner | Page |
| --- | --- | --- | --- | --- |
| Orbit | Private cluster console and the app catalog | Low (nothing depends on it at runtime) | Kar6677thik | [Orbit](/services/orbit/) |
| Orbit Hub | One MCP connector in front of my apps (Hey Ann now; the rest next) | Medium (the per-app connectors still work) | Kar6677thik | [Orbit Hub](/services/orbit-hub/) |
| Orbit Identity | OAuth server for the Slate, Sprawl, Socrates and Hey Ann MCPs, and for the Hub | High (AI apps lose access to every MCP) | Kar6677thik | [Orbit Identity](/services/orbit-identity/) |
| Handbook | This site: the engineering handbook | Low | Kar6677thik | [Handbook](/services/handbook/) |
| Slate (API, web, MCP) | Markdown library | High (my notes) | Kar6677thik | [Slate](/services/slate/) |
| Sprawl (API, MCP) | Infinite canvas | Medium | Kar6677thik | [Sprawl](/services/sprawl/) |
| Socrates | Spaced-repetition quiz | Medium | Kar6677thik | [Socrates](/services/socrates/) |
| Hey Ann | Kanban board run by Claude | Medium | Kar6677thik | [Hey Ann](/services/hey-ann/) |
| AnythingTCG | Trading-card game server (in progress) | Low | Kar6677thik | [AnythingTCG](/services/anythingtcg/) |

**Criticality levels**

- **High:** if it's down, customers are blocked or we lose money or data. Fix it immediately, any time of day.
- **Medium:** a feature is degraded. Fix it the same working day.
- **Low:** internal-only or cosmetic. Fix it when convenient.
