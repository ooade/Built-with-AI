import { Project } from './types';

export const PROJECTS: Project[] = [
	{
		id: 'flappy-bird',
		title: 'Flappy Bird',
		description:
			'A classic Flappy Bird clone built with Phaser 3 and React. Navigate the bird through pipes by tapping or pressing space to flap!',
		tags: ['Game', 'Phaser 3'],
		link: '/flappy-bird/',
	},
	{
		id: 'snake-on-windows-xp',
		title: 'Snake on Windows XP',
		description:
			'A nostalgic Snake game with a Windows XP aesthetic. Classic gameplay meets retro design.',
		tags: ['Game', 'Retro'],
		link: '/snake-on-windows-xp/',
	},
];

export const SOCIAL_LINKS = {
	PERSONAL_SITE: 'https://ademola.adegbuyi.me',
	TWITTER: '#',
	GITHUB: 'https://github.com/ooade/Built-with-AI',
};
