
import Phaser from 'phaser';
import { ASSETS, PHYSICS, GAME_DIMENSIONS } from '../constants';

export default class FlappyScene extends Phaser.Scene {
  private bird!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private pipes!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private background!: Phaser.GameObjects.TileSprite;
  private score: number = 0;
  private isGameOver: boolean = false;
  private isStarted: boolean = false;
  private pipeTimer?: Phaser.Time.TimerEvent;
  
  private onScoreUpdate?: (score: number) => void;
  private onGameStateChange?: (status: 'START' | 'PLAYING' | 'GAMEOVER') => void;

  constructor() {
    super('FlappyScene');
  }

  init(data: { onScore: (s: number) => void; onState: (s: any) => void }) {
    this.onScoreUpdate = data.onScore;
    this.onGameStateChange = data.onState;
    this.score = 0;
    this.isGameOver = false;
    this.isStarted = false;
  }

  preload() {
    this.load.image('background', ASSETS.BACKGROUND);
    this.load.image('pipe', ASSETS.PIPE);
    this.load.image('ground', ASSETS.BASE);
    this.load.image('message', ASSETS.MESSAGE);
    this.load.image('gameover', ASSETS.GAMEOVER);
    
    this.load.spritesheet('bird', ASSETS.BIRD, { frameWidth: 34, frameHeight: 24 });
    this.load.image('bird-up', ASSETS.BIRD_UP);
    this.load.image('bird-down', ASSETS.BIRD_DOWN);

    this.load.audio('wing', ASSETS.SOUND_WING);
    this.load.audio('hit', ASSETS.SOUND_HIT);
    this.load.audio('point', ASSETS.SOUND_POINT);
    this.load.audio('die', ASSETS.SOUND_DIE);
    this.load.audio('swoosh', ASSETS.SOUND_SWOOSH);
  }

  create() {
    // 1. Background
    this.background = this.add.tileSprite(0, 0, GAME_DIMENSIONS.WIDTH, GAME_DIMENSIONS.HEIGHT, 'background').setOrigin(0);

    // 2. Pipes Group
    this.pipes = this.physics.add.group();

    // 3. Bird
    this.bird = this.physics.add.sprite(GAME_DIMENSIONS.WIDTH / 3, GAME_DIMENSIONS.HEIGHT / 2, 'bird');
    this.bird.setCollideWorldBounds(true);
    this.bird.setDepth(10);
    this.bird.body.allowGravity = false;

    // 4. Ground
    this.ground = this.add.tileSprite(
      0, 
      GAME_DIMENSIONS.HEIGHT - GAME_DIMENSIONS.BASE_HEIGHT, 
      GAME_DIMENSIONS.WIDTH, 
      GAME_DIMENSIONS.BASE_HEIGHT, 
      'ground'
    ).setOrigin(0);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(20);

    // 5. Input
    this.input.on('pointerdown', () => this.flap());
    this.input.keyboard?.on('keydown-SPACE', () => this.flap());

    // 6. Collisions
    this.physics.add.collider(this.bird, this.ground, this.hitGround, undefined, this);
    this.physics.add.overlap(this.bird, this.pipes, this.hitPipe, undefined, this);

    // Initial State
    if (this.onGameStateChange) this.onGameStateChange('START');
  }

  update() {
    if (!this.isStarted) {
      // Gentle bobbing effect before start
      this.bird.y = (GAME_DIMENSIONS.HEIGHT / 2) + Math.sin(this.time.now / 200) * 5;
      return;
    }

    if (this.isGameOver) return;

    // Scroll background and ground
    this.background.tilePositionX += 0.5;
    this.ground.tilePositionX += 2.5;

    // Bird Rotation Logic
    if (this.bird.body.velocity.y < 0) {
      // Going up: snap to -20 degrees
      this.bird.angle = -20;
    } else if (this.bird.body.velocity.y > 0) {
      // Falling: gradually rotate to 90 degrees
      if (this.bird.angle < 90) {
        this.bird.angle += 3.5;
      }
    }

    // Velocity Clamping
    if (this.bird.body.velocity.y > PHYSICS.maxFallSpeed) {
      this.bird.body.velocity.y = PHYSICS.maxFallSpeed;
    }

    // Score Logic: check if bird passed a pipe
    this.pipes.getChildren().forEach((p) => {
      const pipe = p as Phaser.Physics.Arcade.Sprite;
      if (pipe.name === 'top' && !pipe.getData('passed') && pipe.x + pipe.width < this.bird.x) {
        pipe.setData('passed', true);
        this.addScore();
      }
      // Cleanup off-screen pipes
      if (pipe.x + pipe.width < 0) {
        pipe.destroy();
      }
    });
  }

  private flap() {
    if (this.isGameOver) return;

    if (!this.isStarted) {
      this.startGame();
    }

    this.bird.setVelocityY(PHYSICS.flapVelocity);
    this.sound.play('wing');
  }

  private startGame() {
    this.isStarted = true;
    this.bird.body.allowGravity = true;
    this.bird.body.setGravityY(PHYSICS.gravity);
    
    if (this.onGameStateChange) this.onGameStateChange('PLAYING');

    this.pipeTimer = this.time.addEvent({
      delay: PHYSICS.pipeInterval,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true
    });

    this.spawnPipes();
  }

  private spawnPipes() {
    if (this.isGameOver) return;

    const minPipeHeight = 50;
    const maxPipeHeight = GAME_DIMENSIONS.HEIGHT - GAME_DIMENSIONS.BASE_HEIGHT - PHYSICS.pipeGap - minPipeHeight;
    const randomY = Phaser.Math.Between(minPipeHeight, maxPipeHeight);

    // Top Pipe
    // Fixed: Cast to SpriteWithDynamicBody to ensure body.allowGravity is recognized as mutable
    const topPipe = this.pipes.create(GAME_DIMENSIONS.WIDTH + 50, randomY, 'pipe') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    topPipe.setOrigin(0, 1);
    topPipe.setFlipY(true);
    topPipe.body.allowGravity = false;
    topPipe.setVelocityX(PHYSICS.pipeSpeed);
    topPipe.setName('top');

    // Bottom Pipe
    // Fixed: Cast to SpriteWithDynamicBody to resolve 'allowGravity' being read-only in base Sprite type
    const bottomPipe = this.pipes.create(GAME_DIMENSIONS.WIDTH + 50, randomY + PHYSICS.pipeGap, 'pipe') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    bottomPipe.setOrigin(0, 0);
    bottomPipe.body.allowGravity = false;
    bottomPipe.setVelocityX(PHYSICS.pipeSpeed);
    bottomPipe.setName('bottom');
  }

  private addScore() {
    this.score++;
    this.sound.play('point');
    if (this.onScoreUpdate) this.onScoreUpdate(this.score);
  }

  private hitPipe() {
    if (this.isGameOver) return;
    this.gameOver();
  }

  private hitGround() {
    if (this.isGameOver) return;
    this.gameOver();
  }

  private gameOver() {
    this.isGameOver = true;
    this.sound.play('hit');
    this.time.delayedCall(300, () => this.sound.play('die'));
    
    this.physics.pause();
    this.bird.setTint(0xff0000);
    
    if (this.pipeTimer) this.pipeTimer.remove();
    if (this.onGameStateChange) this.onGameStateChange('GAMEOVER');

    // Restart logic on next click/key
    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.restart());
  }
}
