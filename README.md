# Runbook

The documentation for our systems: what they are, how they work, and how to run, fix, and develop them, written for people with no AI tools to rely on.

**Read the docs as plain files:** start at [`src/content/docs/start-here/overview.md`](src/content/docs/start-here/overview.md). You don't need the website.

## Run the site

Requires Node.js 22+.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/, fails on broken internal links
npm run preview   # serve dist/
npm run audit     # stale / unverified / unowned pages and open TODOs
```

`dist/` is plain HTML with built-in offline search, so any static host will serve it. Keep a copy somewhere you can reach during an outage.

## Layout

```text
src/content/docs/   the pages (folder = sidebar section)
templates/          page templates to copy (not published)
scripts/audit.mjs   docs health report
src/components/     PageTitle override: owner / last-verified bar
astro.config.mjs    site config and sidebar order
```

Built with [Astro Starlight](https://starlight.astro.build/). Why: [ADR 0001](src/content/docs/architecture/decisions/0001-docs-as-markdown.md). How to contribute: [Writing & maintaining these docs](src/content/docs/start-here/writing-docs.md).
