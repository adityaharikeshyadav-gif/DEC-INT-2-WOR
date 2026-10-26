import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import type { Trip } from '../../types/trip';
import TripCard from './TripCard';

interface TripsGridProps {
  trips: Trip[];
  loading?: boolean;
}

const SKELETON_COUNT = 6;

const CardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
    className="rounded-2xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', height: 380 }}
  >
    <div className="h-52 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-white/5 rounded-full w-1/3" />
      <div className="h-4 bg-white/5 rounded-full w-3/4" />
      <div className="h-3 bg-white/5 rounded-full w-full" />
      <div className="h-3 bg-white/5 rounded-full w-2/3" />
    </div>
  </motion.div>
);

const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex flex-col items-center justify-center py-20 text-center"
  >
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
      style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
    >
      <SearchX size={28} className="text-blue-400 opacity-60" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      No trips match your filters
    </h3>
    <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
      Try broadening your search, or ask Lumi to find something that fits your vibe exactly.
    </p>
  </motion.div>
);

const TripsGrid: React.FC<TripsGridProps> = ({ trips, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <CardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnimatePresence mode="popLayout">
        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          trips.map((trip, index) => (
            <TripCard key={trip.id} trip={trip} index={index} />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripsGrid;
