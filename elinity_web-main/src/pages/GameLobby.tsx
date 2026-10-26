import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Play, Shield, Gamepad2, Info } from 'lucide-react';
import { fetchGameSessionDetails, type GameSession } from '../lib/gamesApi';
import { useGameSession } from '../hooks/useGameSession';
import { UnsaidLobbyConfig } from '../components/games/UnsaidLobbyConfig';
import type { UnsaidMode, UnsaidTerrain } from '../lib/gamesApi';
import { TurncoatLobbyConfig } from '../components/games/TurncoatLobbyConfig';
import type { LongTableMode, TurncoatMode } from '../lib/gamesApi';
import { LongTableLobbyConfig } from '../components/games/LongTableLobbyConfig';
import { GameOfGamesLobbyConfig } from '../components/games/GameOfGamesLobbyConfig';
import type { GameOfGamesMode, GameOfGamesPack } from '../lib/gamesApi';
import { loadGameOfGamesProfile } from '../lib/gameOfGamesProfile';
import { GameHelpButton } from '../components/games/GameHelpButton';

export default function GameLobby() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('elinity_play_username');
  });
  
  const [nameInput, setNameInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialSession, setInitialSession] = useState<GameSession | null>(null);

  // Fetch initial details to check if session exists
  useEffect(() => {
    async function checkSession() {
      if (!sessionId) return;
      try {
        const details = await fetchGameSessionDetails(sessionId);
        setInitialSession(details);
      } catch (err) {
        console.error('Session not found:', err);
        navigate('/play');
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [sessionId, navigate]);

  // Connect to the WebSocket room using our custom hook
  const {
    session,
    isConnected,
    toggleReady,
    startGame,
    updateMood,
    updateGameConfig,
    seedGameOfGamesProfile,
    error: wsError
  } = useGameSession(sessionId, username);
  const profileSeededRef = useRef<string | null>(null);

  // Determine active session state (pre-websocket fallback to initialSession)
  const activeSession = session || initialSession;

  useEffect(() => {
    if (!activeSession || activeSession.game_slug !== 'game-of-games' || activeSession.status !== 'LOBBY' || !username || !isConnected) return;
    const seedKey = `${activeSession.session_id}:${username}`;
    if (profileSeededRef.current === seedKey) return;
    const stored = loadGameOfGamesProfile(username);
    if (stored) {
      seedGameOfGamesProfile(stored);
    }
    profileSeededRef.current = seedKey;
  }, [activeSession, isConnected, seedGameOfGamesProfile, username]);

  // Auto-redirect to active session page once game starts
  useEffect(() => {
    if (activeSession?.status === 'ACTIVE' && username) {
      navigate(`/play/session/${sessionId}`);
    }
  }, [activeSession?.status, sessionId, username, navigate]);

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    localStorage.setItem('elinity_play_username', name);
    setUsername(name);
  };

  const handleCopyCode = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = activeSession?.players?.[0]?.username === username;
  const isReady = activeSession?.players?.find(p => p.username === username)?.ready || false;
  const isUnsaid = activeSession?.game_slug === 'the-unsaid';
  const isTurncoat = activeSession?.game_slug === 'turncoat';
  const isLongTable = activeSession?.game_slug === 'letters-long-table';
  const isGameOfGames = activeSession?.game_slug === 'game-of-games';
  const unsaidMode = (activeSession?.game_state?.mode || 'solo') as UnsaidMode;
  const unsaidTerrain = (activeSession?.game_state?.terrain || 'hard_thing') as UnsaidTerrain;
  const playerCount = activeSession?.players?.length || 0;
  const validUnsaidCount = unsaidMode === 'solo'
    ? playerCount === 1
    : unsaidMode === 'face_to_face'
      ? playerCount === 2
      : playerCount >= 3 && playerCount <= 6;
  const turncoatMode = (activeSession?.game_state?.mode || 'classic') as TurncoatMode;
  const turncoatRounds = activeSession?.game_state?.total_rounds || 3;
  const turncoatTerritory = activeSession?.game_state?.territory || 'mixed';
  const validTurncoatCount = playerCount >= 2 && playerCount <= 6;
  const longTableMode = (activeSession?.game_state?.mode || 'conversation') as LongTableMode;
  const longTableAges = activeSession?.game_state?.selected_ages || [];
  const gameOfGamesMode = (activeSession?.game_state?.mode || 'discovery') as GameOfGamesMode;
  const gameOfGamesPack = (activeSession?.game_state?.scenario_pack || 'foundations') as GameOfGamesPack;
  const gameOfGamesScenarioCount = activeSession?.game_state?.scenario_count || 3;
  const allPlayersReady = Boolean(
    playerCount > 0
    && (isUnsaid ? validUnsaidCount : isTurncoat ? validTurncoatCount : isLongTable ? playerCount === 1 : isGameOfGames ? playerCount <= 6 : playerCount >= 2)
    && activeSession?.players.every(p => p.ready)
  );
  const hasDisplayNameConflict = wsError?.includes('display name belongs to another participant') || false;

  const handleChooseDifferentName = () => {
    if (sessionId && username) {
      localStorage.removeItem(`elinity_game_token_${sessionId}_${username}`);
    }
    localStorage.removeItem('elinity_play_username');
    setNameInput(username ? `${username.slice(0, 12)} 2`.trim() : '');
    setUsername(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Joining Game Room...</p>
        </div>
      </div>
    );
  }

  // --- Display Name Prompt Mode ---
  if (!username) {
    return (
      <div className="min-h-screen bg-[#07070c] text-white flex items-center justify-center pt-28 pb-16 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] rounded-full bg-purple-500/5 filter blur-[100px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto px-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-6">
              <Users size={24} />
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Choose Display Name</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Enter the name other players in this session will see.
            </p>

            {wsError && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-left text-xs font-semibold leading-relaxed text-red-300">
                {hasDisplayNameConflict
                  ? 'That display name is already active in this room. Choose a different name for this browser.'
                  : wsError}
              </div>
            )}

            <form onSubmit={handleJoinLobby} className="space-y-4">
              <input
                type="text"
                maxLength={16}
                placeholder="e.g. Dreamer"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors text-center"
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Join Lobby
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Lobby Room Mode ---
  return (
    <div className="min-h-screen bg-[#07070c] text-white relative overflow-hidden font-sans pt-28 pb-16">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-indigo-500/5 filter blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Lobby Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              <Shield size={12} /> Game Lobby
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Playing {activeSession?.game_slug === 'drift' ? 'Drift' : activeSession?.game_slug === 'callout' ? 'Callout' : isUnsaid ? 'The Unsaid' : isTurncoat ? 'Turncoat: The Other Side' : isLongTable ? 'The Letters at the Long Table' : isGameOfGames ? 'The Game of Games' : activeSession?.game_slug}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-ping'}`} />
                {isConnected ? 'Connected' : 'Connecting to Server...'}
              </span>
              <span>•</span>
              <span className="text-purple-300">Mood: {activeSession?.mood}</span>
              <GameHelpButton gameSlug={activeSession?.game_slug} />
            </div>
          </div>

          {/* Invite code */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-6 min-w-[240px]">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Invite Code</p>
              <p className="text-lg font-mono font-bold tracking-wider text-purple-300">{activeSession?.invite_code}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-neutral-300 hover:text-white cursor-pointer active:scale-90"
              title="Copy invite code"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {wsError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Info size={14} /> {wsError}
            </div>
            {hasDisplayNameConflict && (
              <button
                type="button"
                onClick={handleChooseDifferentName}
                className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-200 transition hover:bg-red-500/20"
              >
                Choose a different name
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Connected players list */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-2">
              <Users size={16} className="text-purple-400" /> Players ({activeSession?.players?.length || 0})
            </h2>

            <div className="space-y-3">
              {activeSession?.players?.map((player, idx) => {
                const isPlayerHost = idx === 0;
                return (
                  <motion.div
                    key={player.username}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/20 flex items-center justify-center font-bold text-purple-200">
                        {player.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-200">{player.username}</p>
                          {player.username === username && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 font-bold">You</span>
                          )}
                        </div>
                        {isPlayerHost && (
                          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            Room Creator
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        player.ready
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                      }`}>
                        {player.ready ? 'Ready' : 'Waiting'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Lobby controls sidebar */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Lobby Controls
            </h2>

            <div className="bg-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur-md space-y-6">
              {isUnsaid && (
                <UnsaidLobbyConfig
                  mode={unsaidMode}
                  terrain={unsaidTerrain}
                  isHost={isHost}
                  onChange={updateGameConfig}
                />
              )}
              {isTurncoat && (
                <TurncoatLobbyConfig mode={turncoatMode} rounds={turncoatRounds} territory={turncoatTerritory} isHost={isHost} onChange={updateGameConfig} />
              )}
              {isLongTable && (
                <LongTableLobbyConfig username={username || ''} mode={longTableMode} selectedAges={longTableAges} isHost={isHost} onChange={updateGameConfig} />
              )}
              {isGameOfGames && (
                <GameOfGamesLobbyConfig
                  mode={gameOfGamesMode}
                  scenarioPack={gameOfGamesPack}
                  scenarioCount={gameOfGamesScenarioCount}
                  isHost={isHost}
                  onChange={updateGameConfig}
                />
              )}

              {/* Ready Button */}
              <div>
                <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                  Toggle your status to ready to signal you're set to start.
                </p>
                <button
                  onClick={() => toggleReady(!isReady)}
                  disabled={!isConnected}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer ${
                    isReady
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/15'
                  } disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100`}
                >
                  {!isConnected ? 'Connecting...' : isReady ? 'Not Ready' : 'Ready Up'}
                </button>
              </div>

              {/* Mood Selection */}
              {!isUnsaid && !isTurncoat && !isLongTable && (isHost ? (
                <div className="border-t border-white/10 pt-6">
                  <p className="text-xs text-neutral-400 mb-3 font-semibold uppercase tracking-wider">
                    Select Game Mood
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Playful', 'Reflective', 'Wild', 'Tender'].map((m) => {
                      const isSelected = activeSession?.mood === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => updateMood(m)}
                          disabled={!isConnected}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                              : 'bg-black/30 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                          } disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-6">
                  <p className="text-xs text-neutral-500 mb-1.5 uppercase tracking-wider font-bold">
                    Current Mood
                  </p>
                  <div className="py-2.5 px-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-between">
                    <span>{activeSession?.mood}</span>
                    <span className="text-[9px] text-purple-400/70 font-semibold uppercase italic">(Set by Host)</span>
                  </div>
                </div>
              ))}

              {/* Host Start Button */}
              {isHost && (
                <div className="border-t border-white/10 pt-6">
                  <p className="text-xs text-neutral-400 mb-4 leading-relaxed flex items-start gap-1.5">
                    <Gamepad2 size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      {isUnsaid
                        ? `This mode needs ${unsaidMode === 'solo' ? 'exactly 1 player' : unsaidMode === 'face_to_face' ? 'exactly 2 players' : '3–6 players'}, all ready.`
                        : isTurncoat ? 'Turncoat needs 2–6 players, all ready.'
                        : isLongTable ? 'The Long Table is private: exactly one player, ready to begin.'
                        : isGameOfGames ? 'The Game of Games supports 1–6 players, all ready.'
                        : 'As Room Creator, you launch the game once all players ready up (min 2 players).'}
                    </span>
                  </p>
                  <button
                    onClick={startGame}
                    disabled={!allPlayersReady || !isConnected}
                    className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-green-500/10"
                  >
                    <Play size={14} /> {isConnected ? 'Start Game' : 'Connecting...'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
