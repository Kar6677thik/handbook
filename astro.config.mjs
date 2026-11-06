// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// Sidebar order = the order a new engineer should read things in.
export default defineConfig({
	site: 'https://book.karthiksurkanti.in',
	integrations: [
		starlight({
			title: 'Runbook',
			description: 'Everything a human needs to understand, run, and develop our systems.',
			lastUpdated: true, // shows git "last updated" date on each page
			editLink: {
				baseUrl: 'https://github.com/Kar6677thik/handbook/edit/main/',
			},
			customCss: ['./src/styles/custom.css'],
			components: {
				PageTitle: './src/components/PageTitle.astro',
			},
			plugins: [starlightLinksValidator()], // build fails on broken internal links
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start-here' } }] },
				{ label: 'Architecture', items: [{ autogenerate: { directory: 'architecture' } }] },
				{ label: 'Infrastructure', items: [{ autogenerate: { directory: 'infrastructure' } }] },
				{ label: 'Services', items: [{ autogenerate: { directory: 'services' } }] },
				{ label: 'Development', items: [{ autogenerate: { directory: 'development' } }] },
				{ label: 'Operations', items: [{ autogenerate: { directory: 'operations' } }] },
				{ label: 'Runbooks', items: [{ autogenerate: { directory: 'runbooks' } }] },
				{ label: 'Access & security', items: [{ autogenerate: { directory: 'access' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
