import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
	project: Project;
	index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
	return (
		<a
			href={project.link}
			className="group block relative w-full py-12 md:py-20 border-b border-white/5 hover:bg-white/[0.02] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
		>
			<div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 md:gap-8 px-2 md:px-4">
				{/* Leading Metadata */}
				<div className="flex items-center gap-6 md:w-1/5 md:self-center">
					<span className="text-[10px] font-mono text-neutral-600 group-hover:text-indigo-500 transition-colors duration-500">
						{String(index + 1).padStart(2, '0')}
					</span>
					<span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600 group-hover:text-white transition-colors duration-500">
						{project.tags[0]}
					</span>
				</div>

				{/* Massive Title */}
				<div className="flex-1 overflow-hidden relative z-10">
					<h3 className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-300 tracking-tighter group-hover:text-white group-hover:translate-x-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
						{project.title}
					</h3>
				</div>

				{/* Floating Description and Secondary Tag */}
				<div className="md:w-1/3 flex flex-col md:items-end gap-3 text-left md:text-right mt-4 md:mt-0">
					<p className="text-sm text-neutral-500 max-w-xs group-hover:text-neutral-300 transition-colors duration-500 leading-relaxed">
						{project.description}
					</p>
					<div className="flex gap-3 flex-wrap justify-end">
						{project.tags.slice(1).map((tag) => (
							<span
								key={tag}
								className="text-[9px] font-bold uppercase tracking-widest text-neutral-800 group-hover:text-indigo-400 transition-colors"
							>
								#{tag}
							</span>
						))}
					</div>
				</div>

				{/* External Indicator */}
				<div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 ease-out hidden md:block">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-white"
					>
						<line x1="7" y1="17" x2="17" y2="7"></line>
						<polyline points="7 7 17 7 17 17"></polyline>
					</svg>
				</div>
			</div>

			{/* Animated Underline Progress */}
			<div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-50" />
		</a>
	);
};

export default ProjectCard;
