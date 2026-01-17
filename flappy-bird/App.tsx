import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import FlappyScene from './game/FlappyScene';
import { GAME_DIMENSIONS } from './constants';
import { GameState } from './types';

const App: React.FC = () => {
	const gameRef = useRef<Phaser.Game | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [gameState, setGameState] = useState<GameState>({
		score: 0,
		highScore: parseInt(localStorage.getItem('flappyHighScore') || '0'),
		status: 'START',
	});

	useEffect(() => {
		if (!containerRef.current || gameRef.current) return;

		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: GAME_DIMENSIONS.WIDTH,
			height: GAME_DIMENSIONS.HEIGHT,
			parent: containerRef.current,
			pixelArt: true,
			physics: {
				default: 'arcade',
				arcade: {
					// Fixed: Added missing 'x' property required by Vector2Like in some Phaser types
					gravity: { x: 0, y: 0 },
					debug: false,
					fps: 60,
					fixedStep: true,
				},
			},
			fps: {
				target: 60,
				forceSetTimeOut: true,
			},
			scene: FlappyScene,
		};

		const game = new Phaser.Game(config);
		gameRef.current = game;

		// Pass callbacks to update React state from Phaser
		game.scene.start('FlappyScene', {
			onScore: (score: number) => {
				setGameState((prev) => {
					const newHighScore = Math.max(prev.highScore, score);
					if (newHighScore > prev.highScore) {
						localStorage.setItem('flappyHighScore', newHighScore.toString());
					}
					return { ...prev, score, highScore: newHighScore };
				});
			},
			onState: (status: GameState['status']) => {
				setGameState((prev) => ({ ...prev, status }));
				if (status === 'START') {
					setGameState((prev) => ({ ...prev, score: 0 }));
				}
			},
		});

		return () => {
			game.destroy(true);
			gameRef.current = null;
		};
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans p-4">
			{/* Game Container Wrapper */}
			<div className="relative shadow-2xl rounded-lg overflow-hidden border-4 border-neutral-800">
				{/* Phaser Canvas Container */}
				<div
					ref={containerRef}
					style={{
						width: GAME_DIMENSIONS.WIDTH,
						height: GAME_DIMENSIONS.HEIGHT,
					}}
				/>

				{/* UI Overlay Layer */}
				<div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start py-8">
					{/* Current Score */}
					<div
						className="text-white text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] select-none z-30"
						style={{ fontFamily: 'FlappyFont, sans-serif' }}
					>
						{gameState.score}
					</div>

					{/* Start Screen Overlay */}
					{gameState.status === 'START' && (
						<div className="absolute inset-0 bg-black/20 pointer-events-none flex flex-col items-center justify-center space-y-4">
							<img
								src="https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/message.png"
								alt="Get Ready"
								className="w-48 animate-pulse"
							/>
							<div className="text-white text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
								CLICK OR PRESS SPACE TO FLAP
							</div>
						</div>
					)}

					{/* Game Over Screen Overlay */}
					{gameState.status === 'GAMEOVER' && (
						<div className="absolute inset-0 bg-black/50 pointer-events-none flex flex-col items-center justify-center animate-in fade-in duration-500">
							<img
								src="https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/gameover.png"
								alt="Game Over"
								className="w-48 mb-6"
							/>

							<div className="bg-[#ded895] border-4 border-[#543847] p-4 rounded-md shadow-lg w-56 text-center">
								<div className="text-[#543847] text-xs font-bold mb-1 uppercase tracking-widest">
									Score
								</div>
								<div
									className="text-white text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] mb-3"
									style={{ fontFamily: 'FlappyFont, sans-serif' }}
								>
									{gameState.score}
								</div>

								<div className="h-0.5 bg-[#543847]/20 w-full mb-3" />

								<div className="text-[#543847] text-xs font-bold mb-1 uppercase tracking-widest">
									Best
								</div>
								<div
									className="text-white text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
									style={{ fontFamily: 'FlappyFont, sans-serif' }}
								>
									{gameState.highScore}
								</div>
							</div>

							<div className="mt-8 text-white text-sm animate-bounce">
								TAP TO TRY AGAIN
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Footer Info */}
			<div className="mt-6 text-neutral-500 text-xs text-center max-w-xs leading-relaxed uppercase tracking-tighter">
				<p>Built with Phaser 3 & React</p>
			</div>
		</div>
	);
};

export default App;
