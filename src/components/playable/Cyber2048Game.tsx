import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

type Board = number[][];

export const Cyber2048Game: React.FC<Props> = ({ onClose }) => {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('gm_sf_2048_best') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function getEmptyBoard(): Board {
    return [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  }

  function addRandomTile(b: Board): Board {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return b;
    const [randR, randC] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newB = b.map((row) => [...row]);
    newB[randR][randC] = Math.random() < 0.9 ? 2 : 4;
    return newB;
  }

  function getInitialBoard(): Board {
    let b = getEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    return b;
  }

  const slideRow = (row: number[]): { newRow: number[]; gained: number } => {
    const filtered = row.filter((val) => val !== 0);
    const newRow: number[] = [];
    let gained = 0;
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        newRow.push(mergedVal);
        gained += mergedVal;
        i += 2;
      } else {
        newRow.push(filtered[i]);
        i++;
      }
    }
    while (newRow.length < 4) {
      newRow.push(0);
    }
    return { newRow, gained };
  };

  const move = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver) return;

      let rotated = board.map((row) => [...row]);
      // Standardize to sliding left by rotating
      if (dir === 'right') {
        rotated = rotated.map((row) => row.reverse());
      } else if (dir === 'up') {
        rotated = transpose(rotated);
      } else if (dir === 'down') {
        rotated = transpose(rotated).map((row) => row.reverse());
      }

      let moved = false;
      let totalGained = 0;
      const afterSlide = rotated.map((row) => {
        const { newRow, gained } = slideRow(row);
        totalGained += gained;
        if (newRow.some((val, idx) => val !== row[idx])) {
          moved = true;
        }
        return newRow;
      });

      if (!moved) return;

      // Rotate back
      let finalBoard = afterSlide;
      if (dir === 'right') {
        finalBoard = finalBoard.map((row) => row.reverse());
      } else if (dir === 'up') {
        finalBoard = transpose(finalBoard);
      } else if (dir === 'down') {
        finalBoard = transpose(finalBoard.map((row) => row.reverse()));
      }

      const boardWithNew = addRandomTile(finalBoard);
      setBoard(boardWithNew);

      const newScore = score + totalGained;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('gm_sf_2048_best', newScore.toString());
      }

      // Check 2048 win
      for (const r of boardWithNew) {
        if (r.includes(2048) && !won) {
          setWon(true);
        }
      }

      // Check game over
      if (isGameOver(boardWithNew)) {
        setGameOver(true);
      }
    },
    [board, gameOver, score, bestScore, won]
  );

  function transpose(matrix: Board): Board {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  }

  function isGameOver(b: Board): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (c + 1 < 4 && b[r][c] === b[r][c + 1]) return false;
        if (r + 1 < 4 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  }

  const restart = () => {
    setBoard(getInitialBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        move('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        move('down');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  // Touch gestures for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-slate-800 text-slate-100 border border-cyan-500/30';
      case 4:
        return 'bg-slate-700 text-cyan-200 border border-cyan-400/40';
      case 8:
        return 'bg-cyan-900/60 text-cyan-300 border border-cyan-400/60 shadow-lg shadow-cyan-500/20';
      case 16:
        return 'bg-cyan-600 text-white font-black shadow-lg shadow-cyan-500/30';
      case 32:
        return 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/30';
      case 64:
        return 'bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/40';
      case 128:
        return 'bg-amber-600 text-white font-black shadow-lg shadow-amber-500/30';
      case 256:
        return 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/50';
      case 512:
        return 'bg-rose-600 text-white font-black shadow-lg shadow-rose-500/40';
      case 1024:
        return 'bg-purple-600 text-white font-black shadow-lg shadow-purple-500/50';
      case 2048:
        return 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white font-black animate-pulse shadow-xl shadow-cyan-500/60';
      default:
        return 'bg-slate-900/40 border border-slate-800/80';
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#070a0f] text-white rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl max-w-md mx-auto p-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-base text-cyan-400">سايبر 2048: النواة الذكية</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
            إغلاق
          </button>
        )}
      </div>

      {/* Score Bar */}
      <div className="w-full flex items-center justify-between gap-3 mb-4">
        <div className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl p-2 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">النقاط الحالية</span>
          <span className="text-lg font-black text-cyan-300">{score}</span>
        </div>
        <div className="flex-1 bg-slate-900 border border-amber-500/30 rounded-xl p-2 text-center">
          <span className="text-[11px] text-amber-400/90 block font-medium flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" /> أفضل رقم
          </span>
          <span className="text-lg font-black text-amber-300">{bestScore}</span>
        </div>
        <button
          onClick={restart}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition"
          title="إعادة البدء"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 2048 Grid */}
      <div
        className="relative bg-slate-950 p-3 rounded-2xl border border-slate-800 w-full aspect-square touch-none select-none flex flex-col justify-between"
        onTouchStart={(e) => {
          setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }}
        onTouchEnd={(e) => {
          if (!touchStart) return;
          const dx = e.changedTouches[0].clientX - touchStart.x;
          const dy = e.changedTouches[0].clientY - touchStart.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) move('right');
            else if (dx < -30) move('left');
          } else {
            if (dy > 30) move('down');
            else if (dy < -30) move('up');
          }
          setTouchStart(null);
        }}
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 h-full w-full">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-xl flex items-center justify-center font-bold text-lg sm:text-2xl transition-all duration-150 ${getTileColor(
                  val
                )}`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Win / Loss Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-2">انتهت الحركات الممكنة!</h3>
            <p className="text-slate-400 text-sm mb-4">حصلت على {score} نقطة في مصفوفة السايبر.</p>
            <button
              onClick={restart}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl transition"
            >
              لعبة جديدة
            </button>
          </div>
        )}

        {won && (
          <div className="absolute inset-0 bg-cyan-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <span className="text-4xl mb-2">🎉</span>
            <h3 className="text-2xl font-black text-cyan-300 mb-2">مبروك! وصلت إلى 2048</h3>
            <p className="text-slate-300 text-sm mb-4">لقد فتحت النواة الكاملة بنجاح.</p>
            <button
              onClick={() => setWon(false)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl"
            >
              مواصلة اللعب
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-3">
        اسحب في أي اتجاه باللمس على الهاتف، أو استخدم مفاتيح الأسهم في الكمبيوتر لدمج الكتل المتطابقة.
      </p>
    </div>
  );
};
