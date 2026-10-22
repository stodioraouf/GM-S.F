/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_GAMES } from './data/games';
import { Game, DeviceType, GameGenre, HumanVerificationState } from './types/game';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { DeviceFilterBar } from './components/DeviceFilterBar';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { PlayableGameModal } from './components/PlayableGameModal';
import { AntiBotModal } from './components/AntiBotModal';
import { SecurityCenterModal } from './components/SecurityCenterModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { GamesStatsChart } from './components/GamesStatsChart';
import { Footer } from './components/Footer';
import { ShieldAlert, ShieldCheck, Zap, Sparkles, FilterX } from 'lucide-react';

export default function App() {
  // Filter and Search States
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<GameGenre | 'all'>('all');
  const [onlyPlayable, setOnlyPlayable] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'downloads'>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals & Selected Games
  const [activeDetailGame, setActiveDetailGame] = useState<Game | null>(null);
  const [activePlayableGame, setActivePlayableGame] = useState<Game | null>(null);
  const [isAntiBotModalOpen, setIsAntiBotModalOpen] = useState(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Pending action requiring human verification
  const [pendingAction, setPendingAction] = useState<{ type: 'play' | 'download'; game: Game } | null>(null);

  // Human Verification State (GM Sentinel Anti-Bot)
  const [verificationState, setVerificationState] = useState<HumanVerificationState>(() => {
    try {
      const saved = localStorage.getItem('gm_sf_verified_human');
      if (saved) {
        const parsed: HumanVerificationState = JSON.parse(saved);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return {
      isVerified: false,
      trustScore: 0,
    };
  });

  // Bookmarked Games
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gm_sf_bookmarks');
      return saved ? JSON.parse(saved) : ['subway-surfers', 'pubg-mobile'];
    } catch {
      return ['subway-surfers', 'pubg-mobile'];
    }
  });

  const toggleBookmark = (gameId: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId];
      localStorage.setItem('gm_sf_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  // Trigger Play Instant with Anti-Bot Verification
  const handlePlayInstant = (game: Game) => {
    if (!verificationState.isVerified) {
      setPendingAction({ type: 'play', game });
      setIsAntiBotModalOpen(true);
      return;
    }
    setActivePlayableGame(game);
  };

  // Trigger Download / Details with Anti-Bot Verification
  const handleVerifyAndDownload = (game: Game) => {
    setPendingAction({ type: 'download', game });
    setIsAntiBotModalOpen(true);
  };

  // Handle Verification Success Callback
  const handleVerificationSuccess = (newState: HumanVerificationState) => {
    setVerificationState(newState);

    if (pendingAction) {
      const currentAction = pendingAction;
      setPendingAction(null);
      if (currentAction.type === 'play') {
        setActivePlayableGame(currentAction.game);
      } else if (currentAction.type === 'download') {
        alert(`تم توثيق هويتك البشرية بنجاح! بدأ التحميل الآمن والمجاني للعبة ${currentAction.game.titleAr}`);
      }
    }
  };

  // Filtered & Sorted Games List
  const filteredGames = useMemo(() => {
    let result = [...INITIAL_GAMES];

    // Device filter
    if (selectedDevice !== 'all') {
      result = result.filter((g) => g.devices.includes(selectedDevice));
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter((g) => g.genre === selectedGenre);
    }

    // Only playable in browser
    if (onlyPlayable) {
      result = result.filter((g) => g.isPlayableInBrowser);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.titleAr.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.descriptionAr.toLowerCase().includes(q) ||
          g.genreAr.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [selectedDevice, selectedGenre, onlyPlayable, searchQuery, sortBy]);

  const bookmarkedGames = useMemo(() => {
    return INITIAL_GAMES.filter((g) => bookmarkedIds.includes(g.id));
  }, [bookmarkedIds]);

  // Dynamic game count per genre based on active device filter
  const genreCounts = useMemo(() => {
    const baseList = selectedDevice === 'all'
      ? INITIAL_GAMES
      : INITIAL_GAMES.filter((g) => g.devices.includes(selectedDevice));

    const counts: Record<string, number> = {};
    for (const game of baseList) {
      counts[game.genre] = (counts[game.genre] || 0) + 1;
    }
    return counts;
  }, [selectedDevice]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Global Navigation Bar */}
      <Navbar
        selectedDevice={selectedDevice}
        onSelectDevice={setSelectedDevice}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        verificationState={verificationState}
        onOpenAntiBot={() => {
          setPendingAction(null);
          setIsAntiBotModalOpen(true);
        }}
        onOpenSecurityCenter={() => setIsSecurityCenterOpen(true)}
        bookmarkedCount={bookmarkedIds.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Anti-Bot Security Status Bar Alert */}
        <div className="mb-6 p-3 rounded-2xl bg-[#0c1222] border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {verificationState.isVerified ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-300">
              {verificationState.isVerified ? (
                <>
                  <strong className="text-emerald-400 font-bold ml-1">هوية بشرية موثقة بنجاح:</strong>
                  خوادم GM S.F مفتوحة لك بالكامل للعب والتحميل المجاني بلا قيود.
                </>
              ) : (
                <>
                  <strong className="text-amber-400 font-bold ml-1">نظام حماية ذكي مفعل:</strong>
                  يتم فحص المؤشرات اللمسية وسرعة الأعصاب لمنع روبوتات البوتات وضمان سرعة السيرفرات لجميع اللاعبين.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSecurityCenterOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs transition"
            >
              عرض سجل حظر البوتات المباشر
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => {
                setPendingAction(null);
                setIsAntiBotModalOpen(true);
              }}
              className="text-slate-300 hover:text-white font-medium text-xs transition"
            >
              {verificationState.isVerified ? 'إعادة الفحص' : 'فحص هويتي الآن'}
            </button>
          </div>
        </div>

        {/* 3. Hero Spotlight Banner */}
        <HeroBanner
          onQuickPlay={() => {
            const runner = INITIAL_GAMES.find((g) => g.id === 'subway-surfers');
            if (runner) handlePlayInstant(runner);
          }}
          onOpenAntiBot={() => {
            setPendingAction(null);
            setIsAntiBotModalOpen(true);
          }}
          onSelectDevice={setSelectedDevice}
          isVerified={verificationState.isVerified}
        />

        {/* 4. Electronic Device & Genre Filters */}
        <DeviceFilterBar
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          onlyPlayable={onlyPlayable}
          onToggleOnlyPlayable={() => setOnlyPlayable(!onlyPlayable)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalGamesCount={filteredGames.length}
          genreCounts={genreCounts}
        />

        {/* 5. Games Grid Section */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={setActiveDetailGame}
                onPlayInstant={handlePlayInstant}
                isBookmarked={bookmarkedIds.includes(game.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#0d1322]/40 rounded-3xl border border-slate-800/80 p-8">
            <FilterX className="w-14 h-14 mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">لم يتم العثور على ألعاب مطابقة</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              جرب تغيير نوع الجهاز المختار أو إزالة كلمات البحث للوصول لكامل مكتبة GM S.F المجانية.
            </p>
            <button
              onClick={() => {
                setSelectedDevice('all');
                setSelectedGenre('all');
                setOnlyPlayable(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 transition"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}

        {/* 6. Interactive Recharts Games Analytics Section */}
        <GamesStatsChart
          games={filteredGames.length > 0 ? filteredGames : INITIAL_GAMES}
          onSelectGame={setActiveDetailGame}
        />
      </main>

      {/* 7. Modals */}
      {/* Smart Anti-Bot Human Verification Gate */}
      <AntiBotModal
        isOpen={isAntiBotModalOpen}
        onClose={() => setIsAntiBotModalOpen(false)}
        onVerified={handleVerificationSuccess}
        gameTitle={pendingAction?.game?.titleAr}
        actionReason={
          pendingAction?.type === 'play'
            ? 'لإطلاق اللعبة الفورية والتحقق من عدم وجود برامج آلية'
            : 'لفتح روابط التحميل المجاني والتأكد من هويتك البشرية'
        }
      />

      {/* Security Center & Live Bot Blocking Logs */}
      <SecurityCenterModal
        isOpen={isSecurityCenterOpen}
        onClose={() => setIsSecurityCenterOpen(false)}
        verificationState={verificationState}
        onTriggerVerification={() => {
          setPendingAction(null);
          setIsAntiBotModalOpen(true);
        }}
      />

      {/* Game Details & Requirements Modal */}
      <GameDetailModal
        game={activeDetailGame}
        onClose={() => setActiveDetailGame(null)}
        onPlayInstant={handlePlayInstant}
        onVerifyAndDownload={handleVerifyAndDownload}
        isBookmarked={activeDetailGame ? bookmarkedIds.includes(activeDetailGame.id) : false}
        onToggleBookmark={toggleBookmark}
        verificationState={verificationState}
      />

      {/* Playable Web Game Container Modal */}
      <PlayableGameModal
        game={activePlayableGame}
        onClose={() => setActivePlayableGame(null)}
      />

      {/* Bookmarks & Saved Games Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedGames={bookmarkedGames}
        onSelectGame={setActiveDetailGame}
        onPlayInstant={handlePlayInstant}
        onRemoveBookmark={toggleBookmark}
      />

      {/* 7. Footer */}
      <Footer
        onOpenSecurityCenter={() => setIsSecurityCenterOpen(true)}
        onOpenAntiBot={() => {
          setPendingAction(null);
          setIsAntiBotModalOpen(true);
        }}
      />
    </div>
  );
}
