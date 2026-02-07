import React, { useState, useMemo, useEffect } from 'react';
import Hero from './components/Hero';
import ProjectCard from './components/ProjectCard';
import About from './components/About';
import Footer from './components/Footer';
import { PROJECTS, SOCIAL_LINKS } from './constants';
import { SectionId } from './types';

const CATEGORIES = ['All', 'Game', 'Utility', 'Audio'];
const INITIAL_VISIBLE_COUNT = 9;
type SortOrder = 'newest-first' | 'oldest-first';

const DISPLAY_CONFIG = {
	sortOrder: 'newest-first',
} as Record<string, SortOrder>;

const getSortedProjects = (
	projects: typeof PROJECTS,
	sortOrder: typeof DISPLAY_CONFIG.sortOrder,
) => {
	switch (sortOrder) {
		case 'newest-first':
			return [...projects].reverse();
		case 'oldest-first':
			return [...projects];
		default:
			return [...projects];
	}
};

const App: React.FC = () => {
	const [activeCategory, setActiveCategory] = useState('All');
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

	// Reset visible count when category changes to ensure consistent UX
	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE_COUNT);
	}, [activeCategory]);

	const filteredProjects = useMemo(() => {
		const sorted = getSortedProjects(PROJECTS, DISPLAY_CONFIG.sortOrder);
		return activeCategory === 'All'
			? sorted
			: sorted.filter((p) => p.tags.includes(activeCategory));
	}, [activeCategory]);

	const visibleProjects = filteredProjects.slice(0, visibleCount);
	const hasMore = visibleCount < filteredProjects.length;

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 6);
	};

	return (
		<div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
			{/* Navigation / Header (Minimal floating) */}
			<header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
				<a
					href={SOCIAL_LINKS.PERSONAL_SITE}
					className="pointer-events-auto text-sm font-bold tracking-tight text-white/80 hover:text-white backdrop-blur-md px-4 py-2 rounded-full bg-black/10 border border-white/5 transition-colors"
				>
					AA.
				</a>
				<nav className="pointer-events-auto">
					{/* Minimal nav could go here if needed */}
				</nav>
			</header>

			<main>
				<Hero />

				{/* Projects Section */}
				<section
					id={SectionId.PROJECTS}
					className="py-24 bg-neutral-950 min-h-screen"
				>
					<div className="container mx-auto px-6">
						<div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
							<div>
								<span className="text-sm font-mono text-indigo-400 block mb-2">
									● Lab
								</span>
								<h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
									The Playground
								</h2>
							</div>

							{/* Category Filter */}
							<div className="flex flex-wrap gap-2">
								{CATEGORIES.map((category) => (
									<button
										key={category}
										onClick={() => setActiveCategory(category)}
										className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                      ${
												activeCategory === category
													? 'bg-neutral-100 text-black'
													: 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-white/5'
											}
                    `}
									>
										{category}
									</button>
								))}
							</div>
						</div>

						{/* Projects Grid */}
						<div className="flex flex-col border-t border-white/10">
							{visibleProjects.map((project, index) => (
								<div
									key={project.id}
									className="project-list-item relative overflow-hidden"
								>
									<div className="item-inner">
										<ProjectCard project={project} index={index} />
									</div>
								</div>
							))}
						</div>

						{/* Load More Button */}
						{hasMore && (
							<div className="flex justify-center">
								<button
									onClick={handleLoadMore}
									className="group flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-800 hover:text-white hover:border-neutral-700 hover:px-8"
								>
									Show More
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="transition-transform group-hover:translate-y-0.5"
									>
										<polyline points="6 9 12 15 18 9"></polyline>
									</svg>
								</button>
							</div>
						)}

						{/* Empty State */}
						{visibleProjects.length === 0 && (
							<div className="py-20 text-center text-neutral-500">
								<p>No experiments found in this category yet.</p>
							</div>
						)}
					</div>
				</section>

				<About />
			</main>

			<Footer />
		</div>
	);
};

export default App;
