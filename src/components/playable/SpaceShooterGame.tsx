import React, { useEffect, useRef, useState } from 'react';
import { Shield, Sparkles, RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const SpaceShooterGame: React.FC<Props> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gm_sf_space_highscore') || '0', 10);
  });

  const stateRef = useRef({
    playerX: 300,
    playerY: 580,
    playerVx: 0,
    shield: 100,
    lives: 3,
    score: 0,
    bullets: [] as { x: number; y: number; vy: number }[],
    enemies: [] as { x: number; y: number; vx: number; vy: number; hp: number; type: 'drone' | 'cruiser' }[],
    stars: [] as { x: number; y: number; size: number; speed: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    lastShot: 0,
    lastSpawn: 0,
    keys: { left: false, right: false, up: false, down: false, shoot: false },
    isDead: false,
  });

  const playSfx = (type: 'shoot' | 'explode' | 'powerup') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'shoot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'explode') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext policy
    }
  };

  const restartGame = () => {
    const s = stateRef.current;
    s.playerX = 300;
    s.playerY = 580;
    s.lives = 3;
    s.shield = 100;
    s.score = 0;
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.isDead = false;
    setScore(0);
    setLives(3);
    setGameOver(false);
  };

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') k.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') k.down = true;
      if (e.key === ' ' || e.key === 'Control') {
        e.preventDefault();
        k.shoot = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') k.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') k.down = false;
      if (e.key === ' ' || e.key === 'Control') k.shoot = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 700;

    // Init stars
    stateRef.current.stars = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 2 + 1,
    }));

    const loop = (timestamp: number) => {
      const s = stateRef.current;

      if (!s.isDead) {
        // Player movement
        const speed = 7;
        if (s.keys.left && s.playerX > 30) s.playerX -= speed;
        if (s.keys.right && s.playerX < canvas.width - 30) s.playerX += speed;
        if (s.keys.up && s.playerY > 80) s.playerY -= speed;
        if (s.keys.down && s.playerY < canvas.height - 40) s.playerY += speed;

        // Auto or manual firing
        if (s.keys.shoot || timestamp - s.lastShot > 180) {
          s.lastShot = timestamp;
          s.bullets.push({ x: s.playerX - 12, y: s.playerY - 20, vy: -12 });
          s.bullets.push({ x: s.playerX + 12, y: s.playerY - 20, vy: -12 });
          playSfx('shoot');
        }

        // Spawn enemies
        if (timestamp - s.lastSpawn > 900) {
          s.lastSpawn = timestamp;
          const isCruiser = Math.random() > 0.7;
          s.enemies.push({
            x: Math.random() * (canvas.width - 80) + 40,
            y: -40,
            vx: (Math.random() - 0.5) * 2,
            vy: isCruiser ? 2 : 3.5,
            hp: isCruiser ? 3 : 1,
            type: isCruiser ? 'cruiser' : 'drone',
          });
        }

        // Update Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.y += b.vy;
          if (b.y < -10) s.bullets.splice(i, 1);
        }

        // Update Enemies & Collisions
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const en = s.enemies[i];
          en.x += en.vx;
          en.y += en.vy;

          if (en.x < 30 || en.x > canvas.width - 30) en.vx *= -1;

          // Check bullet hit
          for (let bIdx = s.bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = s.bullets[bIdx];
            const dx = b.x - en.x;
            const dy = b.y - en.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 26) {
              s.bullets.splice(bIdx, 1);
              en.hp -= 1;
              if (en.hp <= 0) {
                // Spawn explosion particles
                for (let p = 0; p < 12; p++) {
                  s.particles.push({
                    x: en.x,
                    y: en.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 20,
                    color: en.type === 'cruiser' ? '#ec4899' : '#06b6d4',
                  });
                }
                playSfx('explode');
                s.score += en.type === 'cruiser' ? 250 : 100;
                setScore(s.score);
                s.enemies.splice(i, 1);
                break;
              }
            }
          }

          // Check player collision
          if (!s.isDead) {
            const pDx = s.playerX - en.x;
            const pDy = s.playerY - en.y;
            const pDist = Math.sqrt(pDx * pDx + pDy * pDy);

            if (pDist < 35) {
              s.enemies.splice(i, 1);
              s.lives -= 1;
              setLives(s.lives);
              playSfx('explode');

              if (s.lives <= 0) {
                s.isDead = true;
                setGameOver(true);
                if (s.score > highScore) {
                  setHighScore(s.score);
                  localStorage.setItem('gm_sf_space_highscore', s.score.toString());
                }
              }
            }
          }

          if (en.y > canvas.height + 40) {
            s.enemies.splice(i, 1);
          }
        }

        // Update particles
        for (let p = s.particles.length - 1; p >= 0; p--) {
          const pt = s.particles[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          if (pt.life <= 0) s.particles.splice(p, 1);
        }
      }

      // ------------ RENDER ------------
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (const st of s.stars) {
        st.y += st.speed;
        if (st.y > canvas.height) {
          st.y = 0;
          st.x = Math.random() * canvas.width;
        }
        ctx.globalAlpha = Math.min(1, st.speed / 2);
        ctx.fillRect(st.x, st.y, st.size, st.size);
      }
      ctx.globalAlpha = 1;

      // Draw Bullets
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      for (const b of s.bullets) {
        ctx.fillRect(b.x - 2, b.y, 4, 14);
      }

      // Draw Enemies
      for (const en of s.enemies) {
        ctx.save();
        ctx.translate(en.x, en.y);
        if (en.type === 'cruiser') {
          // Bigger alien ship
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#fb7185';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(0, 24);
          ctx.lineTo(-26, -18);
          ctx.lineTo(26, -18);
          ctx.closePath();
          ctx.fill();
        } else {
          // Drone
          ctx.fillStyle = '#a855f7';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Particles
      for (const pt of s.particles) {
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
      }

      // Draw Player Ship
      if (!s.isDead) {
        ctx.save();
        ctx.translate(s.playerX, s.playerY);

        // Engine glow
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(-10, 15);
        ctx.lineTo(0, 30 + Math.random() * 8);
        ctx.lineTo(10, 15);
        ctx.closePath();
        ctx.fill();

        // Hull
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(-22, 14);
        ctx.lineTo(0, 6);
        ctx.lineTo(22, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, -6, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [highScore, soundEnabled]);

  return (
    <div className="flex flex-col items-center bg-[#070a0f] text-white rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl max-w-xl mx-auto">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0d131f] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm">حامي الفضاء الكوني - Cosmic Defender</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          {onClose && (
            <button onClick={onClose} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
              إغلاق
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-[4/4.8] max-h-[550px] bg-black overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain cursor-crosshair"
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const rx = ((touch.clientX - rect.left) / rect.width) * 600;
            const ry = ((touch.clientY - rect.top) / rect.height) * 700;
            stateRef.current.playerX = Math.max(30, Math.min(570, rx));
            stateRef.current.playerY = Math.max(100, Math.min(660, ry));
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const rx = ((e.clientX - rect.left) / rect.width) * 600;
            const ry = ((e.clientY - rect.top) / rect.height) * 700;
            stateRef.current.playerX = Math.max(30, Math.min(570, rx));
            stateRef.current.playerY = Math.max(100, Math.min(660, ry));
          }}
        />

        <div className="absolute top-3 left-4 right-4 flex justify-between pointer-events-none font-gaming">
          <div className="bg-slate-900/80 px-3 py-1 rounded-xl border border-cyan-500/30">
            <span className="text-[10px] text-cyan-400 block font-bold">النقاط</span>
            <span className="text-lg font-black text-white">{score}</span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1 rounded-xl border border-rose-500/30 flex items-center gap-1">
            <span className="text-rose-400 text-xs font-bold">المحاولات:</span>
            <span className="text-sm font-black text-white">{'❤️ '.repeat(Math.max(0, lives))}</span>
          </div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-4xl mb-2">🚀💥</div>
            <h3 className="text-2xl font-black text-white mb-2">تحطمت المركبة!</h3>
            <p className="text-slate-400 text-sm mb-4">لقد اجتاحت موجات الأعداء دفاعاتك الفضائية.</p>
            <div className="text-cyan-400 font-bold mb-6 text-lg">النتيجة النهائية: {score} نقطة</div>
            <button
              onClick={restartGame}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة الإطلاق</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full bg-[#0b101a] border-t border-slate-800 p-3 text-center text-xs text-slate-400">
        💡 <strong className="text-cyan-300">طريقة التحكم:</strong> حرّك الماوس أو المس الشاشة لتحريك السفينة في جميع الاتجاهات (الهاتف والكمبيوتر).
      </div>
    </div>
  );
};
