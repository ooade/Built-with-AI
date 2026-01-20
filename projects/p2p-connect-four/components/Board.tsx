import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { ROWS, COLS } from '../utils/gameLogic';
import confetti from 'canvas-confetti';

interface BoardProps {
	board: number[][];
	onColumnClick: (col: number) => void;
	currentPlayer: Player;
	myPlayer: Player;
	winner: Player | 'DRAW' | null;
	canPlay: boolean;
	p1Name: string;
	p2Name: string;
}

const Board: React.FC<BoardProps> = ({
	board,
	onColumnClick,
	currentPlayer,
	myPlayer,
	winner,
	canPlay,
}) => {
	const [hoverCol, setHoverCol] = useState<number | null>(null);
	const [winningCells, setWinningCells] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (winner && winner !== 'DRAW') {
			const calculateWin = () => {
				const set = new Set<string>();
				const check = (r: number, c: number, dr: number, dc: number) => {
					if (
						board[r][c] === winner &&
						board[r + dr][c + dc] === winner &&
						board[r + 2 * dr][c + 2 * dc] === winner &&
						board[r + 3 * dr][c + 3 * dc] === winner
					) {
						[0, 1, 2, 3].forEach((i) => set.add(`${r + i * dr}-${c + i * dc}`));
					}
				};

				for (let r = 0; r < ROWS; r++) {
					for (let c = 0; c < COLS; c++) {
						if (c + 3 < COLS) check(r, c, 0, 1);
						if (r + 3 < ROWS) check(r, c, 1, 0);
						if (r + 3 < ROWS && c + 3 < COLS) check(r, c, 1, 1);
						if (r - 3 >= 0 && c + 3 < COLS) check(r, c, -1, 1);
					}
				}
				return set;
			};
			setWinningCells(calculateWin());

			if (winner === myPlayer) {
				confetti({
					particleCount: 150,
					spread: 70,
					origin: { y: 0.6 },
					colors: ['#f43f5e', '#fbbf24'],
				});
			}
		} else {
			setWinningCells(new Set());
		}
	}, [winner, board, myPlayer]);

	const getDiscStyles = (value: number, r: number, c: number) => {
		const isWin = winningCells.has(`${r}-${c}`);
		const isDimmed = !!winner && !isWin && value !== Player.None;

		let base =
			'w-full h-full rounded-full transition-all duration-300 transform ';

		if (value === Player.One) {
			base +=
				'bg-gradient-to-br from-rose-500 to-rose-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.3)]';
		} else if (value === Player.Two) {
			base +=
				'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_4px_8px_rgba(0,0,0,0.3)]';
		} else {
			base += 'bg-black/10 shadow-inner';
		}

		if (isWin) base += ' animate-win ring-2 ring-white z-10 scale-105';
		if (isDimmed) base += ' opacity-40 blur-[1px]';
		if (value !== Player.None && !winner) base += ' animate-drop';

		return base;
	};

	return (
		<div className="relative inline-block max-w-full select-none touch-manipulation">
			{/* Glass Housing */}
			<div className="glass-ios rounded-[32px] p-2 sm:p-4 relative z-10 border border-white/5 shadow-2xl">
				{/* Ghost Piece Indicator */}
				<div className="absolute -top-6 sm:-top-10 left-0 right-0 h-6 sm:h-10 flex px-2 sm:px-4 pointer-events-none">
					{Array.from({ length: COLS }).map((_, c) => (
						<div
							key={`ghost-${c}`}
							className="flex-1 flex justify-center items-end px-0.5 sm:px-1"
						>
							{hoverCol === c && canPlay && !winner && (
								<div
									className={`w-[80%] aspect-square rounded-full opacity-60 mb-1 transition-all duration-200 ${
										myPlayer === Player.One
											? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
											: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
									}`}
								/>
							)}
						</div>
					))}
				</div>

				{/* Grid Container */}
				<div
					className="grid grid-cols-7 gap-1.5 sm:gap-3 bg-white/5 rounded-[20px] p-1.5 sm:p-3 border border-white/5 shadow-inner"
					onMouseLeave={() => setHoverCol(null)}
				>
					{Array.from({ length: COLS }).map((_, col) => (
						<div
							key={col}
							className="flex flex-col gap-1.5 sm:gap-3 cursor-pointer group"
							onClick={() => canPlay && onColumnClick(col)}
							onMouseEnter={() => setHoverCol(col)}
						>
							{board.map((row, r) => (
								// Adjusted sizing:
								// Base: 11.5vmin (Fits iPad Portrait width 768px, 11.5%*768*7 ~ 620px + gaps)
								// LG: 10vmin (Fits iPad Landscape width when Sidebar is present. 10%*768*7 ~ 540px)
								<div
									key={`${r}-${col}`}
									className="w-[11.5vmin] h-[11.5vmin] max-w-[50px] max-h-[50px] sm:max-w-[64px] sm:max-h-[64px] lg:w-[10vmin] lg:h-[10vmin] relative"
								>
									{/* Hole Background */}
									<div className="absolute inset-0 rounded-full bg-black/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-white/5"></div>

									{/* Disc */}
									<div className={getDiscStyles(row[col], r, col)} />

									{/* Glossy reflection overlay */}
									{row[col] !== Player.None && (
										<div className="absolute top-[10%] left-[15%] w-[30%] h-[15%] bg-gradient-to-b from-white/70 to-transparent rounded-full -rotate-12 blur-[0.5px]" />
									)}
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Board;
