// Reads every docs page at build time and works out, per section, what exists
// and how far each page can be trusted. Same rules as scripts/audit.mjs.
import { getCollection } from 'astro:content';
import { sections } from '../sections.mjs';

const DAY = 24 * 60 * 60 * 1000;

export type PageState = 'fresh' | 'stale' | 'unverified';

export interface PageInfo {
	title: string;
	description?: string;
	href: string;
	owner?: string;
	state: PageState;
	verifiedOn?: Date;
	todos: number;
	order: number;
}

export interface SectionInfo {
	dir: string;
	label: string;
	tab: string;
	about: string;
	href: string;
	pages: PageInfo[];
	verified: number;
	todos: number;
}

export async function loadHandbook() {
	const docs = await getCollection('docs', (e) => e.data.template !== 'splash' && e.id !== '404');
	const now = Date.now();

	const pages = docs.map((e) => {
		const { title, description, owner, lastVerified, reviewEvery, sidebar } = e.data;
		const age = lastVerified ? Math.floor((now - lastVerified.getTime()) / DAY) : null;
		const state: PageState = age === null ? 'unverified' : age > reviewEvery ? 'stale' : 'fresh';
		const id = e.id.replace(/\/index$/, '');
		return {
			dir: id.split('/')[0],
			info: {
				title: sidebar?.label ?? title,
				description,
				href: `/${id}/`,
				owner: owner && owner !== 'TODO' ? owner : undefined,
				state,
				verifiedOn: lastVerified,
				todos: (e.body?.match(/\bTODO\b/g) ?? []).length,
				order: sidebar?.order ?? 50,
			} satisfies PageInfo,
		};
	});

	const bySection: SectionInfo[] = sections.map((s) => {
		const list = pages
			.filter((p) => p.dir === s.dir)
			.map((p) => p.info)
			.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
		return {
			...s,
			href: list[0]?.href ?? '/',
			pages: list,
			verified: list.filter((p) => p.state === 'fresh').length,
			todos: list.reduce((n, p) => n + p.todos, 0),
		};
	});

	const all = bySection.flatMap((s) => s.pages);
	return {
		sections: bySection,
		totals: {
			pages: all.length,
			verified: all.filter((p) => p.state === 'fresh').length,
			stale: all.filter((p) => p.state === 'stale').length,
			todos: all.reduce((n, p) => n + p.todos, 0),
		},
	};
}

export const fmtDate = (d: Date) =>
	d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
