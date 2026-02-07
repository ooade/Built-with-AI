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
	{
		id: 'p2p-connect-four',
		title: 'P2P Connect Four',
		description:
			'A peer-to-peer Connect Four game that allows two players to compete in real-time without a central server.',
		tags: ['Game', 'P2P'],
		link: '/connect-four/',
	},
	{
		id: 'budgeting',
		title: 'BudgetMaster',
		description:
			'A comprehensive, offline-first budget tracking application with PDF import simulation, robust data visualization, and expense management.',
		tags: ['Utility', 'Finance'],
		link: '/budgeting/',
	},
	{
		id: 'ai-transcriber',
		title: 'AI Transcriber',
		description:
			"An intelligent transcription and analysis tool that leverages OpenAI's Whisper for speech-to-text conversion, with automatic correction, summarization, and speaker diarization capabilities.",
		tags: ['Audio'],
		link: 'https://github.com/ooade/AI-Transcriber',
	},
];

export const SOCIAL_LINKS = {
	X: 'https://x.com/_ooade',
	PERSONAL_SITE: 'https://ademola.adegbuyi.me',
	GITHUB: 'https://github.com/ooade/Built-with-AI',
	LINKEDIN: 'https://www.linkedin.com/in/ooade/',
};
