# Handbook

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
src/sections.mjs    the nine sections: order, labels, entry pages (drives sidebar + home)
src/components/     PageTitle (trust stamp), SiteTitle (wordmark), Hero + home/ (home page)
src/lib/handbook.ts reads every page at build time for the home page's index and counts
src/styles/         custom.css (theme + doc pages), home.css (home page), fonts.css
src/assets/archive/ archival photographs (public domain, credited in the site footer)
public/fonts/       Pilcrow Rounded, self-hosted so the site works offline
templates/          page templates to copy (not published)
scripts/audit.mjs   docs health report
astro.config.mjs    site config
```

## Design

One shape runs the whole UI: the **index tab** of a binder divider. It is the current page in the sidebar, the trust stamp under every title, the buttons, the photo captions, the home page's section index and the footer wordmark. Palette: white, near-black ink, one mint accent (amber only for stale pages). Body and headings use one typeface. Keep new UI inside those rules.

Built with [Astro Starlight](https://starlight.astro.build/). Why: [ADR 0001](src/content/docs/architecture/decisions/0001-docs-as-markdown.md). How to contribute: [Writing & maintaining these docs](src/content/docs/start-here/writing-docs.md).
