import React from 'react';
import { motion } from 'framer-motion';
import { Experience } from './experiencesData';
import ExperienceCard from './ExperienceCard';

interface ExperiencesGridProps {
  experiences: Experience[];
  loading?: boolean;
}

const SKELETON_COUNT = 6;

const CardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
    className="rounded-3xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', height: 420 }}
  >
    <div className="h-52 bg-white/5" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-white/5 rounded-full w-1/4" />
      <div className="h-5 bg-white/5 rounded-full w-3/4" />
      <div className="h-3 bg-white/5 rounded-full w-full" />
      <div className="h-3 bg-white/5 rounded-full w-2/3" />
    </div>
  </motion.div>
);

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const ExperiencesGrid: React.FC<ExperiencesGridProps> = ({ experiences, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <CardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-3xl mb-3">🔍</span>
        <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          No experiences found
        </h3>
        <p className="text-xs text-neutral-400 max-w-xs">
          Try adjusting your filters or search query to find upcoming activities in your city.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {experiences.map((experience, index) => (
        <ExperienceCard key={experience.id} experience={experience} index={index} />
      ))}
    </motion.div>
  );
};

export default ExperiencesGrid;
