import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const Footer: React.FC = () => {
	return (
		<footer className="py-12 bg-neutral-950 text-neutral-500 text-sm border-t border-neutral-900">
			<div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
				<div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
					<span>&copy; {new Date().getFullYear()} Ademola Adegbuyi</span>
					<span className="hidden md:inline text-neutral-800">|</span>
				</div>

				<div className="flex items-center gap-6">
					<a
						href={SOCIAL_LINKS.PERSONAL_SITE}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-white transition-colors"
					>
						My personal website
					</a>
					<a
						href={SOCIAL_LINKS.X}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-white transition-colors"
					>
						X
					</a>
					<a
						href={SOCIAL_LINKS.GITHUB}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-white transition-colors"
					>
						GitHub
					</a>
					<a
						href={SOCIAL_LINKS.LINKEDIN}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-white transition-colors"
					>
						LinkedIn
					</a>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
