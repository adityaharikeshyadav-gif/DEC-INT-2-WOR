import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, LogOut, Check, Sparkles } from 'lucide-react';
import type { ReflectionData } from '../../types/conversation';

interface ReflectionCardProps {
  reflection: ReflectionData;
  personaName: string;
  onSave: (summary: string, insight: string) => Promise<void>;
  onEnd: () => void;
}

export const ReflectionCard: React.FC<ReflectionCardProps> = ({
  reflection,
  personaName,
  onSave,
  onEnd,
}) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await onSave(reflection.summary, reflection.insight);
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto my-8 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-indigo-950/80 to-neutral-900/90 backdrop-blur-xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden"
      style={{
        boxShadow: '0 20px 50px -15px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Session Reflection
          </h2>
          <p className="text-xs text-neutral-400">with {personaName}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">Summary Takeaway</h4>
        <p className="text-sm md:text-base text-neutral-200 leading-relaxed italic">
          "{reflection.summary}"
        </p>
      </div>

      {/* Key Insight (Pull Quote) */}
      <div className="mb-8 p-5 rounded-xl border border-white/5 bg-white/5 relative">
        <span className="absolute top-2 left-3 text-3xl text-blue-500/20 font-serif leading-none">“</span>
        <div className="pl-4">
          <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">Core Insight</h4>
          <p className="text-base md:text-lg font-medium text-blue-300 font-display italic">
            {reflection.insight}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            saved
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 cursor-pointer'
          }`}
        >
          {saved ? (
            <>
              <Check size={16} /> Insight Saved
            </>
          ) : saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} /> Save Insight
            </>
          )}
        </button>

        <button
          onClick={onEnd}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 active:scale-98 transition-all duration-300 cursor-pointer sm:ml-auto"
        >
          <LogOut size={16} /> End Session
        </button>
      </div>
    </motion.div>
  );
};
