import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import {
	findObjectImage,
	findContentImage,
	imageReferenceId,
	resolveContentImage,
	type ImageReference,
	type ObjectDisplayImage,
	type ObjectReturnContext,
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

export const galleryObjectSourceKey = (sectionId: string, galleryId: string, galleryIndex: number) =>
	`gallery:${sectionId}:${galleryId}:${galleryIndex}`;

export const heroObjectSourceKey = (sectionId: string) => `hero:${sectionId}`;

export const objectHref = (
	slug: string,
	options: { position?: 'Links' | 'Rechts' | 'Vorne'; imageKey?: string; sourceKey?: string } = {},
) => {
	const search = new URLSearchParams();
	if (options.position) search.set('position', options.position);
	if (options.imageKey) search.set('image', options.imageKey);
	if (options.sourceKey) search.set('source', options.sourceKey);
	const query = search.toString();
	return `/objekte/${slug}/${query ? `?${query}` : ''}`;
};

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
	beschriftung?: string;
	imageKey?: string;
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
					beschriftung: association.beschriftung,
					imageKey: association.inObjektansicht ? imageReferenceId(association.bild) : undefined,
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
	const returnContextsByObject = new Map<string, ObjectReturnContext[]>();
	const addReturnContext = (objectId: string, context: ObjectReturnContext) => {
		const contexts = returnContextsByObject.get(objectId) ?? [];
		if (!contexts.some((existing) => existing.sourceKey === context.sourceKey && existing.imageKey === context.imageKey)) {
			contexts.push(context);
		}
		returnContextsByObject.set(objectId, contexts);
	};

	const recordImageContext = async (
		imageReference: ImageReference,
		context: Omit<ObjectReturnContext, 'imageKey'>,
	) => {
		const image = await findContentImage(imageReference);
		if (!image) return;

		for (const relationship of relationshipsByImage.get(image.asset.src) ?? []) {
			addReturnContext(relationship.object.id, { ...context, imageKey: relationship.imageKey });
		}
	};

	const recordHeroContext = async (
		section: CollectionEntry<'chapters'> | CollectionEntry<'subchapters'>,
		chapter: CollectionEntry<'chapters'>,
	) => {
		const context = {
			sourceKey: heroObjectSourceKey(section.id),
			href: section.collection === 'chapters'
				? chapterHref(chapter.data.nummer)
				: subchapterHref(chapter.data.nummer, section.data.nummer),
			label: `Zurück zu Kapitel ${Number(chapter.data.nummer)}`,
		};

		if (section.data.heroMetadata) {
			await recordImageContext(section.data.heroMetadata, context);
		}

		if (section.data.heroObject) {
			const object = await getEntry(section.data.heroObject);
			if (!object) return;

			const image = section.data.heroMetadata
				? await findContentImage(section.data.heroMetadata)
				: undefined;
			const relationship = image
				? (relationshipsByImage.get(image.asset.src) ?? []).find((candidate) => candidate.object.id === object.id)
				: undefined;
			addReturnContext(object.id, { ...context, imageKey: relationship?.imageKey });
		}
	};

	const recordGalleryContext = async (galleryReference, galleryIndex, chapter, subchapter) => {
		const gallery = galleryById.get(galleryReference.id);

		if (!gallery) return;

		const sectionHref = subchapter
			? subchapterHref(chapter.data.nummer, subchapter.data.nummer)
			: chapterHref(chapter.data.nummer);
		const section = subchapter ?? chapter;

		for (const imageReference of gallery.data.bilder.flat()) {
			await recordImageContext(imageReference, {
				sourceKey: galleryObjectSourceKey(section.id, gallery.id, galleryIndex),
				href: `${sectionHref}#${galleryIndex + 1}`,
				label: `Zurück zu Kapitel ${Number(chapter.data.nummer)}`,
			});
		}
	};

	for (const chapter of chapters) {
		await recordHeroContext(chapter, chapter);

		for (const [galleryIndex, galleryReference] of (chapter.data.galerien ?? []).entries()) {
			await recordGalleryContext(galleryReference, galleryIndex, chapter, undefined);
		}

		for (const subchapterReference of chapter.data.unterkapitel ?? []) {
			const subchapter = await getEntry(subchapterReference);

			if (!subchapter) continue;

			await recordHeroContext(subchapter, chapter);

			for (const [galleryIndex, galleryReference] of subchapter.data.galerien.entries()) {
				await recordGalleryContext(galleryReference, galleryIndex, chapter, subchapter);
			}
		}
	}

	return Promise.all(objects
		.filter((object) => object.data.slug)
		.map(async (object) => {
			const returnContexts = returnContextsByObject.get(object.id) ?? [];
			const imageReturnContexts = object.data.kapitelunabhaengig ? [] : returnContexts;
			const objectImages: ObjectDisplayImage[] = await Promise.all(
				(object.data.bilder ?? [])
					.filter((association) => association.inObjektansicht)
					.map(async (association) => {
						const image = await resolveContentImage(association.bild);
						const key = imageReferenceId(association.bild);
						return {
							key,
							id: image.id,
							dateiname: image.entry?.data.dateiname,
							altText: image.entry?.data.altText,
							returnContexts: imageReturnContexts.filter((context) => context.imageKey === key),
						};
					}),
			);

			if (objectImages.length === 0 && findObjectImage(object.id)) {
				objectImages.push({ key: object.id, id: object.id, returnContexts: [] });
			}

			return {
				params: { slug: object.data.slug },
				props: {
					object,
					context: {
						images: objectImages,
						returnContexts,
					},
				},
			};
		}));
};
