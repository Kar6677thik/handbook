#!/usr/bin/env node
// Fails if the public docs contain details that would help someone attack the
// home server: addresses, tailnet names, user@host targets, ports, credential
// paths, security posture. See CLAUDE.md, "Rule 1".
//
// Patterns are deliberately GENERIC. Never add a real address, name or value
// here: this file is public too. If it flags something, remove the detail.
//
//   npm run check:confidential      (also runs before every `npm run build`)

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN = ['src/content', 'src/components', 'templates', 'README.md'];
const EXT = /\.(mdx?|astro|ts|mjs|js|ya?ml|txt)$/;

// Harmless values that look like the patterns below.
const ALLOWED = [/\b127\.0\.0\.1\b/g, /\b0\.0\.0\.0\b/g, /\blocalhost:\d+/g];

const RULES = [
	['IP address', /\b(?:\d{1,3}\.){3}\d{1,3}\b/],
	['IP range', /\b\d{1,3}\.\d{1,3}\.0\.0\/\d+/],
	['tailnet hostname', /\.ts\.net\b/i],
	['user@host target', /\b[a-z_][a-z0-9_.-]*@(?:\d|[a-z0-9-]+\.(?:local|lan|home|internal)\b)/i],
	['ssh with a literal user', /\bssh\b[^\n`]*\s[a-z_][a-z0-9_-]*@[^\s$<]/i],
	['host:port', /\b(?=[a-z0-9.-]*[a-z])[a-z0-9.-]+:\d{2,5}\b(?!\/\d)/i],
	['home directory path', /(?<![\w.])\/home\/[a-z_]/i],
	['credential/config path', /~\/\.(?:ssh|kube|cloudflared|aws|config\/)|\/etc\/(?:sudoers|rancher|ssh)|\/usr\/local\/(?:sbin|lib)\//],
	['privileged access config', /\bsudoers\b|NOPASSWD/i],
	['firewall details', /\b(?:ufw|iptables|nftables)\b/i],
	['tailnet tag', /\btag:[a-z]/i],
	['Tailscale Funnel', /\bfunnel\b/i],
	['NodePort number', /\bNodePorts?\b[^\n]*\b3\d{4}\b/],
	['UUID / account identifier', /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i],
	['tunnel/credential file id', /\b[0-9a-f]{8}-…|\b[0-9a-f]{8}-\.\.\./i],
];

async function* walk(path) {
	let entries;
	try {
		entries = await readdir(path, { withFileTypes: true });
	} catch {
		yield path; // a file
		return;
	}
	for (const e of entries) {
		const p = join(path, e.name);
		if (e.isDirectory()) yield* walk(p);
		else if (EXT.test(e.name)) yield p;
	}
}

const findings = [];
for (const target of SCAN) {
	for await (const file of walk(join(ROOT, target))) {
		let text;
		try {
			text = await readFile(file, 'utf8');
		} catch {
			continue;
		}
		text.split(/\r?\n/).forEach((raw, i) => {
			let line = raw;
			for (const a of ALLOWED) line = line.replace(a, '');
			for (const [name, re] of RULES) {
				if (re.test(line)) findings.push(`${relative(ROOT, file).replaceAll('\\', '/')}:${i + 1}  [${name}]  ${raw.trim().slice(0, 140)}`);
			}
		});
	}
}

if (findings.length) {
	console.error(`Confidential-detail check FAILED: ${findings.length} finding(s). See CLAUDE.md, Rule 1.\n`);
	for (const f of findings) console.error('  ' + f);
	console.error('\nRemove the detail (use a placeholder such as $MEGATRON or <tailnet>); do not weaken this check.');
	process.exit(1);
}
console.log('Confidential-detail check passed.');
