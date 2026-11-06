---
title: Writing & maintaining these docs
description: How to add, edit, and verify pages, and the rules that keep the docs useful.
lastVerified: 2026-11-06
sidebar:
  order: 4
---

These docs only help if they are true. Any of us can edit them, and all of us should.

## Where the docs live

Each page is a Markdown file in `src/content/docs/`. You don't need the website to read them: a text editor or the code host's web view works too. The website adds search and navigation on top.

## Run the site locally

```sh
npm install        # once
npm run dev        # live preview at http://localhost:4321
npm run build      # build the static site into dist/ (also checks every internal link)
npm run preview    # serve the built site
npm run audit      # list stale pages, unverified pages, and open TODOs
```

To build, you need Node.js 22 or newer. The built site in `dist/` is plain HTML. Any web server can host it: nginx, S3, GitHub Pages, or a USB stick with `npx serve dist`.

## Add a page

1. Copy a template from `templates/` in the repository root. See [Templates](/reference/templates/).
2. Save it in the right folder under `src/content/docs/`. The folder decides which sidebar section it appears in.
3. Fill in the frontmatter (below), write the page, and remove the `TODO:` markers as you go.
4. Run `npm run build` to catch broken links.

## Frontmatter

```yaml
---
title: Payments service          # required
description: One-line summary.   # shows in search results
owner: Jane Doe                  # who keeps this page true
lastVerified: 2026-11-06         # when someone last checked it against reality
reviewEvery: 90                  # days before it is flagged stale (default 90)
sidebar:
  order: 2                       # optional: position within its section
---
```

## Rules

- **Write commands people can copy and paste.** Use exact commands, not "restart the service".
- **Never put secrets here.** Say *where* a secret is kept (e.g. "vault path `prod/db/admin`"), never the value itself.
- **Explain why, not just what.** The reasons behind a design are the first thing people forget. Record big ones as [decisions](/architecture/decisions/).
- **Verify, then date it.** Only change `lastVerified` after you've checked the page against the real system.
- **Mark gaps with `TODO:`** instead of guessing. `npm run audit` lists every one.
- **Update the docs in the same change as the system.** A pull request that changes infrastructure without updating its page isn't finished.
