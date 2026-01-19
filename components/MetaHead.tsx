import React from 'react';

export interface MetaHeadProps {
	title: string;
	description: string;
	keywords?: string;
	ogImage?: string;
	ogImageAlt?: string;
	twitterCreator?: string;
	canonicalUrl?: string;
	author?: string;
	ogType?: string;
}

/**
 * MetaHead Component - Manages SEO meta tags for pages
 *
 * Since React apps render in the client, this component documents
 * what meta tags should be in each page's index.html
 *
 * For dynamic meta tag updates at runtime, consider using:
 * - Helmet (react-helmet)
 * - React Router with meta tags
 * - Vite plugin for automatic meta tag injection
 *
 * Usage in index.html:
 * ```html
 * <meta name="description" content={description} />
 * <meta property="og:title" content={title} />
 * <meta property="og:description" content={description} />
 * <meta property="og:image" content={ogImage} />
 * <meta name="twitter:card" content="summary_large_image" />
 * <meta name="twitter:title" content={title} />
 * <meta name="twitter:creator" content={twitterCreator} />
 * <link rel="canonical" href={canonicalUrl} />
 * ```
 */
export const MetaHead: React.FC<MetaHeadProps> = ({
	title,
	description,
	keywords = '',
	ogImage = '',
	ogImageAlt = '',
	twitterCreator = '@_ooade',
	canonicalUrl = '',
	author = 'Ademola Adegbuyi',
	ogType = 'website',
}) => {
	React.useEffect(() => {
		// Update document title
		document.title = title;

		// Update or create meta tags dynamically
		const updateMetaTag = (
			name: string,
			content: string,
			isProperty = false,
		) => {
			let element = document.querySelector(
				isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`,
			) as HTMLMetaElement | null;

			if (!element) {
				element = document.createElement('meta');
				isProperty
					? element.setAttribute('property', name)
					: element.setAttribute('name', name);
				document.head.appendChild(element);
			}
			element.content = content;
		};

		updateMetaTag('description', description);
		updateMetaTag('keywords', keywords);
		updateMetaTag('author', author);

		// Open Graph
		updateMetaTag('og:type', ogType, true);
		updateMetaTag('og:title', title, true);
		updateMetaTag('og:description', description, true);
		if (ogImage) updateMetaTag('og:image', ogImage, true);
		if (ogImageAlt) updateMetaTag('og:image:alt', ogImageAlt, true);

		// Twitter Card
		updateMetaTag('twitter:card', 'summary_large_image');
		updateMetaTag('twitter:title', title);
		updateMetaTag('twitter:description', description);
		if (ogImage) updateMetaTag('twitter:image', ogImage);
		updateMetaTag('twitter:creator', twitterCreator);

		// Canonical URL
		if (canonicalUrl) {
			let canonical = document.querySelector(
				'link[rel="canonical"]',
			) as HTMLLinkElement | null;
			if (!canonical) {
				canonical = document.createElement('link');
				canonical.rel = 'canonical';
				document.head.appendChild(canonical);
			}
			canonical.href = canonicalUrl;
		}
	}, [
		title,
		description,
		keywords,
		ogImage,
		ogImageAlt,
		twitterCreator,
		canonicalUrl,
		author,
		ogType,
	]);

	return null; // This component only manages meta tags
};

export default MetaHead;
