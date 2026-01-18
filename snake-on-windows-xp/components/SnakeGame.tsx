import React, { useState, useEffect, useCallback, useRef } from 'react';
import XPWindow from './XPWindow';
import { Direction, Position, GameState } from '../types';
import {
	GRID_SIZE,
	INITIAL_SPEED,
	SPEED_INCREMENT,
	MIN_SPEED,
	DIRECTIONS_MAP,
} from '../constants';

interface SnakeGameProps {
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
}

const SnakeGame: React.FC<SnakeGameProps> = ({
	onClose,
	onMinimize,
	onMaximize,
	isMaximized,
}) => {
	const [gameState, setGameState] = useState<GameState>({
		snake: [
			{ x: 10, y: 10 },
			{ x: 10, y: 11 },
			{ x: 10, y: 12 },
		],
		food: { x: 5, y: 5 },
		direction: Direction.UP,
		isGameOver: false,
		isPaused: true,
		score: 0,
		// Initialize high score from localStorage
		highScore:
			typeof window !== 'undefined'
				? parseInt(localStorage.getItem('snake_high_score') || '0', 10)
				: 0,
		speed: INITIAL_SPEED,
	});

	const gameLoopRef = useRef<number | null>(null);

	const generateFood = useCallback((snake: Position[]): Position => {
		let newFood;
		while (true) {
			newFood = {
				x: Math.floor(Math.random() * GRID_SIZE),
				y: Math.floor(Math.random() * GRID_SIZE),
			};
			// Ensure food doesn't spawn on snake body
			const onSnake = snake.some(
				(segment) => segment.x === newFood?.x && segment.y === newFood?.y,
			);
			if (!onSnake) break;
		}
		return newFood;
	}, []);

	const moveSnake = useCallback(() => {
		setGameState((prev) => {
			if (prev.isGameOver || prev.isPaused) return prev;

			const newHead = { ...prev.snake[0] };

			switch (prev.direction) {
				case Direction.UP:
					newHead.y -= 1;
					break;
				case Direction.DOWN:
					newHead.y += 1;
					break;
				case Direction.LEFT:
					newHead.x -= 1;
					break;
				case Direction.RIGHT:
					newHead.x += 1;
					break;
			}

			// Check collisions
			const hitWall =
				newHead.x < 0 ||
				newHead.x >= GRID_SIZE ||
				newHead.y < 0 ||
				newHead.y >= GRID_SIZE;
			const hitSelf = prev.snake.some(
				(segment) => segment.x === newHead.x && segment.y === newHead.y,
			);

			if (hitWall || hitSelf) {
				// Ensure high score is saved on game over
				if (prev.score > prev.highScore) {
					localStorage.setItem('snake_high_score', prev.score.toString());
				}
				return {
					...prev,
					isGameOver: true,
					highScore: Math.max(prev.score, prev.highScore),
				};
			}

			const newSnake = [newHead, ...prev.snake];
			const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;

			let newFood = prev.food;
			let newScore = prev.score;
			let newSpeed = prev.speed;
			let newHighScore = prev.highScore;

			if (ateFood) {
				newFood = generateFood(newSnake);
				newScore += 10;
				newSpeed = Math.max(MIN_SPEED, prev.speed - SPEED_INCREMENT);

				// Update high score immediately if beaten during gameplay
				if (newScore > newHighScore) {
					newHighScore = newScore;
					localStorage.setItem('snake_high_score', newScore.toString());
				}
			} else {
				newSnake.pop();
			}

			return {
				...prev,
				snake: newSnake,
				food: newFood,
				score: newScore,
				speed: newSpeed,
				highScore: newHighScore,
			};
		});
	}, [generateFood]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// If maximized, we want to ensure keys still work
			const dir = DIRECTIONS_MAP[e.key as keyof typeof DIRECTIONS_MAP];

			// Pause/Unpause on Space
			if (e.key === ' ') {
				e.preventDefault();
				setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
				return;
			}

			if (!dir) return;

			// Prevent default scrolling when using arrow keys
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				e.preventDefault();
			}

			setGameState((prev) => {
				if (prev.isPaused && !prev.isGameOver) {
					// Unpause on direction key
					return { ...prev, isPaused: false, direction: dir as Direction };
				}

				// Prevent 180 degree turns
				const isOpposite =
					(dir === Direction.UP && prev.direction === Direction.DOWN) ||
					(dir === Direction.DOWN && prev.direction === Direction.UP) ||
					(dir === Direction.LEFT && prev.direction === Direction.RIGHT) ||
					(dir === Direction.RIGHT && prev.direction === Direction.LEFT);

				if (isOpposite) return prev;
				return { ...prev, direction: dir as Direction };
			});
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	useEffect(() => {
		if (!gameState.isPaused && !gameState.isGameOver) {
			gameLoopRef.current = window.setInterval(moveSnake, gameState.speed);
		} else {
			if (gameLoopRef.current) clearInterval(gameLoopRef.current);
		}

		return () => {
			if (gameLoopRef.current) clearInterval(gameLoopRef.current);
		};
	}, [moveSnake, gameState.isPaused, gameState.isGameOver, gameState.speed]);

	const resetGame = () => {
		setGameState((prev) => ({
			...prev,
			snake: [
				{ x: 10, y: 10 },
				{ x: 10, y: 11 },
				{ x: 10, y: 12 },
			],
			food: { x: 5, y: 5 },
			direction: Direction.UP,
			isGameOver: false,
			isPaused: true,
			score: 0,
			speed: INITIAL_SPEED,
			// highScore is preserved via ...prev spread
		}));
	};

	return (
		<XPWindow
			title="Snake Game"
			icon="🐍"
			onClose={onClose}
			onMinimize={onMinimize}
			onMaximize={onMaximize}
			isMaximized={isMaximized}
		>
			<div className="flex flex-col gap-4">
				{/* Stats Panel */}
				<div className="flex justify-between items-center bg-white border-2 border-gray-400 p-2 shadow-inner select-none">
					<div className="flex flex-col">
						<span className="text-[10px] text-gray-500 font-bold uppercase">
							Current Score
						</span>
						<span className="text-xl font-mono text-green-700 tracking-tighter leading-none">
							{gameState.score.toString().padStart(5, '0')}
						</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-[10px] text-gray-500 font-bold uppercase">
							Best Score
						</span>
						<span className="text-xl font-mono text-blue-700 tracking-tighter leading-none">
							{gameState.highScore.toString().padStart(5, '0')}
						</span>
					</div>
				</div>

				{/* Game Board */}
				<div
					className="relative bg-[#a2d149] border-4 border-gray-600 shadow-lg overflow-hidden box-content mx-auto"
					style={{
						width: `${GRID_SIZE * 20}px`,
						height: `${GRID_SIZE * 20}px`,
						display: 'grid',
						gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
						gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
					}}
				>
					{/* Subtle Grid Lines */}
					<div
						className="absolute inset-0 grid"
						style={{
							gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
							gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
							pointerEvents: 'none',
						}}
					>
						{Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
							<div
								key={i}
								className="border-[0.5px] border-black/5 xp-grid-cell"
							></div>
						))}
					</div>

					{/* Render Food */}
					<div
						className="absolute rounded-full shadow-lg z-10 transition-all duration-200"
						style={{
							width: '18px',
							height: '18px',
							left: `${gameState.food.x * 20 + 1}px`,
							top: `${gameState.food.y * 20 + 1}px`,
							background:
								'radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)',
						}}
					>
						<div className="w-1 h-3 bg-green-800 rounded-full absolute -top-1 left-2 rotate-12"></div>
					</div>

					{/* Render Snake */}
					{gameState.snake.map((segment, i) => {
						const isHead = i === 0;
						return (
							<div
								key={`${segment.x}-${segment.y}-${i}`}
								className={`absolute z-20 ${isHead ? 'rounded-md scale-110' : 'rounded-sm'} shadow-sm transition-all duration-100`}
								style={{
									width: '18px',
									height: '18px',
									left: `${segment.x * 20 + 1}px`,
									top: `${segment.y * 20 + 1}px`,
									background: isHead
										? 'linear-gradient(135deg, #4d96ff 0%, #1941a5 100%)'
										: 'linear-gradient(135deg, #40c057 0%, #2b8a3e 100%)',
									boxShadow:
										'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)',
								}}
							>
								{isHead && (
									<div className="relative w-full h-full flex items-center justify-around px-0.5">
										<div className="w-1.5 h-1.5 bg-white rounded-full"></div>
										<div className="w-1.5 h-1.5 bg-white rounded-full"></div>
									</div>
								)}
							</div>
						);
					})}

					{/* Overlays */}
					{gameState.isPaused && !gameState.isGameOver && (
						<div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
							<div className="bg-white/90 p-4 border-2 border-blue-500 rounded shadow-xl flex flex-col items-center gap-2">
								<span className="text-blue-800 font-bold uppercase tracking-wider">
									Game Paused
								</span>
								<span className="text-xs text-gray-500">
									Press arrow keys to start
								</span>
							</div>
						</div>
					)}

					{gameState.isGameOver && (
						<div className="absolute inset-0 bg-red-900/40 backdrop-blur-[2px] flex items-center justify-center z-50">
							<div className="bg-white p-6 border-4 border-red-600 shadow-2xl flex flex-col items-center gap-4 text-center">
								<div className="flex flex-col">
									<span className="text-2xl font-bold text-red-700">
										GAME OVER
									</span>
									<span className="text-sm text-gray-600">
										You hit something!
									</span>
								</div>
								<div className="flex flex-col border-y border-gray-200 py-2 w-full">
									<span className="text-xs text-gray-400">FINAL SCORE</span>
									<span className="text-3xl font-mono text-gray-800 leading-none">
										{gameState.score}
									</span>
								</div>
								<button
									onClick={resetGame}
									className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-lg transform active:scale-95 transition-all"
								>
									TRY AGAIN
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Instructions */}
				<div className="text-[11px] text-gray-600 text-center italic bg-white/50 py-1 border border-gray-300">
					Use Arrow Keys or WASD to move • Space to Pause
				</div>
			</div>
		</XPWindow>
	);
};

export default SnakeGame;
