
import React, { useRef, useEffect } from 'react';
import { Lane, Player, GameObject } from '../types';
import * as CONST from '../constants';

interface GameEngineProps {
  onGameOver: (score: number) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const scoreRef = useRef(0);
  const gameSpeedRef = useRef(CONST.GAME_SPEED_START);
  const playerRef = useRef<Player>({
    lane: Lane.CENTER,
    targetLane: Lane.CENTER,
    y: 0,
    isJumping: false,
    isSliding: false,
    jumpVelocity: 0
  });
  const objectsRef = useRef<GameObject[]>([]);
  const lastSpawnRef = useRef(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const update = () => {
      frameCountRef.current++;
      scoreRef.current += Math.floor(gameSpeedRef.current * 3);
      gameSpeedRef.current = Math.min(CONST.GAME_SPEED_MAX, gameSpeedRef.current + CONST.SPEED_INCREMENT);

      const lerpSpeed = 0.25;
      const laneDiff = playerRef.current.targetLane - playerRef.current.lane;
      if (Math.abs(laneDiff) > 0.01) {
        playerRef.current.lane += laneDiff * lerpSpeed;
      } else {
        playerRef.current.lane = playerRef.current.targetLane;
      }

      if (playerRef.current.isJumping) {
        playerRef.current.y += playerRef.current.jumpVelocity;
        playerRef.current.jumpVelocity -= CONST.GRAVITY;
        if (playerRef.current.y <= 0) {
          playerRef.current.y = 0;
          playerRef.current.isJumping = false;
          playerRef.current.jumpVelocity = 0;
        }
      }

      const speed = gameSpeedRef.current * 45;
      objectsRef.current.forEach(obj => {
        obj.z -= speed;
      });

      for (const obj of objectsRef.current) {
        const playerZ = 120;
        if (Math.abs(obj.z - playerZ) < 60) {
          const laneMatch = Math.abs(obj.lane - playerRef.current.lane) < 0.6;
          
          if (laneMatch) {
            if (obj.type === 'TRAIN') {
              if (playerRef.current.y < 110) { 
                onGameOver(scoreRef.current);
                return;
              }
            } else if (obj.type === 'BARRIER') {
              if (!playerRef.current.isJumping && !playerRef.current.isSliding) {
                 onGameOver(scoreRef.current);
                 return;
              }
            } else if (obj.type === 'STAR') {
              scoreRef.current += 500;
              obj.z = -500;
            }
          }
        }
      }

      objectsRef.current = objectsRef.current.filter(obj => obj.z > CONST.DESPAWN_DISTANCE);

      if (frameCountRef.current - lastSpawnRef.current > 100 / gameSpeedRef.current) {
        spawnObject();
        lastSpawnRef.current = frameCountRef.current;
      }

      draw(ctx, canvas.width, canvas.height);
      requestRef.current = requestAnimationFrame(update);
    };

    const spawnObject = () => {
      const lanes = [Lane.LEFT, Lane.CENTER, Lane.RIGHT];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const typeRoll = Math.random();
      
      let type: GameObject['type'] = 'TRAIN';
      let color = CONST.COLORS.TRAIN_BODIES[Math.floor(Math.random() * CONST.COLORS.TRAIN_BODIES.length)];
      
      if (typeRoll > 0.85) {
        type = 'STAR';
        color = CONST.COLORS.STAR;
      } else if (typeRoll > 0.7) {
        type = 'BARRIER';
        color = CONST.COLORS.BARRIER;
      }

      objectsRef.current.push({
        id: Math.random().toString(),
        z: CONST.SPAWN_DISTANCE,
        lane,
        type,
        color,
        width: type === 'STAR' ? 50 : 200,
        height: type === 'TRAIN' ? 180 : (type === 'BARRIER' ? 60 : 50),
        depth: type === 'TRAIN' ? 800 : 30
      });
    };

    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);

      const horizonY = h * CONST.HORIZON_Y;
      
