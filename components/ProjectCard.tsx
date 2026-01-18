import React from 'react';
import { Project } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ProjectCardProps {
	project: Project;
	index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
	const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

	const CardWrapper = project.link ? 'a' : 'div';
	const linkProps = project.link ? { href: project.link } : {};

	return (
		<CardWrapper
			ref={elementRef}
			{...linkProps}
			className={`
        group relative flex flex-col p-6 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm
        transition-all duration-700 ease-out h-full cursor-pointer
        hover:border-white/20 hover:bg-neutral-900/60 hover:-translate-y-1
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
			style={{ transitionDelay: `${(index % 9) * 100}ms` }}
		>
			{/* Subtle Glow Effect on Hover */}
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-500 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 group-hover:opacity-100 rounded-xl" />

			<div className="flex justify-between items-start mb-4">
				<h3 className="text-xl font-semibold text-neutral-100 tracking-tight group-hover:text-white transition-colors">
					{project.title}
				</h3>
				<span className="text-xs font-mono uppercase tracking-wider text-neutral-500 border border-neutral-800 px-2 py-1 rounded bg-neutral-950/50">
					{project.tags[0]}
				</span>
			</div>

			<p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow">
				{project.description}
			</p>

			<div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
				<div className="opacity-0 transform -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
					<span className="text-xs font-medium text-white">
						View Project &rarr;
					</span>
				</div>
			</div>
		</CardWrapper>
	);
};

export default ProjectCard;
