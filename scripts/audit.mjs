#!/usr/bin/env node
// Reports which docs pages need attention: stale, never verified, unowned,
// or still containing TODO markers. Plain Node, no dependencies.
//
//   npm run audit            # print the report
//   npm run audit -- --strict  # also exit 1 if any page is stale (for CI)

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const DAY = 24 * 60 * 60 * 1000;
const strict = process.argv.includes('--strict');

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else if (/\.mdx?$/.test(entry.name)) yield path;
	}
}

function frontmatter(text) {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const data = {};
	if (!match) return data;
	for (const line of match[1].split(/\r?\n/)) {
		const kv = line.match(/^(\w+):\s*(.*)$/); // top-level keys only
		if (kv) data[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '').trim();
	}
	return data;
}

const rows = [];
for await (const file of walk(ROOT)) {
	const text = await readFile(file, 'utf8');
	const fm = frontmatter(text);
	if (fm.template === 'splash') continue;
	const reviewEvery = Number(fm.reviewEvery) || 90;
	const verified = fm.lastVerified ? new Date(fm.lastVerified) : null;
	const age = verified ? Math.floor((Date.now() - verified.getTime()) / DAY) : null;
	rows.push({
		page: relative(ROOT, file).replaceAll('\\', '/'),
		owner: fm.owner && fm.owner !== 'TODO' ? fm.owner : null,
		age,
		stale: age !== null && age > reviewEvery,
		todos: (text.match(/\bTODO\b/g) ?? []).length,
	});
}
rows.sort((a, b) => a.page.localeCompare(b.page));

const section = (title, list, fmt) => {
	console.log(`\n${title} (${list.length})`);
	for (const r of list) console.log(`  ${fmt(r)}`);
};

const stale = rows.filter((r) => r.stale);
const unverified = rows.filter((r) => r.age === null);
const unowned = rows.filter((r) => !r.owner);
const withTodos = rows.filter((r) => r.todos > 0).sort((a, b) => b.todos - a.todos);
const totalTodos = rows.reduce((n, r) => n + r.todos, 0);

console.log(`Docs audit: ${rows.length} pages`);
section('Stale: verified too long ago', stale, (r) => `${r.page}  (${r.age} days)`);
section('Never verified', unverified, (r) => r.page);
section('No owner', unowned, (r) => r.page);
section(`Open TODOs: ${totalTodos} total`, withTodos, (r) => `${String(r.todos).padStart(3)}  ${r.page}`);

const done = rows.filter((r) => !r.stale && r.age !== null && r.owner && r.todos === 0).length;
console.log(`\nComplete & current: ${done}/${rows.length} pages`);

if (strict && stale.length) process.exit(1);
