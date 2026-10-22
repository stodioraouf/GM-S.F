import React, { useEffect, useRef, useState } from 'react';
import { Flame, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const ArcadeSpeedway: React.FC<Props> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [speedGauge, setSpeedGauge] = useState(120);
  const [nitro, setNitro] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const stateRef = useRef({
    carX: 200,
    carSpeed: 6,
    baseSpeed: 6,
    nitro: 100,
    isNitro: false,
    score: 0,
    roadOffset: 0,
    otherCars: [] as { x: number; y: number; speed: number; color: string }[],
    coins: [] as { x: number; y: number; collected: boolean }[],
    keys: { left: false, right: false, nitro: false },
    isDead: false,
    lastCarSpawn: 0,
  });

  const playSfx = (type: 'drift' | 'crash' | 'nitro') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'nitro') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext fallback
    }
  };

  const restart = () => {
    stateRef.current = {
      carX: 200,
      carSpeed: 6,
      baseSpeed: 6,
      nitro: 100,
      isNitro: false,
      score: 0,
      roadOffset: 0,
      otherCars: [],
      coins: [],
      keys: { left: false, right: false, nitro: false },
      isDead: false,
      lastCarSpawn: 0,
    };
    setScore(0);
    setNitro(100);
    setGameOver(false);
  };

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent, isDown: boolean) => {
      const k = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = isDown;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = isDown;
      if (e.key === ' ' || e.key === 'Shift') {
        e.preventDefault();
        k.nitro = isDown;
        stateRef.current.isNitro = isDown;
        setIsNitroActive(isDown);
        if (isDown) playSfx('nitro');
      }
    };

    const downHandler = (e: KeyboardEvent) => onKey(e, true);
    const upHandler = (e: KeyboardEvent) => onKey(e, false);

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [soundEnabled]);

  // Main loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 440;
    canvas.height = 680;

    const loop = (timestamp: number) => {
      const s = stateRef.current;

      if (!s.isDead) {
        // Speed calculation
        let targetSpeed = s.baseSpeed;
        if (s.keys.nitro && s.nitro > 0) {
          targetSpeed = 13;
          s.nitro = Math.max(0, s.nitro - 0.35);
          setNitro(Math.floor(s.nitro));
        } else {
          s.nitro = Math.min(100, s.nitro + 0.1);
          setNitro(Math.floor(s.nitro));
        }

        s.carSpeed = targetSpeed;
        setSpeedGauge(Math.floor(s.carSpeed * 18));

        // Horizontal steer
        const steerSpeed = s.carSpeed > 10 ? 8 : 6;
        if (s.keys.left && s.carX > 80) s.carX -= steerSpeed;
        if (s.keys.right && s.carX < 360) s.carX += steerSpeed;

        // Road animation
        s.roadOffset = (s.roadOffset + s.carSpeed) % 60;
        s.score += Math.floor(s.carSpeed / 2);
        setScore(s.score);

        // Spawn other cars
        if (timestamp - s.lastCarSpawn > (s.carSpeed > 10 ? 650 : 950)) {
          s.lastCarSpawn = timestamp;
          const lanes = [110, 170, 230, 290];
          const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
          const carColors = ['#f43f5e', '#a855f7', '#fbbf24', '#3b82f6'];

          s.otherCars.push({
            x: chosenLane,
            y: -70,
            speed: 2 + Math.random() * 2,
            color: carColors[Math.floor(Math.random() * carColors.length)],
          });
        }

        // Update other cars & check collisions
        for (let i = s.otherCars.length - 1; i >= 0; i--) {
          const oc = s.otherCars[i];
          oc.y += s.carSpeed - oc.speed;

          // Hit detection
          const playerY = 540;
          if (Math.abs(oc.y - playerY) < 65 && Math.abs(oc.x - s.carX) < 42) {
            // Collision!
            s.isDead = true;
            playSfx('crash');
            setGameOver(true);
            break;
          }

          if (oc.y > canvas.height + 80) {
            s.otherCars.splice(i, 1);
          }
        }
      }

      // ---------------- RENDER ----------------
      // Dark cyber terrain
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road track (center 300px)
      const roadLeft = 60;
      const roadWidth = 320;
      ctx.fillStyle = '#111827';
      ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);

      // Road glowing borders
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#0891b2';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(roadLeft, 0);
      ctx.lineTo(roadLeft, canvas.height);
      ctx.moveTo(roadLeft + roadWidth, 0);
      ctx.lineTo(roadLeft + roadWidth, canvas.height);
      ctx.stroke();

      // Lane dash lines
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 25]);
      ctx.lineDashOffset = -s.roadOffset;

      for (let l = 1; l <= 3; l++) {
        const lx = roadLeft + (roadWidth / 4) * l;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw other cars
      for (const oc of s.otherCars) {
        ctx.save();
        ctx.translate(oc.x, oc.y);

        // Body
        ctx.fillStyle = oc.color;
        ctx.shadowColor = oc.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-20, -35, 40, 70, 8);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14, -15, 28, 18);
        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.fillRect(-17, 28, 8, 4);
        ctx.fillRect(9, 28, 8, 4);

        ctx.restore();
      }

      // Draw Player Supercar
      if (!s.isDead) {
        ctx.save();
        ctx.translate(s.carX, 540);

        // Nitro Flames
        if (s.keys.nitro && s.nitro > 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.moveTo(-10, 35);
          ctx.lineTo(0, 60 + Math.random() * 15);
          ctx.lineTo(10, 35);
          ctx.fill();
        }

        // Car Body
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(-22, -40, 44, 80, 10);
        ctx.fill();

        // Roof & Windshield
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-16, -18, 32, 38, 5);
        ctx.fill();

        // Neon Racing Stripes
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-3, -38, 6, 76);

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
        ctx.fillRect(-18, -42, 9, 4);
        ctx.fillRect(9, -42, 9, 4);

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#070a0f] text-white rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl max-w-md mx-auto">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0d131f] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm">طريق النيون: توربو درفت - GM S.F</span>
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

      <div className="relative w-full aspect-[4/5.5] bg-black overflow-hidden select-none">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* HUD */}
        <div className="absolute top-3 left-4 right-4 flex justify-between pointer-events-none font-gaming">
          <div className="bg-slate-900/85 backdrop-blur px-3 py-1 rounded-xl border border-cyan-500/40">
            <span className="text-[10px] text-cyan-400 block font-bold">المسافة</span>
            <span className="text-base font-black text-white">{score} m</span>
          </div>
          <div className="bg-slate-900/85 backdrop-blur px-3 py-1 rounded-xl border border-amber-500/40 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span className="text-base font-black text-amber-300">{speedGauge} كم/س</span>
          </div>
        </div>

        {/* Nitro bar bottom overlay */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
          <div className="flex justify-between text-[11px] font-bold text-cyan-300 mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-cyan-400" /> طاقة النيترو (Nitro)
            </span>
            <span>{nitro}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
            <div
              className={`h-full transition-all duration-75 ${
                isNitroActive ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${nitro}%` }}
            />
          </div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-4xl mb-2">🚗💥</div>
            <h3 className="text-2xl font-black text-white mb-2">حادث مروري عنيف!</h3>
            <p className="text-slate-400 text-sm mb-4">قطعت مسافة {score} متراً بسرعة {speedGauge} كم/س.</p>
            <button
              onClick={restart}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>سباق جديد</span>
            </button>
          </div>
        )}
      </div>

      {/* Touch Control Bar for Mobile */}
      <div className="w-full bg-[#0b101a] border-t border-slate-800 p-3 flex items-center justify-between gap-3">
        <button
          onMouseDown={() => (stateRef.current.keys.left = true)}
          onMouseUp={() => (stateRef.current.keys.left = false)}
          onTouchStart={() => (stateRef.current.keys.left = true)}
          onTouchEnd={() => (stateRef.current.keys.left = false)}
          className="flex-1 py-3 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold rounded-xl transition border border-slate-700 text-center select-none active:scale-95"
        >
          ⬅️ يسار
        </button>
        <button
          onMouseDown={() => {
            stateRef.current.keys.nitro = true;
            setIsNitroActive(true);
            playSfx('nitro');
          }}
          onMouseUp={() => {
            stateRef.current.keys.nitro = false;
            setIsNitroActive(false);
          }}
          onTouchStart={() => {
            stateRef.current.keys.nitro = true;
            setIsNitroActive(true);
            playSfx('nitro');
          }}
          onTouchEnd={() => {
            stateRef.current.keys.nitro = false;
            setIsNitroActive(false);
          }}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black rounded-xl transition text-center select-none shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-1"
        >
          <Flame className="w-4 h-4" /> توربو NITRO
        </button>
        <button
          onMouseDown={() => (stateRef.current.keys.right = true)}
          onMouseUp={() => (stateRef.current.keys.right = false)}
          onTouchStart={() => (stateRef.current.keys.right = true)}
          onTouchEnd={() => (stateRef.current.keys.right = false)}
          className="flex-1 py-3 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold rounded-xl transition border border-slate-700 text-center select-none active:scale-95"
        >
          يمين ➡️
        </button>
      </div>
    </div>
  );
};
