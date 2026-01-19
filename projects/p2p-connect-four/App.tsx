import React, { useState, useEffect, useRef } from 'react';
import { usePeer } from './hooks/usePeer';
import { GameState, Player, NetworkMessage } from './types';
import * as GameLogic from './utils/gameLogic';
import * as Notifications from './utils/notifications';
import Board from './components/Board';
import Chat from './components/Chat';
import {
	ArrowRight,
	RotateCcw,
	Copy,
	Check,
	Gamepad2,
	Edit2,
	MessageSquare,
	Wifi,
	WifiOff,
	Share2,
	LogIn,
	Crown,
	RefreshCw,
	Play,
	User,
	Sparkles,
	ChevronRight,
	Hash,
} from 'lucide-react';

// --- Helpers ---
const INITIAL_STATE: GameState = {
	board: GameLogic.createEmptyBoard(),
	turn: 1,
	currentPlayer: Player.None, // Allow anyone to start
	winner: null,
	history: [],
	scores: { [Player.One]: 0, [Player.Two]: 0 },
};

const getRandomName = () => {
	const adjectives = [
		'Faithful',
		'Brave',
		'Wise',
		'Humble',
		'Mighty',
		'Good',
		'Just',
		'Patient',
		'Bold',
		'Strong',
		'Loyal',
	];
	const names = [
		'David',
		'Moses',
		'Noah',
		'Peter',
		'Paul',
		'Sarah',
		'Mary',
		'Esther',
		'Ruth',
		'Jonah',
		'Elijah',
		'Daniel',
		'Joseph',
		'Caleb',
		'Joshua',
		'Gideon',
		'Samson',
		'Solomon',
	];
	return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${names[Math.floor(Math.random() * names.length)]}`;
};

const getAvatar = (seed: string) =>
	`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;

// --- Main Component ---
export default function App() {
	const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
	const [myPlayer, setMyPlayer] = useState<Player>(Player.None);

	// User Profile
	const [myName, setMyName] = useState(
		() => sessionStorage.getItem('p2p_cf_name') || getRandomName(),
	);
	const [opponentName, setOpponentName] = useState('Opponent');

	// UI States
	const [view, setView] = useState<'LOBBY' | 'GAME'>('LOBBY');
	const [joinCodeInput, setJoinCodeInput] = useState('');
	const [isCopied, setIsCopied] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [chatMessages, setChatMessages] = useState<
		Array<{ text: string; isMe: boolean }>
	>([]);
	const [unreadChat, setUnreadChat] = useState(0);

	// Join button loading state
	const [isJoining, setIsJoining] = useState(false);

	// Refs for logic
	const gameStateRef = useRef(INITIAL_STATE);
	const nameInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => Notifications.requestPermission(), []);

	useEffect(() => {
		if (isEditingName && nameInputRef.current) nameInputRef.current.focus();
	}, [isEditingName]);

	// --- Networking ---
	const handleMessage = (msg: NetworkMessage) => {
		switch (msg.type) {
			case 'MOVE':
				handleRemoteMove(msg.column, msg.player, msg.turn);
				break;
			case 'SYNC':
				if (msg.state.turn >= gameStateRef.current.turn) {
					updateGameState({
						...msg.state,
						scores: msg.state.scores || { [Player.One]: 0, [Player.Two]: 0 },
					});
				}
				break;
			case 'RESTART':
				resetGame(msg.startingPlayer);
				break;
			case 'CHAT':
				setChatMessages((prev) => [...prev, { text: msg.text, isMe: false }]);
				if (!isChatOpen) {
					setUnreadChat((c) => c + 1);
					if (navigator.vibrate) navigator.vibrate(50);
				}
				Notifications.notify(`From ${opponentName}`, msg.text);
				break;
			case 'IDENTITY':
				setOpponentName(msg.name || 'Opponent');
				if (gameStateRef.current.turn > 1) {
					sendMessage({ type: 'SYNC', state: gameStateRef.current });
				}
				break;
		}
	};

	const onPeerConnected = (isHost: boolean) => {
		const player = isHost ? Player.One : Player.Two;
		setMyPlayer(player);
		setView('GAME');
		setIsJoining(false);
		Notifications.notify('Friend Joined!', 'Game on!');
		if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
	};

	const {
		isConnected,
		isReconnecting,
		peerId,
		error,
		latency,
		connectToPeer,
		startHosting,
		regenerateHostId,
		sendMessage,
	} = usePeer(handleMessage, onPeerConnected);

	useEffect(() => {
		if (isConnected) {
			sendMessage({ type: 'IDENTITY', name: myName });
			sendMessage({ type: 'SYNC', state: gameStateRef.current });
		}
	}, [isConnected, myName, sendMessage]);

	useEffect(() => {
		if (error) setIsJoining(false);
	}, [error]);

	// --- Game Logic ---
	const updateGameState = (newState: GameState) => {
		gameStateRef.current = newState;
		setGameState(newState);
	};

	const handleLocalMove = (col: number) => {
		const current = gameStateRef.current;
		if (current.winner || !isConnected) return;

		// Allow move if it's my turn OR it's the first turn (anyone starts)
		const isMyTurn =
			current.currentPlayer === myPlayer ||
			(current.turn === 1 && current.currentPlayer === Player.None);

		if (!isMyTurn) return;

		const row = GameLogic.getLowestEmptyRow(current.board, col);
		if (row === -1) return;

		if (navigator.vibrate) navigator.vibrate(10);

		const nextBoard = current.board.map((r) => [...r]);
		nextBoard[row][col] = myPlayer;

		const win = GameLogic.checkWin(nextBoard, myPlayer);
		const draw = !win && GameLogic.checkDraw(nextBoard);

		const nextScores = { ...current.scores };
		if (win) nextScores[myPlayer] = (nextScores[myPlayer] || 0) + 1;

		// Determine next player. If I just played, next is the other one.
		const nextPlayer = myPlayer === Player.One ? Player.Two : Player.One;

		const nextState: GameState = {
			board: nextBoard,
			turn: current.turn + 1,
			currentPlayer: nextPlayer,
			winner: win ? myPlayer : draw ? 'DRAW' : null,
			history: [...current.history, col],
			scores: nextScores,
		};

		updateGameState(nextState);
		sendMessage({
			type: 'MOVE',
			column: col,
			player: myPlayer,
			turn: current.turn,
		});
	};

	const handleRemoteMove = (col: number, player: Player, turn: number) => {
		const current = gameStateRef.current;

		let boardToUse = current.board;
		let historyToUse = current.history;

		// Collision Resolution for First Turn
		// If we are at Turn 2 (we moved) but receive a Turn 1 move, we have a collision.
		// Policy: Host (Player.One) wins ties.
		if (current.turn !== turn) {
			if (turn === 1 && current.turn === 2 && myPlayer === Player.Two) {
				console.log('Race condition on Turn 1 detected. Yielding to Host.');
				// Revert to empty board to apply Host's move
				boardToUse = GameLogic.createEmptyBoard();
				historyToUse = [];
			} else {
				console.warn(
					`Turn mismatch (Local: ${current.turn}, Remote: ${turn}), ignoring move.`,
				);
				return;
			}
		}

		const row = GameLogic.getLowestEmptyRow(boardToUse, col);
		if (row === -1) return;

		const nextBoard = boardToUse.map((r) => [...r]);
		nextBoard[row][col] = player;

		const win = GameLogic.checkWin(nextBoard, player);
		const draw = !win && GameLogic.checkDraw(nextBoard);

		const nextScores = { ...current.scores };
		if (win) nextScores[player] = (nextScores[player] || 0) + 1;

		// Determine next player. If remote player was One, next is Two, etc.
		const nextPlayer = player === Player.One ? Player.Two : Player.One;

		updateGameState({
			board: nextBoard,
			turn: turn + 1, // Ensure we align with the turn of the move
			currentPlayer: nextPlayer,
			winner: win ? player : draw ? 'DRAW' : null,
			history: [...historyToUse, col],
			scores: nextScores,
		});

		if (win) {
			Notifications.notify('Game Over', `${opponentName} won!`);
			if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
		}
	};

	const resetGame = (startPlayer: Player = Player.None) => {
		const scores = gameStateRef.current.scores;
		updateGameState({ ...INITIAL_STATE, currentPlayer: startPlayer, scores });
	};

	const handleRestart = () => {
		if (navigator.vibrate) navigator.vibrate(10);
		resetGame(Player.None); // Anyone can start next game
		sendMessage({ type: 'RESTART', startingPlayer: Player.None });
	};

	// --- UI Actions ---
	const handleJoin = () => {
		if (navigator.vibrate) navigator.vibrate(10);
		if (joinCodeInput.length >= 3 && !isJoining) {
			setIsJoining(true);
			connectToPeer(joinCodeInput);
		}
	};

	const copyId = () => {
		if (navigator.vibrate) navigator.vibrate(10);
		if (peerId) {
			navigator.clipboard.writeText(peerId);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	const saveName = (e: React.FormEvent) => {
		e.preventDefault();
		if (navigator.vibrate) navigator.vibrate(10);
		setIsEditingName(false);
		sessionStorage.setItem('p2p_cf_name', myName);
		sendMessage({ type: 'IDENTITY', name: myName });
	};

	const sendChat = (text: string) => {
		setChatMessages((p) => [...p, { text, isMe: true }]);
		sendMessage({ type: 'CHAT', text });
	};

	// --- Renders ---

	const renderStatus = () => {
		if (isReconnecting)
			return (
				<span className="text-amber-400 flex items-center gap-1.5">
					<WifiOff size={14} />{' '}
					<span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
						Weak Signal
					</span>
				</span>
			);
		if (!isConnected && view === 'GAME')
			return (
				<span className="text-rose-400 flex items-center gap-1.5">
					<WifiOff size={14} />{' '}
					<span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
						Disconnected
					</span>
				</span>
			);
		if (isConnected)
			return (
				<span className="text-emerald-400 flex items-center gap-1.5">
					<Wifi size={14} />{' '}
					<span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
						Online
					</span>
				</span>
			);
		return null;
	};

	// LOBBY VIEW
	const renderLobby = () => (
		<div className="flex-1 w-full max-w-md mx-auto flex flex-col p-6 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto pb-safe">
			{/* Header */}
			<div className="mt-8 mb-8">
				<h1 className="text-5xl font-bold tracking-tight text-white mb-2 font-[SF Pro Display]">
					Connect<span className="text-blue-400">4</span>
				</h1>
				<p className="text-lg text-white/50 font-medium">
					Play instantly with friends
				</p>
			</div>

			{/* Profile Card */}
			<div className="glass-ios rounded-[28px] p-5 mb-10 flex items-center gap-5 relative overflow-hidden group">
				<div className="relative shrink-0">
					<img
						src={getAvatar(myName)}
						className="w-16 h-16 rounded-full bg-slate-800 shadow-inner ring-2 ring-white/10"
						alt="avatar"
					/>
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
						You are
					</div>
					{isEditingName ? (
						<form onSubmit={saveName} className="flex items-center gap-2">
							<input
								ref={nameInputRef}
								value={myName}
								onChange={(e) => setMyName(e.target.value)}
								className="bg-transparent border-b border-blue-500 text-xl font-bold text-white focus:outline-none w-full pb-0.5"
								onBlur={saveName}
							/>
						</form>
					) : (
						<div
							onClick={() => setIsEditingName(true)}
							className="flex items-center gap-2 cursor-pointer"
						>
							<h2 className="text-xl font-bold text-white truncate">
								{myName}
							</h2>
							<Edit2 size={14} className="text-white/30" />
						</div>
					)}
				</div>
			</div>

			{/* Divider */}
			<div className="flex items-center gap-4 mb-6">
				<div className="h-px bg-white/10 flex-1" />
				<span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
					Let's Play
				</span>
				<div className="h-px bg-white/10 flex-1" />
			</div>

			{/* Actions Stack */}
			<div className="flex flex-col gap-5 w-full">
				{/* Join Section */}
				<div className="glass-ios rounded-[28px] p-5">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 ring-1 ring-blue-500/20">
							<LogIn size={20} />
						</div>
						<div>
							<h3 className="text-base font-bold text-white/90">
								Join a Friend
							</h3>
							<p className="text-xs text-white/50">Enter their game code</p>
						</div>
					</div>
					<div className="flex gap-3">
						<div className="relative flex-1">
							<div className="absolute left-3.5 top-0 bottom-0 flex items-center text-white/20">
								<Hash size={16} />
							</div>
							<input
								value={joinCodeInput}
								onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
								placeholder="CODE"
								className="glass-input w-full pl-10 text-center font-mono text-lg tracking-widest uppercase"
								maxLength={6}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleJoin();
								}}
							/>
						</div>
						<button
							type="button"
							onClick={handleJoin}
							disabled={joinCodeInput.length < 3 || isJoining}
							className="glass-btn-primary w-[52px] !rounded-[14px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
						>
							{isJoining ? (
								<RefreshCw className="animate-spin" size={20} />
							) : (
								<ArrowRight size={22} />
							)}
						</button>
					</div>
				</div>

				{/* Host Section */}
				<div className="glass-ios rounded-[28px] p-5">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 ring-1 ring-purple-500/20">
							<Share2 size={20} />
						</div>
						<div>
							<h3 className="text-base font-bold text-white/90">
								Start a Game
							</h3>
							<p className="text-xs text-white/50">Share a code to play</p>
						</div>
					</div>

					{!peerId ? (
						<button
							type="button"
							onClick={() => {
								startHosting();
								if (navigator.vibrate) navigator.vibrate(10);
							}}
							className="glass-btn-primary w-full bg-white/10 hover:bg-white/15"
						>
							Get Game Code
						</button>
					) : (
						<div className="bg-black/30 rounded-[18px] border border-white/10 overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
							<div
								className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer active:bg-white/5 transition-colors"
								onClick={copyId}
							>
								<div className="font-mono text-3xl font-bold text-blue-400 tracking-wider pl-2">
									{peerId}
								</div>
								<div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 py-1 rounded bg-white/5">
									Tap to Copy
								</div>
							</div>
							<div className="flex divide-x divide-white/10 bg-white/5">
								<button
									onClick={copyId}
									className="flex-1 p-3 hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-bold text-white/70"
								>
									{isCopied ? (
										<Check size={14} className="text-emerald-400" />
									) : (
										<Copy size={14} />
									)}
									{isCopied ? 'Copied' : 'Copy Code'}
								</button>
								<button
									onClick={() => {
										regenerateHostId();
										if (navigator.vibrate) navigator.vibrate(10);
									}}
									className="flex-1 p-3 hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-bold text-white/70"
								>
									<RefreshCw size={14} /> New Code
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	// GAME VIEW
	const renderGame = () => {
		// UI Helpers for Dynamic Turn State
		const isMyTurn =
			gameState.currentPlayer === myPlayer ||
			(gameState.turn === 1 && gameState.currentPlayer === Player.None);
		const isWaiting = !isMyTurn;

		// Win/Loss States
		const isWinner = gameState.winner === myPlayer;
		const isLoser =
			gameState.winner &&
			gameState.winner !== 'DRAW' &&
			gameState.winner !== myPlayer;

		return (
			<div className="flex-1 w-full max-w-5xl mx-auto flex flex-col h-full overflow-hidden relative">
				{/* Result Overlays - Full Screen Atmosphere */}
				{isWinner && (
					<div className="absolute inset-0 z-0 pointer-events-none animate-in fade-in duration-1000">
						{/* Tint */}
						<div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
						{/* Gradient */}
						<div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
					</div>
				)}

				{isLoser && (
					<div className="absolute inset-0 z-0 pointer-events-none animate-in fade-in duration-1000">
						{/* Tint */}
						<div className="absolute inset-0 bg-rose-500/10 mix-blend-overlay" />
						{/* Gradient */}
						<div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent" />
					</div>
				)}

				{/* Top: Status / Turn Info */}
				<div className="px-4 pt-4 shrink-0 flex flex-col items-center justify-center min-h-[90px] relative z-10">
					{gameState.winner ? (
						<div className="glass-ios-light px-8 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] animate-bounce border border-white/20 backdrop-blur-xl">
							<Crown
								size={24}
								className="text-yellow-400"
								fill="currentColor"
							/>
							<span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-500">
								{gameState.winner === 'DRAW'
									? 'Draw!'
									: gameState.winner === myPlayer
										? 'Victory!'
										: `${opponentName} Won!`}
							</span>
						</div>
					) : (
						<div
							className={`px-6 py-2.5 rounded-full border backdrop-blur-md transition-all duration-300 flex items-center gap-3 ${
								isMyTurn
									? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
									: 'bg-white/5 border-white/10 text-white/50'
							}`}
						>
							<div
								className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-white/20'}`}
							/>
							<span className="font-semibold tracking-wide text-sm uppercase">
								{isMyTurn
									? gameState.turn === 1
										? 'You Start'
										: 'Your Turn'
									: `${opponentName}'s Turn`}
							</span>
						</div>
					)}
				</div>

				{/* Center: Board */}
				<div className="flex-1 flex items-center justify-center p-2 min-h-0 relative z-10">
					<Board
						board={gameState.board}
						onColumnClick={handleLocalMove}
						currentPlayer={gameState.currentPlayer}
						myPlayer={myPlayer}
						winner={gameState.winner}
						canPlay={isConnected && !gameState.winner && isMyTurn}
						p1Name={myPlayer === Player.One ? 'You' : opponentName}
						p2Name={myPlayer === Player.Two ? 'You' : opponentName}
					/>
				</div>

				{/* Bottom: Players & Actions */}
				<div className="shrink-0 pb-safe w-full relative z-10">
					<div className="glass-ios-heavy rounded-t-[32px] p-6 pb-8 flex flex-col gap-6 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] border-t border-white/10">
						{/* Players */}
						<div className="flex justify-between items-center gap-4 px-2">
							{/* You */}
							<div
								className={`flex items-center gap-4 transition-all duration-300 ${isMyTurn ? 'opacity-100 scale-105' : 'opacity-40 scale-100 grayscale'}`}
							>
								<div className="relative">
									<img
										src={getAvatar(myName)}
										className="w-12 h-12 rounded-full bg-white/5 ring-1 ring-white/20 shadow-lg"
									/>
									<div
										className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#15151a] ${myPlayer === Player.One ? 'bg-rose-500' : 'bg-amber-400'}`}
									/>
								</div>
								<div className="flex flex-col">
									<span className="text-base font-bold text-white tracking-tight">
										You
									</span>
									<span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
										Score {gameState.scores[myPlayer] || 0}
									</span>
								</div>
							</div>

							{/* VS */}
							<div className="text-xs font-black text-white/10 italic tracking-widest">
								VS
							</div>

							{/* Opponent */}
							<div
								className={`flex items-center gap-4 transition-all duration-300 flex-row-reverse text-right ${isWaiting ? 'opacity-100 scale-105' : 'opacity-40 scale-100 grayscale'}`}
							>
								<div className="relative">
									<img
										src={getAvatar(opponentName)}
										className="w-12 h-12 rounded-full bg-white/5 ring-1 ring-white/20 shadow-lg"
									/>
									<div
										className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#15151a] ${myPlayer === Player.Two ? 'bg-rose-500' : 'bg-amber-400'}`}
									/>
								</div>
								<div className="flex flex-col">
									<span className="text-base font-bold text-white tracking-tight max-w-[100px] truncate">
										{opponentName}
									</span>
									<span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
										Score{' '}
										{gameState.scores[
											myPlayer === Player.One ? Player.Two : Player.One
										] || 0}
									</span>
								</div>
							</div>
						</div>

						{/* Main Action Button */}
						<div className="flex gap-4 h-[52px]">
							{gameState.winner ? (
								<button
									onClick={handleRestart}
									className="flex-1 glass-btn-primary bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30"
								>
									<RotateCcw size={18} /> Play Again
								</button>
							) : (
								<div className="flex-1 flex items-center justify-center text-sm font-semibold text-white/40 italic glass-ios-light rounded-[26px]">
									{isConnected
										? isMyTurn
											? gameState.turn === 1
												? 'Anyone can start!'
												: "It's your turn!"
											: `${opponentName} is thinking...`
										: 'Waiting for friend...'}
								</div>
							)}

							{/* Floating Chat Trigger */}
							<button
								onClick={() => {
									setIsChatOpen(true);
									if (navigator.vibrate) navigator.vibrate(10);
								}}
								className="aspect-square h-full glass-btn-primary rounded-[26px] !w-[52px] !gap-0 relative bg-white/5 hover:bg-white/10"
							>
								<MessageSquare size={20} className="text-white/80" />
								{unreadChat > 0 && (
									<span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-[#15151a]" />
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="h-full flex flex-col relative font-sf">
			{/* Minimal Header */}
			<header className="absolute top-0 left-0 right-0 h-safe-top z-10 flex justify-between items-start p-4 pt-safe pointer-events-none">
				{view === 'GAME' && (
					<div className="pointer-events-auto glass-ios-light px-4 py-2 rounded-full flex items-center gap-2">
						<Gamepad2 className="text-white/80 w-4 h-4" />
						<span className="font-bold text-sm tracking-tight text-white/90">
							Connect<span className="text-blue-400">4</span>
						</span>
					</div>
				)}
				<div className="ml-auto pointer-events-auto glass-ios-light px-4 py-2 rounded-full flex items-center gap-2">
					{renderStatus()}
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full pt-safe flex flex-col overflow-hidden">
				{view === 'LOBBY' ? renderLobby() : renderGame()}
			</main>

			{/* Chat Sheet Overlay */}
			<Chat
				isOpen={isChatOpen}
				onClose={() => {
					setIsChatOpen(false);
					setUnreadChat(0);
				}}
				messages={chatMessages}
				onSendMessage={sendChat}
				opponentName={opponentName}
			/>
		</div>
	);
}
