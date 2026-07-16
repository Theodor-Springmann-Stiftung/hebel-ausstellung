import { getCollection, getEntry } from 'astro:content';

export const chapterSegment = (nummer: string) => nummer;

export const subchapterSegment = (nummer: string) => nummer;

export const chapterHref = (nummer: string) => `/${chapterSegment(nummer)}/`;

export const subchapterHref = (chapterNumber: string, subchapterNumber: string) =>
	`/${chapterSegment(chapterNumber)}/${subchapterSegment(subchapterNumber)}/`;

export const getOrderedChapters = async () =>
	(await getCollection('chapters')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);

export const getChapterNavigation = async () =>
	(await getOrderedChapters()).map((chapter) => ({
		nummer: chapter.data.nummer,
		titel: chapter.data.navTitel,
		href: chapterHref(chapter.data.nummer),
	}));

export const getChapterRoutes = async () =>
	(await getOrderedChapters()).map((chapter) => ({
		params: { chapterNumber: chapterSegment(chapter.data.nummer) },
		props: { chapter },
	}));

export const getSubchapterRoutes = async () => {
	const chapters = await getOrderedChapters();
	const routes = [];

	for (const chapter of chapters) {
		for (const subchapterReference of chapter.data.unterkapitel ?? []) {
			const subchapter = await getEntry(subchapterReference);

			if (!subchapter) continue;

			routes.push({
				params: {
					chapterNumber: chapterSegment(chapter.data.nummer),
					subchapterNumber: subchapterSegment(subchapter.data.nummer),
				},
				props: { chapter, subchapter },
			});
		}
	}

	return routes;
};

export const getObjectRoutes = async () =>
	(await getCollection('objects'))
		.filter((object) => object.data.slug)
		.map((object) => ({
			params: { slug: object.data.slug },
			props: { object },
		}));
