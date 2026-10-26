import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, MessageSquare, FileText, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import type { Persona } from '../../types/conversation';
import { useVoice } from '../../hooks/useVoice';

interface VoiceSessionProps {
  persona: Persona;
  messages: Array<{ sender: 'user' | 'persona'; text: string }>;
  isPersonaThinking: boolean;
  onSwitchToText: () => void;
  onEndSession: () => void;
  sessionId: string;
  onVoiceExchange: (text: string, sender: 'user' | 'persona') => void;
  onConclude: (reflection: any) => void;
  onThinkingStateChange: (thinking: boolean) => void;
}

export const VoiceSession: React.FC<VoiceSessionProps> = ({
  persona,
  messages,
  isPersonaThinking,
  onSwitchToText,
  onEndSession,
  sessionId,
  onVoiceExchange,
  onConclude,
  onThinkingStateChange,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Initialize real-time voice handling hook
  const {
    isRecording,
    isPlaying,
    isThinking,
    micVolume,
    audioVolume,
    error,
    startRecording,
    stopRecording,
    stopAudio,
  } = useVoice({
    sessionId,
    isMuted,
    onSendMessage: (text) => onVoiceExchange(text, 'user'),
    onAddPersonaMessage: (text) => onVoiceExchange(text, 'persona'),
    onThinkingStateChange,
    onConclude,
  });

  // Map hook states to visual state machine
  let voiceState: 'idle' | 'speaking' | 'listening' = 'idle';
  if (isThinking || isPersonaThinking) {
    voiceState = 'idle';
  } else if (isPlaying) {
    voiceState = 'speaking';
  } else if (isRecording) {
    voiceState = 'listening';
  }

  // Determine last message from persona to display on screen
  const lastMessage = [...messages].reverse().find((m) => m.sender === 'persona');

  // Triggered when manual mic button is clicked
  const handleTapToTalk = () => {
    if (isMuted) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSwitchToText = () => {
    stopAudio();
    onSwitchToText();
  };

  const handleEndSession = () => {
    stopAudio();
    onEndSession();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06060c] text-white flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Voice Session with {persona.name} {isMuted && '(Muted)'}
          </span>
        </div>
        <button
          onClick={handleSwitchToText}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <MessageSquare size={13} /> Switch to Text
        </button>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="absolute top-20 z-20 flex items-center gap-2 bg-red-950/80 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl max-w-sm text-center shadow-lg">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Center content: Portrait & Waveform */}
      <div className="flex flex-col items-center justify-center flex-grow z-10 gap-8">
        {/* Large Portrait container */}
        <div className="relative">
          {/* Glowing ring under portrait */}
          <AnimatePresence>
            {voiceState === 'speaking' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0.15, 0.3, 0.15],
                  scale: [1, 1.15, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 filter blur-xl"
              />
            )}
            {voiceState === 'listening' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0.1, 0.25, 0.1],
                  scale: [1, 1.08, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 filter blur-xl"
              />
            )}
          </AnimatePresence>

          {/* Actual Portrait */}
          <motion.div
            animate={
              voiceState === 'speaking'
                ? { scale: [1, 1.02, 1] }
                : voiceState === 'listening'
                ? { scale: [1, 0.99, 1] }
                : { scale: 1 }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl relative bg-neutral-950"
          >
            <img
              src={persona.portrait}
              alt={persona.name}
              className="w-full h-full object-cover grayscale"
            />
            {/* Visual darken overlay */}
            <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
          </motion.div>
        </div>

        {/* State and transcript line */}
        <div className="text-center max-w-md px-4 min-h-[90px] flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-neutral-400 mb-2 uppercase tracking-widest">
            {voiceState === 'speaking' && `${persona.name} is speaking...`}
            {voiceState === 'listening' && (isRecording ? 'Listening...' : 'Connecting...')}
            {voiceState === 'idle' && (
              isThinking || isPersonaThinking 
                ? `${persona.name} is reflecting...` 
                : 'Microphone inactive'
            )}
          </h3>
          <p className="text-base font-medium text-neutral-200 line-clamp-3 italic">
            {voiceState === 'speaking' && lastMessage ? `"${lastMessage.text}"` : ''}
            {voiceState === 'listening' && 'Speak naturally to reply...'}
            {voiceState === 'idle' && (
              isThinking || isPersonaThinking 
                ? 'Thinking...' 
                : 'Tap the microphone icon below to start speaking.'
            )}
          </p>
        </div>

        {/* Dynamic Waveform indicator (Spring animated using real volume data) */}
        <div className="h-12 flex items-center justify-center gap-1.5 w-64">
          {Array.from({ length: 15 }).map((_, i) => {
            const currentVolume = voiceState === 'listening' ? micVolume : voiceState === 'speaking' ? audioVolume : 0;
            // Distribute volumes like a standard visualizer bell-curve
            const curveFactor = Math.sin((i / 14) * Math.PI);
            const calculatedHeight = Math.max(15, currentVolume * 100 * curveFactor);

            return (
              <motion.div
                key={i}
                animate={{ height: `${calculatedHeight}%` }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className={`w-1 rounded-full transition-colors duration-300 ${
                  voiceState === 'listening' 
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                    : voiceState === 'speaking' 
                    ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.3)]'
                    : 'bg-white/10'
                }`}
                style={{ height: '15%' }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="w-full flex flex-col items-center gap-6 z-10">
        {/* Toggle Transcript drawer button */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <FileText size={12} />
          {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
          {showTranscript ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        {/* Controls Layout */}
        <div className="flex items-center gap-6">
          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
            }`}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* End Call / End Session Button */}
          <button
            onClick={handleEndSession}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-900/30 hover:shadow-red-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <PhoneOff size={24} />
          </button>

          {/* Manual Record Trigger / Tap-to-Talk button */}
          <button
            onClick={handleTapToTalk}
            disabled={isMuted}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
              !isMuted
                ? isRecording
                  ? 'bg-emerald-500/30 border-emerald-500/60 text-emerald-400 animate-pulse cursor-pointer hover:bg-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 cursor-pointer'
                : 'bg-neutral-900 border-white/5 text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Mic size={18} />
          </button>
        </div>
      </div>

      {/* Transcript Drawer overlay */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-2/3 bg-neutral-950/95 border-t border-white/10 rounded-t-3xl p-6 flex flex-col z-20"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h4 className="font-bold text-sm text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={14} /> Session Transcript
              </h4>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 select-text">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className={`font-bold mr-1.5 ${msg.sender === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {msg.sender === 'user' ? 'You:' : `${persona.name}:`}
                  </span>
                  <span className="text-neutral-300">{msg.text}</span>
                </div>
              ))}
              {(isThinking || isPersonaThinking) && (
                <div className="text-xs text-neutral-500 italic animate-pulse">
                  {persona.name} is thinking...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
