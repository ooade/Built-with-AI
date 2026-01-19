import { Player, GameState } from '../types';

export const ROWS = 6;
export const COLS = 7;

export const createEmptyBoard = (): number[][] => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(Player.None));
};

export const getLowestEmptyRow = (board: number[][], col: number): number => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === Player.None) {
      return r;
    }
  }
  return -1;
};

export const checkWin = (board: number[][], player: Player): boolean => {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      )
        return true;
    }
  }

  // Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      )
        return true;
    }
  }

  // Diagonal Down-Right
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      )
        return true;
    }
  }

  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r - 1][c + 1] === player &&
        board[r - 2][c + 2] === player &&
        board[r - 3][c + 3] === player
      )
        return true;
    }
  }

  return false;
};

export const checkDraw = (board: number[][]): boolean => {
  return board.every((row) => row.every((cell) => cell !== Player.None));
};

// Simple deterministic hash for state verification
export const hashBoard = (board: number[][]): string => {
  return board.map(row => row.join('')).join('-');
};
