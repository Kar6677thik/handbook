# Handbook: rules for agents and contributors

This repository **and** the site built from it (book.karthiksurkanti.in) are **public**. Anything written here is readable by anyone, forever (git history, search engines, published images).

## Rule 1: nothing that helps someone attack the home server

Never put any of the following in a page, a commit, a code comment or a commit message. It does not matter that the detail is "only internal" or "only reachable on the tailnet".

- **Addresses:** IP addresses of any kind (LAN, tailnet/CGNAT `100.64.0.0/10`, cluster `10.x`, pod/service IPs, ClusterIPs), MAC addresses, the tailnet name or any `*.ts.net` hostname, internal hostnames.
- **How to get in:** SSH usernames and targets, ports (SSH, NodePorts, admin ports, Funnel ports, database ports), tunnel IDs, device tags, kubeconfig contents, API server endpoints.
- **Where credentials sit:** file paths of keys, tokens, certificates, kubeconfigs, password files or backups; Secret **key** names; sudoers rules; root-owned script paths.
- **Security posture:** firewall state or rules, what is exposed and how (e.g. Funnel, NodePorts reachable on a LAN), missing encryption, unpatched or outdated software, lists of weak spots or open exposures, services running on the host.
- **Exact versions** of the OS, kernel, k3s or other host software.
- **Identifiers:** owner subject IDs, account IDs, emails.
- Obviously: secret values, tokens, passwords, keys (this was always the rule).

## What to write instead

- Describe **what** something is and **how** to operate it, using **placeholders** for anything specific: `$MEGATRON` (the SSH target), `<tailnet>`, `<ClusterIP>`, `<port>`.
- Say where the real value is kept: **the owner's private ops notes** (see `src/content/docs/start-here/private-details.md`). Never copy the value here.
- Security gaps, exposures and their fixes are tracked in the owner's private notes, not in this repo. A page may say "see private notes" but must not describe the gap.
- Public hostnames that are meant to be public (for example `book.`, `lib.`) are fine. Anything else is not.

## Enforcement

`npm run check:confidential` (run automatically before `npm run build`, so CI fails too) scans the docs for addresses, tailnet names, user@host targets, home paths and similar patterns. It uses generic patterns only. **Never add a real value to its pattern list**, because that file is public too. If it flags something, remove the detail; don't weaken the check.

## Other conventions

- Commits are authored by the owner only: no `Co-Authored-By` or "Generated with" lines.
- Never put secrets in the docs, only where they are stored (and only at the level of detail Rule 1 allows).
- See `README.md` and `src/content/docs/start-here/writing-docs.md` for writing conventions.
