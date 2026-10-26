import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, User } from 'lucide-react';
import type { Journey } from '../../types/conversation';

interface JourneyCardProps {
  journey: Journey;
  personaName: string;
  onSelect: (journey: Journey) => void;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey, personaName, onSelect }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onSelect(journey)}
      className="flex flex-col flex-shrink-0 w-80 md:w-96 rounded-2xl border border-white/10 bg-gradient-to-r from-neutral-900/80 to-neutral-900/40 backdrop-blur-xl p-5 cursor-pointer shadow-lg hover:border-blue-500/30 transition-all duration-300 group"
      style={{
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Compass size={10} /> {journey.theme}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
          <User size={10} className="text-neutral-500" /> {personaName}
        </span>
      </div>

      <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {journey.title}
      </h3>

      <p className="text-xs text-neutral-400 leading-relaxed mb-4 flex-grow line-clamp-2">
        {journey.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <span className="text-[10px] text-neutral-500 font-medium">Recommended Session</span>
        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Begin Journey <ArrowRight size={13} />
        </span>
      </div>
    </motion.div>
  );
};
