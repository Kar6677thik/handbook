// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { sections } from './src/sections.mjs';

export default defineConfig({
	site: 'https://book.karthiksurkanti.in',
	integrations: [
		starlight({
			title: 'Handbook',
			description: 'How our systems work, how to run them, and how to fix them, written for people with no AI tools to lean on.',
			favicon: '/favicon.svg',
			lastUpdated: true, // shows git "last updated" date on each page
			editLink: {
				baseUrl: 'https://github.com/Kar6677thik/handbook/edit/main/',
			},
			head: [
				// Self-hosted, so the site keeps its type when it's read offline.
				{ tag: 'link', attrs: { rel: 'preload', href: '/fonts/pilcrow-rounded-400.woff2', as: 'font', type: 'font/woff2', crossorigin: '' } },
				{ tag: 'link', attrs: { rel: 'preload', href: '/fonts/pilcrow-rounded-700.woff2', as: 'font', type: 'font/woff2', crossorigin: '' } },
				// Lets CSS hide entrance states only when scripts can reveal them again.
				{ tag: 'script', content: "document.documentElement.classList.add('js')" },
			],
			customCss: ['./src/styles/fonts.css', './src/styles/custom.css', './src/styles/home.css'],
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				PageTitle: './src/components/PageTitle.astro',
				Hero: './src/components/Hero.astro',
			},
			expressiveCode: {
				styleOverrides: {
					borderRadius: '0px',
					borderWidth: '0px',
					codeFontSize: '0.875rem',
					frames: { shadowColor: 'transparent', editorActiveTabIndicatorTopColor: 'transparent' },
				},
			},
			plugins: [starlightLinksValidator()], // build fails on broken internal links
			sidebar: sections.map((s) => ({ label: s.label, items: [{ autogenerate: { directory: s.dir } }] })),
		}),
	],
});
