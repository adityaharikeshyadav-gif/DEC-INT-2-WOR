import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Sparkles, Share2, Eye, ArrowRight } from 'lucide-react';
import { Experience, CATEGORY_CONFIG } from './experiencesData';
import ExperienceStatusBadge from './ExperienceStatusBadge';
import ShareExperienceModal from './ShareExperienceModal';

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, index = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const navigate = useNavigate();

  const categoryInfo = CATEGORY_CONFIG[experience.category];
  const spotsLeft = experience.capacity - experience.filled;
  const fillPercent = Math.round((experience.filled / experience.capacity) * 100);

  const handleCardClick = () => {
    navigate(`/experiences/${experience.id}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareOpen(true);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Format date nicely: e.g., "Thursday, Jul 2"
  const formattedDate = new Date(experience.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleCardClick}
        className="relative rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-full"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: hovered ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: hovered ? '0 20px 40px rgba(249, 115, 22, 0.08)' : 'none',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        }}
      >
        {/* Card Image Area */}
        <div className="relative h-48 overflow-hidden shrink-0">
          <motion.img
            src={experience.heroImage}
            alt={experience.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(10,10,20,0.85) 0%, transparent 60%)' }}
          />

          {/* Top category & status badges */}
          {/* <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
              style={{
                backgroundColor: categoryInfo.bg,
                color: categoryInfo.color,
                borderColor: `${categoryInfo.color}33`,
              }}
            >
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.label}</span>
            </span>

            <ExperienceStatusBadge status={experience.status} />
          </div> */}

          {/* Share Shortcut */}
          <button
            onClick={handleShareClick}
            aria-label="Share experience"
            className="absolute top-3 right-3 lg:opacity-0 lg:group-hover:opacity-100 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-orange-500/50 hover:text-orange-400 transition-all z-10"
            style={{ display: hovered ? 'block' : 'none' }} // Ensure visibility on hover/mobile touch
          >
            <Share2 size={14} />
          </button>

          {/* Quick View slide-up */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-x-0 bottom-0 z-10"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handleQuickViewClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white transition-all"
                  style={{
                    background: 'rgba(15, 15, 25, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderTop: '1px solid rgba(249, 115, 22, 0.25)',
                  }}
                >
                  <Eye size={12} />
                  Quick View
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Date / Time */}
          <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-orange-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-orange-400" />
              {experience.time.split(' - ')[0]}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-base font-bold leading-snug mb-1 transition-colors line-clamp-1"
            style={{ color: hovered ? '#ffedd5' : '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {experience.title}
          </h3>

          <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-2">
            {experience.tagline}
          </p>

          {/* Location / Venue */}
          <div className="flex items-center gap-1 text-xs text-neutral-500 mb-4">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{experience.venue}, {experience.city}</span>
          </div>

          {/* Spacer to push social stack and footer to bottom */}
          <div className="flex-grow" />

          {/* People recommendation preview */}
          {experience.recommendedPeople && experience.recommendedPeople.length > 0 && (
            <div
              className="p-2 rounded-xl mb-4 flex items-center justify-between border"
              style={{
                background: 'rgba(249, 115, 22, 0.03)',
                borderColor: 'rgba(249, 115, 22, 0.08)',
              }}
            >
              <div className="flex -space-x-1.5 overflow-hidden">
                {experience.recommendedPeople.slice(0, 3).map((person) => (
                  <img
                    key={person.id}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-neutral-900 object-cover"
                    src={person.avatar}
                    alt={person.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-orange-300 font-medium">
                <Sparkles size={10} className="animate-pulse" />
                <span>{experience.recommendedPeople[0].compatibility}</span>
              </div>
            </div>
          )}

          {/* Capacity Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
              <span>Capacity</span>
              <span>{experience.filled}/{experience.capacity} spots</span>
            </div>
            <div className="h-1 w-full rounded-full bg-neutral-800">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #f97316, #ec4899)' }}
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Card Footer: Price & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <span className="text-base font-bold text-white">${experience.price}</span>
              <span className="text-[10px] text-neutral-500 ml-1">/ spot</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all border border-orange-500/20 hover:border-orange-500/50"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(236, 72, 153, 0.15))',
              }}
            >
              <span>Details</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </motion.article>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-md w-full rounded-2xl overflow-hidden z-10"
              style={{
                background: 'rgba(15, 15, 25, 0.95)',
                border: '1px solid rgba(249, 115, 22, 0.25)',
              }}
            >
              <div className="relative h-48">
                <img src={experience.heroImage} alt={experience.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-orange-500/25 text-orange-300 text-[10px] font-bold border border-orange-500/30">
                      {categoryInfo.label}
                    </span>
                    <ExperienceStatusBadge status={experience.status} />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{experience.title}</h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">{experience.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-orange-400" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-orange-400" />
                    <span>{experience.time}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin size={13} className="text-orange-400 shrink-0" />
                    <span className="truncate">{experience.venue}, {experience.city}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuickViewOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setQuickViewOpen(false);
                      handleCardClick();
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ec4899)',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareExperienceModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        experience={experience}
      />
    </>
  );
};

export default ExperienceCard;
