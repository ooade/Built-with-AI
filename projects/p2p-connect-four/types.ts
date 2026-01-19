export enum Player {
	None = 0,
	One = 1, // Host (Red)
	Two = 2, // Guest (Yellow)
}

export interface GameState {
	board: number[][]; // 6 rows x 7 cols
	turn: number; // Turn count
	currentPlayer: Player;
	winner: Player | 'DRAW' | null;
	history: number[]; // Column history for verification
	scores: { [key: number]: number };
}

export type NetworkMessage =
	| { type: 'MOVE'; column: number; player: Player; turn: number }
	| { type: 'SYNC'; state: GameState }
	| { type: 'RESTART'; startingPlayer?: Player }
	| { type: 'SET_TURN_PLAYER'; player: Player }
	| { type: 'HASH_CHECK'; hash: string; turn: number }
	| { type: 'CHAT'; text: string }
	| { type: 'IDENTITY'; name: string }
	| { type: 'PING' }
	| { type: 'PONG' };

export interface PeerConnectionState {
	isConnected: boolean;
	isConnecting: boolean;
	isReconnecting: boolean;
	peerId: string | null;
	error: string | null;
	latency: number | null;
	retryAttempt: number;
}
