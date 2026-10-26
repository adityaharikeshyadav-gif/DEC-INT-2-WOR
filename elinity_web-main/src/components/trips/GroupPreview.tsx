import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users } from 'lucide-react';
import type { Trip } from '../../types/trip';

interface GroupPreviewProps {
  trip: Trip;
}

// Deterministic color palette for avatars
const AVATAR_COLORS = [
  '#3b82f6', '#7B3FE4', '#06b6d4', '#22c55e', '#f59e0b',
  '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#ec4899',
];

const AVATAR_INITIALS = [
  'AS', 'MK', 'JL', 'PR', 'TW', 'NV', 'CD', 'BH', 'LE', 'RM',
  'SK', 'OA', 'FC', 'DG', 'YI', 'HP',
];

const GroupPreview: React.FC<GroupPreviewProps> = ({ trip }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const { current, max } = trip.groupSize;
  const spotsLeft = max - current;
  const fillPercent = Math.round((current / max) * 100);

  return (
    <div ref={ref} className="space-y-5">
      {/* Avatar stack */}
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {Array.from({ length: Math.min(current, 8) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6, x: -10 }}
              animate={isInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.6, x: -10 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}cc, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}88)`,
                border: '2px solid rgba(10,10,40,0.9)',
                marginLeft: i > 0 ? '-10px' : '0',
                zIndex: 10 - i,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {AVATAR_INITIALS[i]}
            </motion.div>
          ))}
          {current > 8 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold text-neutral-300 shrink-0"
              style={{
                background: 'rgba(59,130,246,0.15)',
                border: '2px solid rgba(59,130,246,0.3)',
                marginLeft: '-10px',
                zIndex: 0,
              }}
            >
              +{current - 8}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <div className="flex items-center gap-1.5 text-sm text-neutral-200 font-semibold">
            <Users size={14} className="text-blue-400" />
            {current} travellers joined
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} remaining` : 'Group is full'}
          </p>
        </motion.div>
      </div>

      {/* Fill bar */}
      <div>
        <div className="flex justify-between text-xs text-neutral-500 mb-2">
          <span>{current} of {max} spots filled</span>
          <span style={{ color: fillPercent >= 80 ? '#f87171' : '#60a5fa' }}>{fillPercent}%</span>
        </div>
        <div
          className="h-2 w-full rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: fillPercent >= 80
                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                : 'linear-gradient(90deg, #3b82f6, #7B3FE4)',
            }}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${fillPercent}%` } : { width: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Tribe vibe */}
      <div
        className="p-4 rounded-xl"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
      >
        <p className="text-xs text-neutral-400 leading-relaxed">
          <span className="text-blue-400 font-semibold">This group's vibe: </span>
          Open, intentional, and genuinely curious. Ages 24–38, from 9 different countries. 
          People who show up fully.
        </p>
      </div>

      {/* Urgency alert if almost full */}
      {spotsLeft <= 3 && spotsLeft > 0 && (
        <motion.div
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          🔥 Only {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left — this trip usually fills up fast.
        </motion.div>
      )}
    </div>
  );
};

export default GroupPreview;
