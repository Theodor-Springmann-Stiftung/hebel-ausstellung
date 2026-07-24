import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import {
	findObjectImage,
	findContentImage,
	resolveContentImage,
	type ImageReference,
	type ObjectDisplayImage,
} from './object-images';

export const chapterSegment = (nummer: string) => nummer;

export const subchapterSegment = (nummer: string) => nummer;

export const chapterHref = (nummer: string) => `/${chapterSegment(nummer)}/`;

export type ChapterNavigationItem = {
	nummer: string;
	titel: string;
	href: string;
};

export const normalizePath = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export const isNavigationPathActive = (currentPath: string, href: string) => normalizePath(currentPath).startsWith(href);

export const subchapterHref = (chapterNumber: string, subchapterNumber: string) =>
	`/${chapterSegment(chapterNumber)}/${subchapterSegment(subchapterNumber)}/`;

export const getOrderedChapters = async () =>
	(await getCollection('chapters')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);

export const getChapterNavigation = async (): Promise<ChapterNavigationItem[]> =>
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

export type ObjectImageRelationship = {
	object: CollectionEntry<'objects'>;
	position?: 'Links' | 'Rechts' | 'Vorne';
	objektReihenfolge?: number;
};

let objectRelationshipsByImagePromise: Promise<Map<string, ObjectImageRelationship[]>> | undefined;

export const getObjectRelationshipsByImage = () => {
	objectRelationshipsByImagePromise ??= (async () => {
		const relationshipsByImage = new Map<string, ObjectImageRelationship[]>();
		const objects = await getCollection('objects');

		for (const object of objects) {
			for (const association of object.data.bilder ?? []) {
				const image = await resolveContentImage(association.bild);
				const relationships = relationshipsByImage.get(image.asset.src) ?? [];
				relationships.push({
					object,
					position: association.position,
					objektReihenfolge: association.objektReihenfolge,
				});
				relationshipsByImage.set(image.asset.src, relationships);
			}
		}

		for (const relationships of relationshipsByImage.values()) {
			relationships.sort(
				(left, right) =>
					(left.objektReihenfolge ?? Number.MAX_SAFE_INTEGER) -
					(right.objektReihenfolge ?? Number.MAX_SAFE_INTEGER),
			);
		}

		return relationshipsByImage;
	})();

	return objectRelationshipsByImagePromise;
};

export const getObjectRoutes = async () => {
	const [objects, galleries, chapters, relationshipsByImage] = await Promise.all([
		getCollection('objects'),
		getCollection('galleries'),
		getOrderedChapters(),
		getObjectRelationshipsByImage(),
	]);
	const galleryById = new Map(galleries.map((gallery) => [gallery.id, gallery]));
	const contextByObject = new Map();

	const recordImageContext = async (imageReference: ImageReference, context) => {
		const image = await findContentImage(imageReference);
		if (!image) return;

		for (const relationship of relationshipsByImage.get(image.asset.src) ?? []) {
			if (!contextByObject.has(relationship.object.id)) {
				contextByObject.set(relationship.object.id, context);
			}
		}
	};

	const recordGalleryContext = async (galleryReference, galleryIndex, chapter, subchapter) => {
		const gallery = galleryById.get(galleryReference.id);

		if (!gallery) return;

		const sectionHref = subchapter
			? subchapterHref(chapter.data.nummer, subchapter.data.nummer)
			: chapterHref(chapter.data.nummer);

		for (const imageReference of gallery.data.bilder) {
			await recordImageContext(imageReference, {
				chapter,
				subchapter,
				returnHref: `${sectionHref}#${galleryIndex + 1}`,
			});
		}
	};

	for (const chapter of chapters) {
		if (chapter.data.hero) {
			await recordImageContext(chapter.data.hero, {
				chapter,
				returnHref: chapterHref(chapter.data.nummer),
			});
		}

		for (const [galleryIndex, galleryReference] of (chapter.data.galerien ?? []).entries()) {
			await recordGalleryContext(galleryReference, galleryIndex, chapter, undefined);
		}

		for (const subchapterReference of chapter.data.unterkapitel ?? []) {
			const subchapter = await getEntry(subchapterReference);

			if (!subchapter) continue;

			if (subchapter.data.hero) {
				await recordImageContext(subchapter.data.hero, {
					chapter,
					subchapter,
					returnHref: subchapterHref(chapter.data.nummer, subchapter.data.nummer),
				});
			}

			for (const [galleryIndex, galleryReference] of subchapter.data.galerien.entries()) {
				await recordGalleryContext(galleryReference, galleryIndex, chapter, subchapter);
			}
		}
	}

	return Promise.all(objects
		.filter((object) => object.data.slug)
		.map(async (object) => {
			const context = contextByObject.get(object.id);
			const objectImages: ObjectDisplayImage[] = await Promise.all(
				(object.data.bilder ?? []).map(async (association) => {
					const image = await resolveContentImage(association.bild);
					return {
						id: image.id,
						dateiname: image.entry?.data.dateiname,
						altText: image.entry?.data.altText,
					};
				}),
			);

			if (objectImages.length === 0 && findObjectImage(object.id)) {
				objectImages.push({ id: object.id });
			}

			return {
				params: { slug: object.data.slug },
				props: {
					object,
					context: {
						...(context ?? { returnHref: '/' }),
						images: objectImages,
					},
				},
			};
		}));
};
