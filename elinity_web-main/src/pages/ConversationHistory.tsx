import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { List, Grid, Calendar, Clock, ArrowRight, BookOpen, Quote, HelpCircle, ChevronLeft } from 'lucide-react';
import { fetchConversationHistory, fetchSavedInsights } from '../lib/conversationsApi';
import type { ConversationSession, SavedInsight } from '../types/conversation';

export default function ConversationHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ConversationSession[]>([]);
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'grid'>('grid');
  const [activeTab, setActiveTab] = useState<'history' | 'insights'>('insights');

  useEffect(() => {
    async function loadData() {
      try {
        const [historyData, insightsData] = await Promise.all([
          fetchConversationHistory(),
          fetchSavedInsights(),
        ]);
        setHistory(historyData);
        setInsights(insightsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleResumeSession = (sessionId: string) => {
    navigate(`/conversations/chat/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Opening Your Life Book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white pt-28 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/conversations')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-8 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"
        >
          <ChevronLeft size={14} /> Back to Library
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Your Session History & Insights
            </h1>
            <p className="text-xs md:text-sm text-neutral-400">
              Revisit your dialogues and review insights saved to your personal library.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Saved Insights ({insights.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Dialogues ({history.length})
            </button>
          </div>
        </div>

        {/* View Layout Toggles (Grid / List) */}
        {activeTab === 'insights' && insights.length > 0 && (
          <div className="flex justify-end items-center mb-6">
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewType === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewType === 'list' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Render Saved Insights */}
        {activeTab === 'insights' && (
          <>
            {insights.length === 0 ? (
              <div className="text-center py-20 border border-white/5 bg-white/5 rounded-2xl">
                <HelpCircle size={32} className="text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-400 mb-1">No Insights Saved Yet</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Complete a dialogue with any thinker and click "Save Insight" to capture reflections.
                </p>
              </div>
            ) : viewType === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative flex flex-col p-6 rounded-2xl border border-white/5 bg-neutral-900/40 backdrop-blur-xl shadow-lg"
                  >
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-950 shrink-0">
                        <img src={insight.persona_portrait} alt={insight.persona_name} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200">{insight.persona_name}</h4>
                        <span className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider block">
                          {insight.journey_title || 'General reflection'}
                        </span>
                      </div>
                      <span className="text-[9px] text-neutral-500 ml-auto font-bold flex items-center gap-1">
                        <Calendar size={10} /> {insight.created_at}
                      </span>
                    </div>

                    <div className="flex-grow flex flex-col justify-between mb-4">
                      {/* Pull quote insight style */}
                      <div className="relative p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 mb-3">
                        <Quote size={12} className="text-blue-500/30 absolute top-2 left-2" />
                        <p className="text-xs font-medium text-blue-300 italic pl-3 select-text">
                          {insight.insight}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-400 leading-relaxed italic line-clamp-3 select-text">
                        "{insight.summary}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleResumeSession(insight.session_id)}
                      className="text-[11px] font-bold text-neutral-500 hover:text-white flex items-center gap-1 mt-auto pt-2 border-t border-white/5 cursor-pointer w-full text-left"
                    >
                      Revisit Conversation <ArrowRight size={11} />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-white/5 bg-neutral-900/30 backdrop-blur-xl hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-950 shrink-0">
                        <img src={insight.persona_portrait} alt={insight.persona_name} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{insight.persona_name}</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 select-text italic">
                          "{insight.insight}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-11 md:ml-0">
                      <span className="text-[10px] text-neutral-500 font-semibold shrink-0">
                        {insight.journey_title || 'General Reflection'}
                      </span>
                      <button
                        onClick={() => handleResumeSession(insight.session_id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      >
                        Revisit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Render Dialogues History */}
        {activeTab === 'history' && (
          <>
            {history.length === 0 ? (
              <div className="text-center py-20 border border-white/5 bg-white/5 rounded-2xl">
                <HelpCircle size={32} className="text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-400 mb-1">No Active Dialogues</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  You haven't initiated a conversation with a thinker yet. Let's return to the library.
                </p>
                <button
                  onClick={() => navigate('/conversations')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 mt-4"
                >
                  Browse Thinkers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((session) => (
                  <div
                    key={session.session_id}
                    className="p-5 rounded-2xl border border-white/5 bg-neutral-900/30 backdrop-blur-xl flex justify-between items-start gap-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shrink-0 shadow-md">
                        <img src={session.persona_portrait} alt={session.persona_name} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{session.persona_name}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-500 font-semibold mt-1">
                          <span className="flex items-center gap-0.5"><Clock size={10} /> {session.mode === 'voice' ? 'Voice Call' : 'Text Chat'}</span>
                          <span>·</span>
                          <span>{session.message_count || 0} rounds</span>
                        </div>
                        {session.journey_title && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase bg-white/5 border border-white/5 text-neutral-400 rounded">
                            {session.journey_title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full gap-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        session.concluded
                          ? 'bg-neutral-800 text-neutral-500'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {session.concluded ? 'Concluded' : 'Active'}
                      </span>

                      <button
                        onClick={() => handleResumeSession(session.session_id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer transition-colors shadow-lg shadow-blue-500/5 flex items-center gap-1"
                      >
                        {session.concluded ? 'Revisit' : 'Resume'} <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