      // Sky - Urban Evening
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, CONST.COLORS.SKY_TOP);
      skyGrad.addColorStop(1, CONST.COLORS.SKY_BOTTOM);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Ground - Dark ballast
      ctx.fillStyle = CONST.COLORS.GROUND;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Tracks
      ctx.beginPath();
      ctx.moveTo(w / 2 - 120, horizonY);
      ctx.lineTo(w / 2 + 120, horizonY);
      ctx.lineTo(w + 300, h);
      ctx.lineTo(-300, h);
      ctx.closePath();
      ctx.fillStyle = CONST.COLORS.TRACKS;
      ctx.fill();

      // Rails
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      [ -0.7, -0.3, 0.3, 0.7 ].forEach(l => {
        ctx.beginPath();
        ctx.moveTo(w / 2 + (l * 80), horizonY);
        ctx.lineTo(w / 2 + (l * CONST.LANE_WIDTH * 3), h);
        ctx.stroke();
      });

      // Objects
      const sortedObjects = [...objectsRef.current].sort((a, b) => b.z - a.z);
      sortedObjects.forEach(obj => {
        const scale = CONST.PERSPECTIVE / (CONST.PERSPECTIVE + obj.z);
        const x = (w / 2) + (obj.lane * CONST.LANE_WIDTH * scale);
        const y = horizonY + (h * (1 - CONST.HORIZON_Y) * scale);
        
        const drawWidth = obj.width * scale;
        const drawHeight = obj.height * scale;

        if (obj.type === 'TRAIN') {
            // Train shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(x - drawWidth/2, y - 5, drawWidth, 10);
            
            // Body
            ctx.fillStyle = obj.color;
            ctx.fillRect(x - drawWidth/2, y - drawHeight, drawWidth, drawHeight);
            
            // Roof
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x - drawWidth/2, y - drawHeight, drawWidth, drawHeight * 0.1);

            // Front Window (Locomotive style)
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(x - drawWidth/2 + 10 * scale, y - drawHeight + 20 * scale, drawWidth - 20 * scale, drawHeight * 0.4);
            
            // Headlights
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(x - drawWidth/4, y - 30 * scale, 10 * scale, 0, Math.PI * 2);
            ctx.arc(x + drawWidth/4, y - 30 * scale, 10 * scale, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'BARRIER') {
            ctx.fillStyle = obj.color;
            ctx.fillRect(x - drawWidth/2, y - drawHeight, drawWidth, drawHeight);
            ctx.fillStyle = 'white';
            ctx.fillRect(x - drawWidth/2, y - drawHeight + drawHeight/2 - 2, drawWidth, 4);
        } else if (obj.type === 'STAR') {
            ctx.save();
            ctx.translate(x, y - 50 * scale);
            ctx.rotate(frameCountRef.current * 0.08);
            ctx.fillStyle = CONST.COLORS.STAR;
            ctx.font = `${Math.floor(40 * scale)}px Inter`;
            ctx.textAlign = 'center';
            ctx.fillText('★', 0, 0);
            ctx.restore();
        }
      });

      // Player: Jackie Chan
      const playerX = (w / 2) + (playerRef.current.lane * CONST.LANE_WIDTH * 0.6);
      const isSliding = playerRef.current.isSliding;
      const playerYBase = h - 140;
      const playerY = playerYBase - playerRef.current.y + (isSliding ? 40 : 0);
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(playerX, h - 40, isSliding ? 60 : 45, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jackie Chan Body
      ctx.save();
      if (isSliding) {
        ctx.translate(playerX, playerY);
        ctx.rotate(Math.PI / 4);
        // Shirt
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-20, 0, 40, 70);
        // Pants
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, 70, 40, 20);
        // Head
        ctx.fillStyle = '#fdba74';
        ctx.beginPath();
        ctx.arc(0, -15, 22, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#171717';
        ctx.beginPath();
        ctx.arc(0, -20, 24, Math.PI, 0);
        ctx.fill();
      } else {
        // Normal Running / Jumping
        // Head
        ctx.fillStyle = '#fdba74';
        ctx.beginPath();
        ctx.arc(playerX, playerY - 50, 22, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#171717';
        ctx.beginPath();
        ctx.arc(playerX, playerY - 55, 24, Math.PI, 0);
        ctx.fill();
        // White Shirt
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(playerX - 25, playerY - 30, 50, 65);
        // Dark Pants
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(playerX - 25, playerY + 35, 50, 50);
        // Kung Fu Arms
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 12;
        ctx.beginPath();
        const armSwing = Math.sin(frameCountRef.current * 0.2) * 20;
        ctx.moveTo(playerX - 25, playerY - 10);
        ctx.lineTo(playerX - 45, playerY + 10 + armSwing);
        ctx.moveTo(playerX + 25, playerY - 10);
        ctx.lineTo(playerX + 45, playerY + 10 - armSwing);
        ctx.stroke();
      }
      ctx.restore();

      // Speed lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      for(let i=0; i<15; i++) {
        const lx = (i * 137 + frameCountRef.current * 10) % w;
        const ly = (i * 243) % h;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 100, ly);
        ctx.stroke();
      }

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '36px Bungee';
      ctx.textAlign = 'right';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(scoreRef.current.toString(), w - 40, 60);
      ctx.font = '12px Inter';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('STUNT SCORE', w - 40, 85);
      ctx.shadowBlur = 0;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          if (playerRef.current.targetLane > Lane.LEFT) playerRef.current.targetLane--;
          break;
        case 'd':
        case 'arrowright':
          if (playerRef.current.targetLane < Lane.RIGHT) playerRef.current.targetLane++;
          break;
        case 'w':
        case 'arrowup':
        case ' ':
          if (!playerRef.current.isJumping) {
            playerRef.current.isJumping = true;
            playerRef.current.jumpVelocity = CONST.JUMP_FORCE;
          }
          break;
        case 's':
        case 'arrowdown':
          if (!playerRef.current.isSliding) {
            playerRef.current.isSliding = true;
            setTimeout(() => { playerRef.current.isSliding = false; }, 600);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [onGameOver]);

  return (
    <div className="w-full h-full cursor-none bg-slate-950">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Mobile Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-10 md:hidden px-6">
        <button 
          className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-yellow-500 text-3xl font-bold active:scale-90 transition-transform"
          onPointerDown={() => { if (playerRef.current.targetLane > Lane.LEFT) playerRef.current.targetLane--; }}
        >
          ←
        </button>
        <button 
          className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-yellow-500 text-3xl font-bold active:scale-90 transition-transform"
          onPointerDown={() => { 
            if (!playerRef.current.isJumping) { 
              playerRef.current.isJumping = true; 
              playerRef.current.jumpVelocity = CONST.JUMP_FORCE; 
            } 
          }}
        >
          ↑
        </button>
        <button 
          className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-yellow-500 text-3xl font-bold active:scale-90 transition-transform"
          onPointerDown={() => { if (playerRef.current.targetLane < Lane.RIGHT) playerRef.current.targetLane++; }}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default GameEngine;
