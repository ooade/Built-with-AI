
import { PhysicsConfig } from './types';

export const ASSETS = {
  BIRD: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/yellowbird-midflap.png',
  BIRD_DOWN: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/yellowbird-downflap.png',
  BIRD_UP: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/yellowbird-upflap.png',
  BACKGROUND: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/background-day.png',
  PIPE: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/pipe-green.png',
  BASE: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/base.png',
  GAMEOVER: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/gameover.png',
  MESSAGE: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/message.png',
  SOUND_WING: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/wing.wav',
  SOUND_HIT: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/hit.wav',
  SOUND_POINT: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/point.wav',
  SOUND_DIE: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/die.wav',
  SOUND_SWOOSH: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/swoosh.wav'
};

export const PHYSICS: PhysicsConfig = {
  gravity: 1100,
  flapVelocity: -360,
  pipeSpeed: -200,
  pipeGap: 145,
  pipeInterval: 1400, // ms
  maxFallSpeed: 500
};

export const GAME_DIMENSIONS = {
  WIDTH: 288,
  HEIGHT: 512,
  BASE_HEIGHT: 112
};
