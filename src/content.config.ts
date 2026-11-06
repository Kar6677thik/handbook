import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Extra frontmatter that every page can declare. These fields drive the
// owner / "last verified" bar at the top of each page and `npm run audit`.
export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				/** Person or team responsible for keeping this page true. */
				owner: z.string().optional(),
				/** Date a human last checked this page against reality (YYYY-MM-DD). */
				lastVerified: z.coerce.date().optional(),
				/** Days until the page counts as stale. */
				reviewEvery: z.number().default(90),
			}),
		}),
	}),
};
