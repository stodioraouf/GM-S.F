import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RotateCcw, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const CyberRunnerGame: React.FC<Props> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gm_sf_runner_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state reference for 60fps loop
  const stateRef = useRef({
    lane: 1, // 0: left, 1: center, 2: right
    targetLaneX: 1,
    currentX: 1, // smoothly interpolated
    yOffset: 0, // jump height
    isJumping: false,
    jumpVelocity: 0,
    isSliding: false,
    slideTimer: 0,
    speed: 6,
    distance: 0,
    score: 0,
    coins: 0,
    obstacles: [] as { lane: number; z: number; type: 'train' | 'barrier' | 'drone' }[],
    coinItems: [] as { lane: number; z: number; collected: boolean }[],
    lastSpawnZ: 0,
    isDead: false,
  });

  // Sound generator using Web Audio API
  const playBeep = (type: 'coin' | 'jump' | 'hit') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'coin') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'jump') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  const handleMoveLeft = () => {
    if (stateRef.current.lane > 0 && !stateRef.current.isDead) {
      stateRef.current.lane -= 1;
    }
  };

  const handleMoveRight = () => {
    if (stateRef.current.lane < 2 && !stateRef.current.isDead) {
      stateRef.current.lane += 1;
    }
  };

  const handleJump = () => {
    if (!stateRef.current.isJumping && !stateRef.current.isDead) {
      stateRef.current.isJumping = true;
      stateRef.current.jumpVelocity = 14;
      playBeep('jump');
    }
  };

  const handleSlide = () => {
    if (!stateRef.current.isSliding && !stateRef.current.isDead) {
      stateRef.current.isSliding = true;
      stateRef.current.slideTimer = 25; // frames
    }
  };

  const restartGame = () => {
    stateRef.current = {
      lane: 1,
      targetLaneX: 1,
      currentX: 1,
      yOffset: 0,
      isJumping: false,
      jumpVelocity: 0,
      isSliding: false,
      slideTimer: 0,
      speed: 6,
      distance: 0,
      score: 0,
      coins: 0,
      obstacles: [],
      coinItems: [],
      lastSpawnZ: 0,
      isDead: false,
    };
    setScore(0);
    setCoins(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMoveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMoveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        handleJump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game animation loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution
    canvas.width = 640;
    canvas.height = 700;

    const render = () => {
      const state = stateRef.current;

      if (!state.isDead && isPlaying) {
        // Increase speed gradually
        state.speed = Math.min(18, 6 + Math.floor(state.distance / 400) * 0.8);
        state.distance += state.speed;
        state.score = Math.floor(state.distance / 10);
        setScore(state.score);

        // Smooth lane interpolation
        state.currentX += (state.lane - state.currentX) * 0.25;

        // Jump physics
        if (state.isJumping) {
          state.yOffset += state.jumpVelocity;
          state.jumpVelocity -= 0.8;
          if (state.yOffset <= 0) {
            state.yOffset = 0;
            state.isJumping = false;
            state.jumpVelocity = 0;
          }
        }

        // Slide logic
        if (state.isSliding) {
          state.slideTimer--;
          if (state.slideTimer <= 0) {
            state.isSliding = false;
          }
        }

        // Spawn obstacles and coins
        if (state.distance - state.lastSpawnZ > 120) {
          state.lastSpawnZ = state.distance;
          const spawnLane = Math.floor(Math.random() * 3);
          const types: ('train' | 'barrier' | 'drone')[] = ['train', 'barrier', 'drone'];
          const chosenType = types[Math.floor(Math.random() * types.length)];

          state.obstacles.push({
            lane: spawnLane,
            z: 800,
            type: chosenType,
          });

          // Spawn coins in a clear lane
          const coinLane = (spawnLane + 1 + Math.floor(Math.random() * 2)) % 3;
          for (let c = 0; c < 3; c++) {
            state.coinItems.push({
              lane: coinLane,
              z: 800 + c * 40,
              collected: false,
            });
          }
        }

        // Move obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.z -= state.speed;

          // Collision detection
          if (obs.z > 40 && obs.z < 100) {
            const laneDiff = Math.abs(state.currentX - obs.lane);
            if (laneDiff < 0.55) {
              let hit = false;
              if (obs.type === 'train' || obs.type === 'drone') {
                if (state.yOffset < 40) hit = true;
              } else if (obs.type === 'barrier') {
                // Must slide under barrier or jump over
                if (!state.isSliding && state.yOffset < 45) {
                  hit = true;
                }
              }

              if (hit) {
                state.isDead = true;
                playBeep('hit');
                setGameOver(true);
                setIsPlaying(false);
                if (state.score > highScore) {
                  setHighScore(state.score);
                  localStorage.setItem('gm_sf_runner_highscore', state.score.toString());
                }
                break;
              }
            }
          }

          if (obs.z < -50) {
            state.obstacles.splice(i, 1);
          }
        }

        // Move coins
        for (let i = state.coinItems.length - 1; i >= 0; i--) {
          const coin = state.coinItems[i];
          coin.z -= state.speed;

          // Coin pickup
          if (!coin.collected && coin.z > 30 && coin.z < 90) {
            const laneDiff = Math.abs(state.currentX - coin.lane);
            if (laneDiff < 0.6) {
              coin.collected = true;
              state.coins += 1;
              setCoins(state.coins);
              playBeep('coin');
            }
          }

          if (coin.z < -50) {
            state.coinItems.splice(i, 1);
          }
        }
      }

      // ----------------- DRAWING SECTION -----------------
      // Clear background
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
      skyGrad.addColorStop(0, '#061325');
      skyGrad.addColorStop(1, '#0c223a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, 300);

      // Distant cyber skyline
      ctx.fillStyle = '#0f172a';
      for (let b = 0; b < 10; b++) {
        const bx = b * 68;
        const bh = 80 + Math.sin(b * 123) * 50;
        ctx.fillRect(bx, 300 - bh, 50, bh);
        // glowing window dots
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(bx + 12, 300 - bh + 20, 4, 4);
        ctx.fillRect(bx + 28, 300 - bh + 40, 4, 4);
        ctx.fillStyle = '#0f172a';
      }

      // Horizon line
      const horizonY = 300;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(canvas.width, horizonY);
      ctx.stroke();

      // Perspective 3D Track
      const trackTopWidth = 140;
      const trackBottomWidth = 560;
      const trackLeftTop = (canvas.width - trackTopWidth) / 2;
      const trackLeftBottom = (canvas.width - trackBottomWidth) / 2;

      // Track floor
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(trackLeftTop, horizonY);
      ctx.lineTo(trackLeftTop + trackTopWidth, horizonY);
      ctx.lineTo(trackLeftBottom + trackBottomWidth, canvas.height);
      ctx.lineTo(trackLeftBottom, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Track outer glowing neon rails
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(trackLeftTop, horizonY);
      ctx.lineTo(trackLeftBottom, canvas.height);
      ctx.moveTo(trackLeftTop + trackTopWidth, horizonY);
      ctx.lineTo(trackLeftBottom + trackBottomWidth, canvas.height);
      ctx.stroke();

      // 3 Lanes dividers
      for (let l = 1; l <= 2; l++) {
        const topLx = trackLeftTop + (trackTopWidth / 3) * l;
        const bottomLx = trackLeftBottom + (trackBottomWidth / 3) * l;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(topLx, horizonY);
        ctx.lineTo(bottomLx, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Helper to project 3D lane & Z into 2D canvas coordinates
      const project = (laneVal: number, z: number) => {
        // z: 0 (near player bottom) to 800 (horizon)
        const t = Math.max(0, Math.min(1, 1 - z / 800));
        // t = 0 at horizon, t = 1 at camera
        const trackW = trackTopWidth + (trackBottomWidth - trackTopWidth) * t;
        const trackX = trackLeftTop + (trackLeftBottom - trackLeftTop) * t;
        const laneW = trackW / 3;
        const x = trackX + laneW * (laneVal + 0.5);
        const y = horizonY + (canvas.height - horizonY) * t;
        const scale = 0.2 + 0.8 * t;
        return { x, y, scale };
      };

      // Draw Coins (back to front)
      const sortedCoins = [...state.coinItems].sort((a, b) => b.z - a.z);
      for (const coin of sortedCoins) {
        if (coin.collected) continue;
        const p = project(coin.lane, coin.z);
        if (p.scale > 0.15) {
          ctx.save();
          ctx.translate(p.x, p.y - 25 * p.scale);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10 * p.scale;
          ctx.beginPath();
          ctx.arc(0, 0, 14 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2 * p.scale;
          ctx.stroke();

          // Coin icon inside
          ctx.fillStyle = '#78350f';
          ctx.font = `${Math.floor(12 * p.scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0);
          ctx.restore();
        }
      }

      // Draw Obstacles (back to front)
      const sortedObs = [...state.obstacles].sort((a, b) => b.z - a.z);
      for (const obs of sortedObs) {
        const p = project(obs.lane, obs.z);
        if (p.scale > 0.15) {
          ctx.save();
          ctx.translate(p.x, p.y);

          if (obs.type === 'train') {
            // Futuristic Maglev Train
            const w = 110 * p.scale;
            const h = 90 * p.scale;
            ctx.fillStyle = '#dc2626';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12 * p.scale;
            ctx.fillRect(-w / 2, -h, w, h);

            // Windshield
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-w / 2 + 10 * p.scale, -h + 12 * p.scale, w - 20 * p.scale, 28 * p.scale);

            // Headlights
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(-w / 3, -16 * p.scale, 8 * p.scale, 0, Math.PI * 2);
            ctx.arc(w / 3, -16 * p.scale, 8 * p.scale, 0, Math.PI * 2);
            ctx.fill();
          } else if (obs.type === 'barrier') {
            // High Laser Barrier
            const w = 120 * p.scale;
            const h = 50 * p.scale;
            ctx.fillStyle = '#f97316';
            ctx.fillRect(-w / 2, -h - 30 * p.scale, w, 24 * p.scale);
            // hazard stripes
            ctx.fillStyle = '#111';
            for (let s = -w / 2; s < w / 2; s += 20 * p.scale) {
              ctx.fillRect(s, -h - 30 * p.scale, 10 * p.scale, 24 * p.scale);
            }
            // Laser beam
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 6 * p.scale;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(-w / 2, -h - 8 * p.scale);
            ctx.lineTo(w / 2, -h - 8 * p.scale);
            ctx.stroke();
          } else {
            // Cyber Drone
            const w = 70 * p.scale;
            const h = 45 * p.scale;
            ctx.fillStyle = '#8b5cf6';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 15;
            ctx.fillRect(-w / 2, -h - 35 * p.scale, w, h);
            // Eye
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(0, -h - 15 * p.scale, 10 * p.scale, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Draw Player Character (Near camera: z = 60)
      const playerProj = project(state.currentX, 60);
      ctx.save();
      ctx.translate(playerProj.x, playerProj.y - state.yOffset * 1.8);

      // Player Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 28 * (1 - state.yOffset / 150), 10 * (1 - state.yOffset / 150), 0, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Hoverboard
      const hoverHeight = -10;
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(-30, hoverHeight, 60, 10, 5);
      ctx.fill();

      // Surfer Body
      if (state.isSliding) {
        // Crouched / Sliding pose
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-18, hoverHeight - 25, 36, 22);
        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, hoverHeight - 32, 10, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standing running pose
        // Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14, hoverHeight - 25, 10, 24);
        ctx.fillRect(4, hoverHeight - 25, 10, 24);

        // Hoodie jacket
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#0891b2';
        ctx.shadowBlur = 10;
        ctx.fillRect(-18, hoverHeight - 65, 36, 40);

        // Cap / Head
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, hoverHeight - 75, 13, 0, Math.PI * 2);
        ctx.fill();

        // Visor
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-10, hoverHeight - 78, 20, 6);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, soundEnabled, highScore]);

  return (
    <div className="flex flex-col items-center bg-[#070a0f] text-white rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl max-w-2xl mx-auto">
      {/* Top Controls Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0d131f] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Cyber Subway Surfer - GM S.F</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>أعلى رقم: {highScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            title="الصوت"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 px-3 py-1.5 rounded-lg transition"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative w-full aspect-[4/4.4] sm:aspect-[4/4.2] max-h-[580px] flex justify-center items-center bg-black overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          onTouchStart={(e) => {
            // Quick touch swipe detector
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;

            const handleTouchEnd = (te: TouchEvent) => {
              const endTouch = te.changedTouches[0];
              const dx = endTouch.clientX - startX;
              const dy = endTouch.clientY - startY;
              if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 30) handleMoveRight();
                else if (dx < -30) handleMoveLeft();
              } else {
                if (dy < -30) handleJump();
                else if (dy > 30) handleSlide();
              }
              window.removeEventListener('touchend', handleTouchEnd);
            };

            window.addEventListener('touchend', handleTouchEnd);
          }}
        />

        {/* Live HUD over canvas */}
        <div className="absolute top-3 left-4 right-4 flex justify-between pointer-events-none font-gaming">
          <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-cyan-500/40 text-left">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold">النقاط / Score</span>
            <span className="text-xl font-black text-white">{score}</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-500/40 text-right">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">العملات / Coins</span>
            <span className="text-xl font-black text-amber-300">🪙 {coins}</span>
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
              <span className="text-3xl">💥</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-1">اصطدام! انتهت الجولة</h3>
            <p className="text-slate-400 text-sm mb-4">لقد واجهت عائقاً في مسار السايبر السريع.</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-xs text-slate-400 block">نقاطك الحالية</span>
                <span className="text-xl font-bold text-cyan-400">{score}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-xs text-slate-400 block">العملات الذهبية</span>
                <span className="text-xl font-bold text-amber-400">🪙 {coins}</span>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة المحاولة والركض</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Friendly On-Screen D-Pad Controls */}
      <div className="w-full bg-[#0b101a] border-t border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
        <div className="text-xs text-slate-400 text-center sm:text-right">
          <span className="text-cyan-400 font-semibold block">تحكم الهواتف والكمبيوتر:</span>
          <span>اسحب باللمس أو استخدم الأزرار بالأسفل / الأسهم في الكيبورد</span>
        </div>

        {/* Direction buttons for touch users */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMoveLeft}
            className="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl flex items-center justify-center transition border border-slate-700 active:scale-90"
            title="يسار"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleJump}
              className="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl flex items-center justify-center transition border border-slate-700 active:scale-90"
              title="قفز"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleSlide}
              className="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl flex items-center justify-center transition border border-slate-700 active:scale-90"
              title="انزلاق"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleMoveRight}
            className="w-11 h-11 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl flex items-center justify-center transition border border-slate-700 active:scale-90"
            title="يمين"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
