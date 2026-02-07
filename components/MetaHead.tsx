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
	themeColor?: string;
	language?: string;
	robots?: string;
	structuredData?: object;
	preconnectUrls?: string[];
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
	themeColor = '#050505',
	language = 'en',
	robots = 'index, follow',
	structuredData,
	preconnectUrls = [],
}) => {
	React.useEffect(() => {
		// Update document title
		document.title = title;

		// Update language
		document.documentElement.lang = language;

		// Update or create meta tags dynamically
		const updateMetaTag = (
			name: string,
			content: string,
			isProperty = false,
			isHttpEquiv = false,
		) => {
			if (!content) return;

			const selector = isHttpEquiv
				? `meta[http-equiv="${name}"]`
				: isProperty
					? `meta[property="${name}"]`
					: `meta[name="${name}"]`;

			let element = document.querySelector(selector) as HTMLMetaElement | null;

			if (!element) {
				element = document.createElement('meta');
				if (isHttpEquiv) {
					element.setAttribute('http-equiv', name);
				} else if (isProperty) {
					element.setAttribute('property', name);
				} else {
					element.setAttribute('name', name);
				}
				document.head.appendChild(element);
			}
			element.content = content;
		};

		updateMetaTag('description', description);
		updateMetaTag('keywords', keywords);
		updateMetaTag('author', author);
		updateMetaTag('theme-color', themeColor);
		updateMetaTag('robots', robots);

		// Open Graph
		updateMetaTag('og:type', ogType, true);
		updateMetaTag('og:title', title, true);
		updateMetaTag('og:description', description, true);
		if (ogImage) updateMetaTag('og:image', ogImage, true);
		if (ogImageAlt) updateMetaTag('og:image:alt', ogImageAlt, true);
		if (canonicalUrl) updateMetaTag('og:url', canonicalUrl, true);

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

		// Add preconnect links
		preconnectUrls.forEach((url) => {
			if (!document.querySelector(`link[href="${url}"][rel="preconnect"]`)) {
				const link = document.createElement('link');
				link.rel = 'preconnect';
				link.href = url;
				document.head.appendChild(link);
			}
		});

		// Add structured data
		if (structuredData) {
			const existingScript = document.querySelector(
				'script[type="application/ld+json"]#dynamic-structured-data',
			);
			if (existingScript) {
				existingScript.remove();
			}

			const script = document.createElement('script');
			script.type = 'application/ld+json';
			script.id = 'dynamic-structured-data';
			script.textContent = JSON.stringify(structuredData);
			document.head.appendChild(script);
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
		themeColor,
		language,
		robots,
		structuredData,
		preconnectUrls,
	]);

	return null; // This component only manages meta tags
};

export default MetaHead;
