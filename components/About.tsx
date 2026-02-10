import React from 'react';
import { SectionId } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const About: React.FC = () => {
	const { elementRef, isVisible } = useIntersectionObserver();

	return (
		<section id={SectionId.ABOUT} className="py-24 md:py-32 bg-neutral-950">
			<div className="container mx-auto px-6 max-w-3xl">
				<div
					ref={elementRef}
					className={`space-y-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
				>
					<span className="text-sm font-mono text-indigo-400 block mb-2">
						● Philosophy
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
						The Lab.
					</h2>

					<div className="prose prose-invert text-neutral-400 text-lg leading-relaxed">
						<p>
							This isn't my main portfolio. This is my sandbox—a place to break
							things, iterate quickly, and see what happens when I treat AI as a
							creative partner rather than just a tool.
						</p>
						<p>
							Every app here started as a "what if?" question. Some are
							polished, some are rough sketches, but all of them are experiments
							in interaction design and generative probability.
						</p>
					</div>

					<div className="pt-8">
						<div className="h-px w-16 bg-white/20"></div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About;
