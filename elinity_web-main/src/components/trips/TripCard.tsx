import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Zap, Eye } from 'lucide-react';
import type { Trip } from '../../types/trip';
// import { VIBE_CONFIG } from './tripsData';


interface TripCardProps {
  trip: Trip;
  index?: number;
}

const TripCard: React.FC<TripCardProps> = ({ trip, index = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const navigate = useNavigate();

  // const vibe = VIBE_CONFIG[trip.vibe];
  const spotsLeft = trip.groupSize.max - trip.groupSize.current;
  const fillPercent = Math.round((trip.groupSize.current / trip.groupSize.max) * 100);
  const isAlmostFull = spotsLeft <= 3;

  const handleCardClick = () => navigate(`/trips/${trip.id}`);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleCardClick}
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: hovered ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
          // boxShadow: hovered ? '0 24px 60px rgba(59,130,246,0.15), 0 0 0 1px rgba(59,130,246,0.1)' : '0 4px 24px rgba(0,0,0,0.3)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        }}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <motion.img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(3,0,20,0.8) 0%, transparent 60%)' }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {/* Vibe badge */}
            {/* <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
              style={{ background: vibe.bg, color: vibe.color, border: `1px solid ${vibe.color}33` }}
            >
              <span>{vibe.icon}</span>
              {vibe.label}
            </span> */}

            {/* Recommended badge */}
            {trip.isRecommended && (
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
                style={{ background: 'rgba(59,130,246,0.25)', color: '#fff', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                <Zap size={10} />
                Lumi Pick
              </span>
            )}
          </div>

          {/* Spots left badge */}
          {isAlmostFull && (
            <div className="absolute bottom-3 left-3">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
                style={{ background: 'rgba(239,68,68,0.25)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                🔥 {spotsLeft} spots left
              </span>
            </div>
          )}

          {/* Quick View button — slides up on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-x-0 bottom-0"
                initial={{ y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 48, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-all"
                  style={{ background: 'rgba(3,0,20,0.75)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(59,130,246,0.2)' }}
                >
                  <Eye size={14} />
                  Quick View
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card body */}
        <div className="p-4">
          {/* Destination */}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={12} className="text-blue-400 shrink-0" />
            <span className="text-xs text-neutral-400 font-medium">{trip.destination}</span>
          </div>

          {/* Title */}
          <h3
            className="text-base font-semibold leading-snug mb-1 transition-colors"
            style={{ color: hovered ? '#93c5fd' : '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {trip.title}
          </h3>

          <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-2">
            {trip.tagline}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {trip.duration}d
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {trip.groupSize.current}/{trip.groupSize.max}
            </span>
            <span className="flex items-center gap-1">
              <Star size={11} className="text-yellow-400" fill="#facc15" />
              {trip.rating} ({trip.reviewCount})
            </span>
          </div>

          {/* Group fill bar */}
          <div className="mb-4">
            <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #3b82f6, #7B3FE4)' }}
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 1, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ${trip.price.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 ml-1">/ person</span>
            </div>
            <motion.button
              onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)',
                // boxShadow: hovered ? '0 4px 20px rgba(59,130,246,0.4)' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
              whileHover={{ scale: 1.02 }}
            >
              View Trip
            </motion.button>
          </div>
        </div>
      </motion.article>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewOpen(false)}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(3,0,20,0.85)', backdropFilter: 'blur(12px)' }}
            />

            <motion.div
              className="relative max-w-lg w-full rounded-3xl overflow-hidden"
              style={{ background: 'rgba(10,10,40,0.95)', border: '1px solid rgba(59,130,246,0.25)' }}
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={trip.image} alt={trip.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={13} className="text-blue-400" />
                  <span className="text-sm text-neutral-400">{trip.destination}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{trip.title}</h2>
                <p className="text-sm text-neutral-400 mb-4 leading-relaxed">{trip.summary}</p>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-5">
                  {trip.highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="text-blue-400 mt-0.5">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Lumi insight */}
                {trip.lumiInsight && (
                  <div
                    className="p-3 rounded-xl mb-5 text-xs text-blue-200 italic"
                    style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
                  >
                    <span className="not-italic text-blue-400 font-semibold">Lumi says: </span>
                    {trip.lumiInsight}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuickViewOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-neutral-400 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { setQuickViewOpen(false); navigate(`/trips/${trip.id}`); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)' }}
                  >
                    See Full Trip
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TripCard;
