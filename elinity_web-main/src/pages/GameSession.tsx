import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, AlertCircle, Compass, ArrowLeft, Users, MessageSquare, X } from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';
import { UnsaidSession } from '../components/games/UnsaidSession';
import { TurncoatSession } from '../components/games/TurncoatSession';
import { LongTableSession } from '../components/games/LongTableSession';
import { GameOfGamesSession } from '../components/games/GameOfGamesSession';
import { GameHelpButton } from '../components/games/GameHelpButton';

export default function GameSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [username] = useState<string | null>(() => {
    return localStorage.getItem('elinity_play_username');
  });

  const [inputVal, setInputVal] = useState('');
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Redirect to dashboard if username is missing
  useEffect(() => {
    if (!username) {
      navigate('/play');
    }
  }, [username, navigate]);

  // Connect WebSocket
  const {
    session,
    isConnected,
    isHostTyping,
    error: wsError,
    submitAnswer,
    passTurn,
    useVeto,
    submitPrivateAnswer,
    submitGuess,
    submitBluff,
    submitVote,
    nextPhase,
    submitDepthChoice,
    submitReleaseSentence,
    pauseGame,
    resumeGame,
    stopGame,
    submitTurncoatSetup,
    submitTurncoatStance,
    submitTurncoatPeerScores,
    submitLettersCompass,
    submitLettersOccasion,
    submitLettersIntake,
    confirmLettersSparseIntake,
    submitLettersResponse,
    closeLettersSession
  } = useGameSession(sessionId, username);

  // Auto-scroll to bottom of chat history log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isHostTyping, showHistoryMobile]);

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !session) return;
    submitAnswer(inputVal.trim());
    setInputVal('');
  };

  const handlePass = () => {
    if (!session) return;
    passTurn();
    setInputVal('');
  };

  const activePlayer = session?.current_player_id;
  const isMyTurn = activePlayer === username;
  const currentRound = session?.current_round || 1;
  const isCompleted = session?.status === 'COMPLETED';

  // Callout variables
  const gameSlug = session?.game_slug;
  const isCallout = gameSlug === 'callout';
  const calloutPhase = session?.game_state?.phase;
  const targetPlayer = session?.game_state?.round_data?.target_player;
  const isTarget = targetPlayer === username;
  const isHost = session?.players?.[0]?.username === username;
  const scores = session?.game_state?.scores || {};
  const vetosUsed = session?.game_state?.vetos_used || {};
  const myVetoUsed = username ? (vetosUsed[username] || false) : false;
  const bluffOptions = session?.game_state?.round_data?.bluff_options || [];
  const hasVoted = username ? (session?.game_state?.round_data?.votes?.[username] !== undefined) : false;
  const hasSubmittedGuess = username ? (session?.game_state?.round_data?.guesses?.[username] !== undefined) : false;
  const hasSubmittedBluff = username ? (session?.game_state?.round_data?.bluffs?.[username] !== undefined) : false;
  const customTitles = session?.game_state?.custom_titles || null;

  // Extract latest question from Lumi
  const latestLumiMessage = [...(session?.messages || [])]
    .reverse()
    .find(msg => msg.sender === 'Lumi')?.content || 
    (session?.players?.length 
      ? `Welcome to Drift! Waiting for Lumi to begin the guided conversation...` 
      : 'Setting up room...');

  // Render player timeline message feed
  const renderHistoryFeed = () => {
    if (!session?.messages?.length && !isHostTyping) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-xs font-semibold py-12">
          <MessageSquare size={20} className="mb-2 opacity-40" />
          <p>No reflections recorded yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pr-2">
        {session?.messages?.map((msg, idx) => {
          const isLumi = msg.sender === 'Lumi';
          const isMe = msg.sender === username;
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div key={idx} className="flex justify-center my-2">
                <span className="text-[9px] font-bold text-neutral-500 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex flex-col ${isLumi ? 'items-start' : 'items-end'} space-y-1`}
            >
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-1">
                {isLumi ? 'Lumi (Host)' : msg.sender}
              </span>
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow ${
                  isLumi
                    ? 'bg-purple-950/20 border border-purple-500/10 text-purple-200/90 rounded-tl-none font-medium'
                    : isMe
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/5 text-neutral-400 rounded-tr-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isHostTyping && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-1">Lumi (Host)</span>
            <div className="flex items-center gap-1 bg-purple-950/20 border border-purple-500/10 rounded-2xl px-3 py-2 max-w-[65px] rounded-tl-none">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    );
  };

  if (!isConnected && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Connecting to session stage...</p>
        </div>
      </div>
    );
  }

  if (session?.game_slug === 'the-unsaid' && username) {
    return (
      <UnsaidSession
        session={session}
        username={username}
        isConnected={isConnected}
        isHostTyping={isHostTyping}
        error={wsError}
        onBack={() => navigate('/play')}
        onSubmitAnswer={submitAnswer}
        onPass={passTurn}
        onDepthChoice={submitDepthChoice}
        onRelease={submitReleaseSentence}
        onPause={pauseGame}
        onResume={resumeGame}
        onStop={stopGame}
      />
    );
  }

  if (session?.game_slug === 'turncoat' && username) {
    return (
      <TurncoatSession
        session={session}
        username={username}
        isConnected={isConnected}
        isHostTyping={isHostTyping}
        error={wsError}
        onBack={() => navigate('/play')}
        onSetup={submitTurncoatSetup}
        onStance={submitTurncoatStance}
        onArgument={submitAnswer}
        onPeerScores={submitTurncoatPeerScores}
        onNext={nextPhase}
      />
    );
  }

  if (session?.game_slug === 'letters-long-table' && username) {
    return (
      <LongTableSession
        session={session}
        username={username}
        isConnected={isConnected}
        isHostTyping={isHostTyping}
        error={wsError}
        onBack={() => navigate('/play')}
        onCompass={submitLettersCompass}
        onOccasion={submitLettersOccasion}
        onIntake={submitLettersIntake}
        onConfirmSparse={confirmLettersSparseIntake}
        onResponse={submitLettersResponse}
        onPass={passTurn}
        onPause={pauseGame}
        onResume={resumeGame}
        onClose={closeLettersSession}
      />
    );
  }

  if (session?.game_slug === 'game-of-games' && username) {
    return (
      <GameOfGamesSession
        session={session}
        username={username}
        isConnected={isConnected}
        error={wsError}
        onBack={() => navigate('/play')}
        onChoose={submitAnswer}
        onNext={nextPhase}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-white flex flex-col font-sans pt-2 relative overflow-hidden ">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-500/[0.02] filter blur-[150px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[550px] h-[550px] rounded-full bg-indigo-500/[0.02] filter blur-[150px]" />
      </div>

      {/* 1. Header Bar */}
      <header className="bg-black/30 border-b border-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/play')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-neutral-400 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 text-white">
              {isCallout ? 'Callout' : 'Drift'} <span className="text-purple-400 font-medium">({session?.mood} mode)</span>
            </h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">
              Round {currentRound} of 5
            </p>
          </div>
        </div>

        {/* Players list */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <GameHelpButton gameSlug={session?.game_slug} compact />
          {session?.players?.map((player) => {
            const isActive = player.username === activePlayer;
            return (
              <div
                key={player.username}
                className={`relative px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/20'
                    : 'bg-white/5 border-white/5 text-neutral-500'
                }`}
              >
                {isActive && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />}
                <span>{player.username}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-grow max-w-6xl mx-auto w-full px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden z-10">
        
        {/* Left Column: Scrollable History Log (Desktop) */}
        <div className="hidden md:flex md:col-span-1 flex-col bg-white/[0.02] border border-white/5 rounded-3xl p-5 h-full overflow-hidden backdrop-blur-sm">
          {isCallout && (
            <div className="mb-6 bg-purple-950/20 border border-purple-500/10 rounded-2xl p-4 shadow">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5">
                <Users size={12} /> Scoreboard
              </h4>
              <div className="space-y-2">
                {[...(session?.players || [])].sort((a, b) => (scores[b.username] || 0) - (scores[a.username] || 0)).map((p) => (
                  <div key={p.username} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-neutral-300 flex items-center gap-1">
                      {p.username}
                      {session?.game_state?.round_data?.target_player === p.username && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider scale-90">Target</span>
                      )}
                    </span>
                    <span className="text-purple-300 font-bold">{scores[p.username] || 0} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-1.5 border-b border-white/5 pb-3">
            <MessageSquare size={12} className="text-purple-400" /> Reflection Log
          </h3>
          <div className="flex-grow overflow-y-auto scrollbar-thin">
            {renderHistoryFeed()}
          </div>
        </div>

        {/* Right Column: Central Game Stage (Host Orb, Prompts, Input) */}
        <div className="md:col-span-2 flex flex-col justify-between h-full space-y-6">
          
          {/* Top Stage: Lumi Host Orb and Prompt Card */}
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm relative overflow-hidden">
            
            {/* Pulsing Host Orb */}
            <div className="relative mb-8">
              <motion.div
                animate={{
                  scale: isHostTyping ? [1, 1.08, 1] : [1, 1.03, 1],
                  boxShadow: isHostTyping
                    ? [
                        '0 0 30px rgba(124, 58, 237, 0.2)',
                        '0 0 50px rgba(124, 58, 237, 0.4)',
                        '0 0 30px rgba(124, 58, 237, 0.2)',
                      ]
                    : [
                        '0 0 20px rgba(124, 58, 237, 0.1)',
                        '0 0 30px rgba(124, 58, 237, 0.2)',
                        '0 0 20px rgba(124, 58, 237, 0.1)',
                      ],
                }}
                transition={{
                  duration: isHostTyping ? 1.5 : 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-white border border-white/10"
              >
                <Compass size={32} className={`${isHostTyping ? 'animate-spin-slow' : 'animate-pulse'}`} />
              </motion.div>
              {isHostTyping && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 border border-[#05050a] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
              )}
            </div>

            {/* Active Prompt text */}
            <div className="max-w-xl">
              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-3 block">
                {isHostTyping 
                  ? 'Lumi is formulating...' 
                  : isCallout && calloutPhase
                  ? `Lumi Speaks • ${calloutPhase.replace(/_/g, ' ')}`
                  : 'Lumi Speaks'}
              </span>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={latestLumiMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg md:text-xl font-medium leading-relaxed text-purple-100 tracking-wide"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  "{latestLumiMessage}"
                </motion.h1>
              </AnimatePresence>

              {/* Veto prompt button */}
              {isCallout && !myVetoUsed && !isCompleted && (
                <button
                  onClick={useVeto}
                  className="mt-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-600 hover:text-white text-amber-400 hover:border-amber-500 transition text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 mx-auto active:scale-95 shadow"
                >
                  <Sparkles size={12} className="text-amber-400 animate-pulse" /> Veto Prompt ({username ? (1 - (vetosUsed[username] ? 1 : 0)) : 1} Left)
                </button>
              )}
            </div>
          </div>

          {/* Bottom Stage: Action Input Box */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm relative">
            {wsError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} /> {wsError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {isCompleted ? (
                /* Concluded Drift/Callout Log Display */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-6 animate-fade-in"
                >
                  {customTitles ? (
                    <div className="space-y-4 max-w-xl mx-auto">
                      <h3 className="text-sm font-extrabold uppercase tracking-widest text-purple-400 flex items-center justify-center gap-1.5">
                        <Sparkles className="animate-pulse" size={16} /> Game Over: Custom Titles
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(customTitles).map(([player, title]) => (
                          <div key={player} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:border-purple-500/20 transition-all">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">{player}</span>
                            <span className="text-xs font-extrabold text-purple-300 tracking-wide font-sans">{title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xl mx-auto mb-6 bg-black/40 border border-white/5 rounded-2xl p-5 italic text-neutral-300 text-sm md:text-base leading-relaxed">
                      "{session?.drift_log}"
                    </div>
                  )}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => navigate('/play')}
                      className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-neutral-300 transition cursor-pointer"
                    >
                      Play Palace
                    </button>
                    <button
                      onClick={() => navigate('/conversations/history')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition cursor-pointer"
                    >
                      Life Book
                    </button>
                  </div>
                </motion.div>
              ) : isCallout ? (
                /* Callout Active Game Views */
                <motion.div
                  key={calloutPhase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Phase 1: PROMPT or SUBMITTING (Round 1 Sequential) */}
                  {(calloutPhase === 'PROMPT' || calloutPhase === 'SUBMITTING') && (
                    isMyTurn ? (
                      <form onSubmit={handleSendAnswer} className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Write your answer..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="flex-grow bg-black/40 border border-white/15 focus:border-purple-500/50 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors placeholder-neutral-700"
                          />
                          <button
                            type="submit"
                            disabled={!inputVal.trim()}
                            className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest pl-1 animate-pulse">
                          Your turn to answer the warmup question
                        </p>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
                          <p className="text-xs font-semibold text-neutral-400">
                            Waiting for <span className="text-purple-300 font-bold">{activePlayer}</span> to answer...
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Warm-up
                        </span>
                      </div>
                    )
                  )}

                  {/* Phase 2: TARGET SUBMITTING PRIVATE ANSWER (Round 2, 3, 4, 5) */}
                  {(calloutPhase === 'HOT_SEAT_SUBMITTING' || calloutPhase === 'BLUFF_SUBMITTING_TARGET' || calloutPhase === 'FINAL_SUBMITTING_TARGET' || calloutPhase === 'RAPID_SUBMITTING' && !session?.game_state?.round_data?.private_answer) && (
                    isTarget ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!inputVal.trim()) return;
                        submitPrivateAnswer(inputVal.trim());
                        setInputVal('');
                      }} className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Submit private answer (only you see this)..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="flex-grow bg-black/40 border border-amber-500/20 focus:border-amber-500 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors placeholder-neutral-700"
                          />
                          <button
                            type="submit"
                            disabled={!inputVal.trim()}
                            className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition-all cursor-pointer flex items-center justify-center shadow"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest pl-1 animate-pulse">
                          Your turn: Enter private answer
                        </p>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
                          <p className="text-xs font-semibold text-neutral-400">
                            Waiting for target player <span className="text-purple-300 font-bold">{targetPlayer}</span> to submit private answer...
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Secret Setup
                        </span>
                      </div>
                    )
                  )}

                  {/* Phase 3: GUESSING TARGET'S ANSWER (Round 2 & 5) */}
                  {(calloutPhase === 'HOT_SEAT_GUESSING' || calloutPhase === 'FINAL_GUESSING') && (
                    isTarget ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-500/50 rounded-full animate-ping" />
                          <p className="text-xs font-semibold text-neutral-400">
                            Other players are guessing your secret answer...
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Hot Seat
                        </span>
                      </div>
                    ) : hasSubmittedGuess ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <p className="text-xs font-semibold text-neutral-400">
                          Your guess has been recorded. Waiting for other players...
                        </p>
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">
                          Recorded
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!inputVal.trim()) return;
                        submitGuess(inputVal.trim());
                        setInputVal('');
                      }} className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder={`Guess ${targetPlayer}'s answer...`}
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="flex-grow bg-black/40 border border-white/15 focus:border-purple-500/50 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors placeholder-neutral-700"
                          />
                          <button
                            type="submit"
                            disabled={!inputVal.trim()}
                            className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest pl-1">
                          Guess {targetPlayer}'s private response!
                        </p>
                      </form>
                    )
                  )}

                  {/* Phase 4: RAPID SPEED GUESSING (Round 3) */}
                  {(calloutPhase === 'RAPID_SUBMITTING' && session?.game_state?.round_data?.private_answer) && (
                    isTarget ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-500/50 rounded-full animate-ping" />
                          <p className="text-xs font-semibold text-neutral-400">
                            Players are racing to guess your answer!
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest animate-pulse">
                          Speed Round
                        </span>
                      </div>
                    ) : hasSubmittedGuess ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <p className="text-xs font-semibold text-neutral-400">
                          Guess submitted. Waiting for others to finish...
                        </p>
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">
                          Recorded
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!inputVal.trim()) return;
                        submitGuess(inputVal.trim());
                        setInputVal('');
                      }} className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Type guess quickly! Speed bonus active..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="flex-grow bg-black/40 border border-red-500/20 focus:border-red-500 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors placeholder-neutral-700"
                          />
                          <button
                            type="submit"
                            disabled={!inputVal.trim()}
                            className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest pl-1 animate-pulse">
                          Speed Round: First correct guess gets +5 bonus pts!
                        </p>
                      </form>
                    )
                  )}

                  {/* Phase 5: WRITE BLUFF (Round 4) */}
                  {(calloutPhase === 'BLUFF_SUBMITTING_FAKE') && (
                    isTarget ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
                          <p className="text-xs font-semibold text-neutral-400">
                            Players are writing bluffs to trick others...
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Bluffs Pending
                        </span>
                      </div>
                    ) : hasSubmittedBluff ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <p className="text-xs font-semibold text-neutral-400">
                          Your bluff has been recorded. Waiting for other players...
                        </p>
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">
                          Recorded
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!inputVal.trim()) return;
                        submitBluff(inputVal.trim());
                        setInputVal('');
                      }} className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Write a fake answer to fool the room..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="flex-grow bg-black/40 border border-purple-500/20 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors placeholder-neutral-700"
                          />
                          <button
                            type="submit"
                            disabled={!inputVal.trim()}
                            className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest pl-1 animate-pulse">
                          Write a bluff! You earn +5 points for every vote it tricks.
                        </p>
                      </form>
                    )
                  )}

                  {/* Phase 6: VOTE FOR BLUFF (Round 4) */}
                  {calloutPhase === 'BLUFF_VOTING' && (
                    isTarget ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
                          <p className="text-xs font-semibold text-neutral-400">
                            Players are voting on the bluffs...
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Voting
                        </span>
                      </div>
                    ) : hasVoted ? (
                      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                        <p className="text-xs font-semibold text-neutral-400">
                          Your vote has been recorded. Waiting for others...
                        </p>
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">
                          Recorded
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-neutral-400 mb-2">Vote for the REAL answer:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {bluffOptions.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitVote(idx)}
                              className="w-full text-left px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-950/20 text-xs font-bold transition-all cursor-pointer hover:shadow-md active:scale-98"
                            >
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {/* Phase 7: REVEAL RESULTS */}
                  {calloutPhase === 'REVEAL' && (
                    <div className="text-center space-y-4">
                      <p className="text-xs text-neutral-400 font-medium">Reveal results & commentary are shown above.</p>
                      {(isHost || isTarget) ? (
                        <button
                          onClick={nextPhase}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                          Next Stage
                        </button>
                      ) : (
                        <p className="text-xs text-neutral-500 italic animate-pulse">Waiting for host/target player to advance...</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Original Drift Active Turn Action Panels */
                <motion.div
                  key="active-turn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isMyTurn ? (
                    <form onSubmit={handleSendAnswer} className="space-y-4">
                      {session.twist_offered && (
                        <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles size={12} className="animate-pulse" />
                          <span>Optional Twist Offered! Respond or Pass.</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="Write your reflection here..."
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          className="flex-grow bg-black/40 border border-white/15 focus:border-purple-500/50 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors placeholder-neutral-700"
                        />
                        <button
                          type="button"
                          onClick={handlePass}
                          className="px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer active:scale-95"
                        >
                          Pass
                        </button>
                        <button
                          type="submit"
                          disabled={!inputVal.trim()}
                          className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest pl-1 animate-pulse">
                        Your turn to speak
                      </p>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-5 text-neutral-400">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
                        <p className="text-xs font-semibold text-neutral-400">
                          Waiting for <span className="text-purple-300 font-bold">{activePlayer}</span> to speak...
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                        Reflecting
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Floating History Trigger */}
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowHistoryMobile(true)}
          className="p-4 rounded-full bg-purple-600 text-white shadow-xl hover:bg-purple-500 transition active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <MessageSquare size={20} />
        </button>
      </div>

      {/* Mobile Slide-Over History Panel */}
      <AnimatePresence>
        {showHistoryMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryMobile(false)}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            {/* Side Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#07070d] border-l border-white/10 z-50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-purple-400" /> Chat Log
                  </h3>
                  <button
                    onClick={() => setShowHistoryMobile(false)}
                    className="p-1 rounded-lg hover:bg-white/5 text-neutral-400"
                  >
                    <X size={18} />
                  </button>
                </div>
                {isCallout && (
                  <div className="mb-6 bg-purple-950/20 border border-purple-500/10 rounded-2xl p-4 shadow">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5">
                      <Users size={12} /> Scoreboard
                    </h4>
                    <div className="space-y-2">
                      {[...(session?.players || [])].sort((a, b) => (scores[b.username] || 0) - (scores[a.username] || 0)).map((p) => (
                        <div key={p.username} className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-neutral-300 flex items-center gap-1">
                            {p.username}
                            {session?.game_state?.round_data?.target_player === p.username && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider scale-90">Target</span>
                            )}
                          </span>
                          <span className="text-purple-300 font-bold">{scores[p.username] || 0} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {renderHistoryFeed()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
