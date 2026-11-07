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
| Orbit Identity | OAuth server for Slate MCP and Sprawl MCP | High (AI apps lose access to both MCPs) | Kar6677thik | [Orbit Identity](/services/orbit-identity/) |
| Handbook | This site: the engineering handbook | Low | Kar6677thik | [Handbook](/services/handbook/) |
| Slate (API, web, MCP) | Notes app | TODO | Kar6677thik | TODO: not documented yet |
| Sprawl (API, MCP) | Canvas app | TODO | Kar6677thik | TODO: not documented yet |
| AnythingTCG | TODO | TODO | Kar6677thik | TODO: not documented yet |

**Criticality levels**

- **High:** if it's down, customers are blocked or we lose money or data. Fix it immediately, any time of day.
- **Medium:** a feature is degraded. Fix it the same working day.
- **Low:** internal-only or cosmetic. Fix it when convenient.
