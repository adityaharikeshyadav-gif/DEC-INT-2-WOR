import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MessageSquare, Mic, Sparkles, BookOpen, Star, ShieldAlert } from 'lucide-react';
import { fetchPersonaById, startConversationSession } from '../lib/conversationsApi';
import type { Persona } from '../types/conversation';

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [startLoading, setStartLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadPersona() {
      try {
        const data = await fetchPersonaById(id!);
        setPersona(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPersona();
  }, [id]);

  const handleBeginSession = async () => {
    if (!persona || startLoading) return;
    setStartLoading(true);
    try {
      const res = await startConversationSession(persona.id, undefined, mode);
      navigate(`/conversations/chat/${res.session_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Reviewing biographical files...</p>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] text-white p-6">
        <div className="text-center max-w-sm">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thinker Not Found</h2>
          <p className="text-neutral-400 text-sm mb-6">We couldn't locate this historical profile in the catalog.</p>
          <button
            onClick={() => navigate('/conversations')}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] to-[#040408] text-white pt-28 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/conversations')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-8 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"
        >
          <ChevronLeft size={14} /> Back to Library
        </button>

        {/* 2-Column layout on web, single-column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Portrait & Biography */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 aspect-[4/3] w-full shadow-2xl">
              <img
                src={persona.portrait}
                alt={persona.name}
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/20 to-transparent" />
            </div>

            {/* Title & Dates */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {persona.category}
                </span>
                <span className="text-xs text-neutral-500 font-semibold">{persona.dates}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {persona.name}
              </h1>
            </div>

            {/* Custom Biography */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl relative">
              <span className="absolute -top-3 left-4 text-xs font-bold text-neutral-500 bg-[#0a0a12] px-2">Biography</span>
              <p className="text-neutral-300 leading-relaxed text-sm md:text-base">
                {persona.bio}
              </p>
            </div>
          </div>

          {/* Right Column: Toggle Mode, CTA, Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-2xl shadow-xl space-y-6">
              
              {/* Cover topics header */}
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <BookOpen size={12} /> Topics covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {persona.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 text-neutral-200 border border-white/5"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                  Choose Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('text')}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer ${
                      mode === 'text'
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                        : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <MessageSquare size={18} />
                    <span className="text-xs font-bold">Text Chat</span>
                  </button>

                  <button
                    onClick={() => setMode('voice')}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer ${
                      mode === 'voice'
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                        : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <Mic size={18} />
                    <span className="text-xs font-bold">Voice Call</span>
                  </button>
                </div>
              </div>

              {/* Expectations / Note */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-400 leading-relaxed">
                <span className="font-bold text-neutral-200 block mb-1">Session expectations</span>
                The dialogue is conversational, adaptive, and structured in a 3-part arc: opening perspective, interactive dialogue, and a summary reflection card to save your key takeaways.
              </div>

              {/* Full Width Primary CTA */}
              <button
                onClick={handleBeginSession}
                disabled={startLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 hover:shadow-blue-500/15 hover:scale-101 active:scale-98 transition-all cursor-pointer"
              >
                {startLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} /> Begin Session
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
