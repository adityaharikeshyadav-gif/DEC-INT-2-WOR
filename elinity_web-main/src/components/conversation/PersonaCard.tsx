import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import type { Persona } from '../../types/conversation';

interface PersonaCardProps {
  persona: Persona;
  onSelect: (persona: Persona) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onSelect }) => {
  // Category-specific styles
  const categoryGradients: Record<string, string> = {
    Psychology: 'from-blue-500/20 to-indigo-500/20 hover:border-indigo-500/50',
    Philosophy: 'from-purple-500/20 to-pink-500/20 hover:border-purple-500/50',
    Stoicism: 'from-emerald-500/20 to-teal-500/20 hover:border-emerald-500/50',
    Pragmatism: 'from-amber-500/20 to-orange-500/20 hover:border-amber-500/50',
  };

  const badgeGradients: Record<string, string> = {
    Psychology: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/20',
    Philosophy: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/20',
    Stoicism: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20',
    Pragmatism: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20',
  };

  const currentGradient = categoryGradients[persona.category] || 'from-neutral-500/20 to-slate-500/20 hover:border-neutral-500/50';
  const currentBadge = badgeGradients[persona.category] || 'bg-neutral-500 text-white';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(persona)}
      className={`relative flex flex-col h-full rounded-2xl border border-white/10 bg-gradient-to-b ${currentGradient} bg-neutral-900/40 backdrop-blur-xl p-5 cursor-pointer shadow-xl transition-all duration-300 group`}
      style={{
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Portrait / Visual Frame */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-white/5 bg-neutral-950">
        <img
          src={persona.portrait}
          alt={persona.name}
          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-out transform group-hover:scale-105"
        />
        {/* Artistic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>

      {/* Category Badge */}
      <div className="flex justify-between items-center mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${currentBadge}`}>
          {persona.category}
        </span>
        <span className="text-[10px] text-neutral-500 font-semibold">{persona.dates}</span>
      </div>

      {/* Persona Info */}
      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-2 font-display tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {persona.name}
      </h3>
      
      <p className="text-xs text-neutral-400 leading-relaxed mb-4 flex-grow line-clamp-3">
        {persona.bio}
      </p>

      {/* Footer Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {persona.topics.slice(0, 3).map((topic, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-[9px] font-medium rounded bg-white/5 text-neutral-400 border border-white/5"
          >
            #{topic}
          </span>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <span className="text-[11px] font-semibold text-neutral-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
          <BookOpen size={12} /> View Profile
        </span>
        <span className="text-[11px] font-bold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
          Talk <Sparkles size={11} className="ml-1" />
        </span>
      </div>
    </motion.div>
  );
};
