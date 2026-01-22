
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum Lane {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1
}

export interface GameObject {
  id: string;
  z: number; // Distance from player
  lane: Lane;
  type: 'TRAIN' | 'BARRIER' | 'STAR';
  color: string;
  width: number;
  height: number;
  depth: number;
}

export interface Player {
  lane: Lane;
  targetLane: Lane;
  y: number;
  isJumping: boolean;
  isSliding: boolean;
  jumpVelocity: number;
}
