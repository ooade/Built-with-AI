
export interface GameState {
  score: number;
  highScore: number;
  status: 'START' | 'PLAYING' | 'GAMEOVER';
}

export interface PhysicsConfig {
  gravity: number;
  flapVelocity: number;
  pipeSpeed: number;
  pipeGap: number;
  pipeInterval: number;
  maxFallSpeed: number;
}
