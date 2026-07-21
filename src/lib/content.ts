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

export const getReadingOrder = async () => {
	const chapters = await getOrderedChapters();
	const sections: Array<{
		kind: 'chapter' | 'subchapter';
		id: string;
		label: string;
		href: string;
	}> = [];

	for (const chapter of chapters) {
		sections.push({
			kind: 'chapter',
			id: chapter.id,
			label: chapter.data.navTitel,
			href: chapterHref(chapter.data.nummer),
		});

		for (const subchapterReference of chapter.data.unterkapitel ?? []) {
			const subchapter = await getEntry(subchapterReference);

			if (!subchapter) continue;

			sections.push({
				kind: 'subchapter',
				id: subchapter.id,
				label: subchapter.data.navTitel,
				href: subchapterHref(chapter.data.nummer, subchapter.data.nummer),
			});
		}
	}

	return sections;
};

export const getObjectRoutes = async () => {
	const [objects, images, galleries, chapters] = await Promise.all([
		getCollection('objects'),
		getCollection('images'),
		getCollection('galleries'),
		getOrderedChapters(),
	]);
	const imageById = new Map(images.map((image) => [image.id, image]));
	const galleryById = new Map(galleries.map((gallery) => [gallery.id, gallery]));
	const imagesByObject = new Map();
	const contextByObject = new Map();

	for (const image of images) {
		for (const objectReference of image.data.objekte ?? []) {
			const objectImages = imagesByObject.get(objectReference.id) ?? [];
			objectImages.push(image);
			imagesByObject.set(objectReference.id, objectImages);
		}
	}

	const recordImageContext = (imageReference, context) => {
		const image = imageById.get(imageReference.id);

		if (!image) return;

		for (const objectReference of image.data.objekte ?? []) {
			if (!contextByObject.has(objectReference.id)) {
				contextByObject.set(objectReference.id, context);
			}
		}
	};

	const recordGalleryContext = (galleryReference, galleryIndex, chapter, subchapter) => {
		const gallery = galleryById.get(galleryReference.id);

		if (!gallery) return;

		const sectionHref = subchapter
			? subchapterHref(chapter.data.nummer, subchapter.data.nummer)
			: chapterHref(chapter.data.nummer);

		for (const imageReference of gallery.data.bilder) {
			recordImageContext(imageReference, {
				chapter,
				subchapter,
				returnHref: `${sectionHref}#${galleryIndex + 1}`,
			});
		}
	};

	for (const chapter of chapters) {
		recordImageContext(chapter.data.hero, {
			chapter,
			returnHref: chapterHref(chapter.data.nummer),
		});

		for (const [galleryIndex, galleryReference] of (chapter.data.galerien ?? []).entries()) {
			recordGalleryContext(galleryReference, galleryIndex, chapter, undefined);
		}

		for (const subchapterReference of chapter.data.unterkapitel ?? []) {
			const subchapter = await getEntry(subchapterReference);

			if (!subchapter) continue;

			recordImageContext(subchapter.data.hero, {
				chapter,
				subchapter,
				returnHref: subchapterHref(chapter.data.nummer, subchapter.data.nummer),
			});

			for (const [galleryIndex, galleryReference] of subchapter.data.galerien.entries()) {
				recordGalleryContext(galleryReference, galleryIndex, chapter, subchapter);
			}
		}
	}

	return objects
		.filter((object) => object.data.slug)
		.map((object) => {
			const context = contextByObject.get(object.id);

			return {
				params: { slug: object.data.slug },
				props: {
					object,
					context: {
						...(context ?? { returnHref: '/' }),
						images: imagesByObject.get(object.id) ?? [],
					},
				},
			};
		});
};
