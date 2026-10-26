import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Clock, ArrowRight, Sparkles, Hash, Compass, ArrowRightLeft } from 'lucide-react';
import { fetchGamesCatalog, createGameSession, fetchGameSessionByCode, type GameCatalogItem } from '../lib/gamesApi';

export default function Play() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<GameCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await fetchGamesCatalog();
        setCatalog(data);
      } catch (err) {
        console.error('Failed to load games catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleStartLobby = async (gameSlug: string) => {
    try {
      setJoining(true);
      // Default to Reflective mood for Drift
      const res = await createGameSession(gameSlug, 'Reflective');
      navigate(`/play/lobby/${res.session_id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setJoinError('Could not start lobby. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    try {
      setJoining(true);
      setJoinError(null);
      const session = await fetchGameSessionByCode(inviteCode.trim());
      navigate(`/play/lobby/${session.session_id}`);
    } catch (err) {
      console.error(err);
      setJoinError('Invalid or expired invite code.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Opening Play Palace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070c] text-white relative overflow-hidden font-sans pt-28 pb-16">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 filter blur-[120px] animate-pulse" />
        <div className="absolute top-[50%] left-[5%] w-[450px] h-[450px] rounded-full bg-indigo-500/5 filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-purple-500/10"
          >
            <Gamepad2 size={30} className="animate-pulse" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Elinity Play Palace
          </h1>
          <p className="text-base md:text-lg text-purple-200/70 font-medium mb-8">
            Immersive, guided social games powered by Lumi & Vizzy.
          </p>

          {/* Join with code box */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl"
          >
            <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-400 mb-4 flex items-center justify-center gap-2">
              <Hash size={14} className="text-purple-400" /> Have an Invite Code?
            </h2>
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. EL-A243-3"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setJoinError(null);
                }}
                disabled={joining}
                className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors uppercase placeholder-neutral-600 font-mono tracking-wider"
              />
              <button
                type="submit"
                disabled={joining || !inviteCode.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Join Room
              </button>
            </form>
            {joinError && (
              <p className="text-red-400 text-xs mt-3 text-left font-medium">{joinError}</p>
            )}
          </motion.div>
        </div>

        {/* Game list heading */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Available Games</span>
          <div className="h-px bg-white/10 flex-grow" />
        </div>

        {/* Games list cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {catalog.map((game, idx) => (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1), duration: 0.5 }}
              className="bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-3xl p-8 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 flex flex-col justify-between group"
            >
              <div>
                {/* Badge tags */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Conversational
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Compass size={10} /> Guided by {game.host}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold mb-2 tracking-tight group-hover:text-purple-300 transition-colors">
                  {game.name}
                </h3>
                <p className="text-sm text-neutral-400 font-medium italic mb-4">
                  "{game.tagline}"
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                  {game.description}
                </p>

                {/* Meta details */}
                <div className="flex gap-6 mb-8 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Users size={14} className="text-neutral-500" />
                    <span>{game.players.min}–{game.players.max} Players</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Clock size={14} className="text-neutral-500" />
                    <span>{game.duration_range.min}–{game.duration_range.max} Mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Sparkles size={14} className="text-neutral-500" />
                    <span>{game.attributes.join(', ')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartLobby(game.slug)}
                disabled={joining}
                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all duration-300 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
              >
                Create Lobby
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
