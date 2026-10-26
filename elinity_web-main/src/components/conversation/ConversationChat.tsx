import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import type { Message, ReflectionData } from '../../types/conversation';
import { ReflectionCard } from './ReflectionCard';

interface ConversationChatProps {
  personaName: string;
  personaPortrait: string;
  journeyTitle?: string;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  streamingText: string;
  concluded: boolean;
  reflection: ReflectionData | null;
  onSend: () => void;
  onSaveInsight: (summary: string, insight: string) => Promise<void>;
  onEndSession: () => void;
  onStartVoice: () => void;
  onBack: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const ConversationChat: React.FC<ConversationChatProps> = ({
  personaName,
  personaPortrait,
  journeyTitle,
  messages,
  input,
  setInput,
  isTyping,
  streamingText,
  concluded,
  reflection,
  onSend,
  onSaveInsight,
  onEndSession,
  onStartVoice,
  onBack,
  chatEndRef,
  inputRef,
}) => {
  // Convert markdown formatting to html
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#07070d] text-white flex flex-col font-sans">
      <style>{`
        .chat-history-container::-webkit-scrollbar {
          width: 5px;
        }
        .chat-history-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-history-container::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.25);
          border-radius: 9999px;
        }
        .chat-history-container::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.45);
        }
      `}</style>

      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 filter blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl px-6 py-4 shadow-lg shadow-black/25">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-neutral-950">
              <img src={personaPortrait} alt={personaName} className="w-full h-full object-cover grayscale" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {personaName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" />
                <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider">
                  Active Conversation
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {journeyTitle && (
              <span className="hidden md:inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-400">
                {journeyTitle}
              </span>
            )}
            <button
              onClick={onStartVoice}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Start Voice Call
            </button>
          </div>
        </div>
      </header>

      {/* Message History area */}
      <div className="flex-grow overflow-y-auto z-10 px-6 py-8 select-text chat-history-container">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'persona' && (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-neutral-950 shadow-md">
                  <img src={personaPortrait} alt={personaName} className="w-full h-full object-cover grayscale" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/10 border border-white/10'
                    : 'bg-[#141424] border border-white/10 text-neutral-100 rounded-tl-sm shadow-md shadow-black/30'
                }`}
              >
                {msg.isStreaming ? (
                  <span>
                    <span dangerouslySetInnerHTML={{ __html: formatText(streamingText) }} />
                    <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 animate-pulse" />
                  </span>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                )}
              </div>
            </div>
          ))}

          {/* Thinking loading dots */}
          {isTyping && (
            <div className="flex items-start gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-neutral-950 shadow-md">
                <img src={personaPortrait} alt={personaName} className="w-full h-full object-cover grayscale" />
              </div>
              <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-[#141424] border border-white/10 shadow-md flex items-center gap-1 h-10">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Concluded Reflection UI */}
          {concluded && reflection && (
            <ReflectionCard
              reflection={reflection}
              personaName={personaName}
              onSave={onSaveInsight}
              onEnd={onEndSession}
            />
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Text Chat Input footer */}
      {!concluded && (
        <footer className="relative z-10 flex-shrink-0 border-t border-white/10 bg-neutral-950/95 backdrop-blur-xl px-6 py-4 shadow-2xl">
          <div className="max-w-2xl mx-auto relative flex items-center bg-[#0d0d18] border border-white/10 rounded-2xl px-4 py-1.5 focus-within:border-indigo-500/50 shadow-inner shadow-black/40 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
              placeholder={`Share your thoughts with ${personaName}...`}
              disabled={isTyping}
              className="bg-transparent border-none outline-none text-sm md:text-base text-neutral-100 w-full py-2.5 placeholder-neutral-600 disabled:opacity-50"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isTyping}
              className={`p-2.5 rounded-xl shrink-0 transition-all ${
                input.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Send size={15} />
            </button>
          </div>
          <div className="text-center text-[10px] text-neutral-600 mt-2.5">
            Elinity Historical Persona Dialogues · All exchanges are guided reflections.
          </div>
        </footer>
      )}
    </div>
  );
};
