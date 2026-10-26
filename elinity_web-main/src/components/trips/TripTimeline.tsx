import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Utensils, BedDouble, Check } from 'lucide-react';
import type { ItineraryDay } from '../../types/trip';

interface TripTimelineProps {
  itinerary: ItineraryDay[];
}

const MealBadge: React.FC<{ meal: string }> = ({ meal }) => {
  const config = {
    breakfast: { label: 'Breakfast', color: '#f59e0b' },
    lunch:     { label: 'Lunch',     color: '#22c55e' },
    dinner:    { label: 'Dinner',    color: '#a855f7' },
  };
  const c = config[meal as keyof typeof config];
  if (!c) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}
    >
      <Utensils size={9} />
      {c.label}
    </span>
  );
};

const DayNode: React.FC<{ day: ItineraryDay; index: number; isLast: boolean }> = ({ day, index, isLast }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="flex gap-5">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        {/* Circle node */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center w-9 h-9 rounded-full z-10 shrink-0 text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)',
            boxShadow: '0 0 20px rgba(59,130,246,0.35)',
          }}
        >
          {day.day}
        </motion.div>
        {/* Connector line */}
        {!isLast && (
          <motion.div
            className="w-px flex-1 mt-2"
            style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.4), rgba(59,130,246,0.05))' }}
            initial={{ scaleY: 0, originY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
          />
        )}
      </div>

      {/* Day content */}
      <motion.div
        className="pb-8 flex-1"
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Day header */}
        <div className="mb-3">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-0.5">
            Day {day.day} · {day.location}
          </div>
          <h4
            className="text-base font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {day.title}
          </h4>
        </div>

        {/* Activities */}
        <div
          className="rounded-xl overflow-hidden mb-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {day.activities.map((activity, ai) => (
            <div
              key={ai}
              className="flex gap-3 p-3 transition-colors hover:bg-white/[0.02]"
              style={{ borderTop: ai > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div
                className="text-xs font-mono text-blue-400 shrink-0 mt-0.5 w-10"
              >
                {activity.time}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Check size={11} className="text-blue-400 shrink-0" />
                  <span className="text-sm font-medium text-neutral-200">{activity.title}</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Accommodation + meals */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-300"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <BedDouble size={11} className="text-blue-400" />
            {day.accommodation}
          </span>
          {day.meals.map((meal) => (
            <MealBadge key={meal} meal={meal} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const TripTimeline: React.FC<TripTimelineProps> = ({ itinerary }) => {
  return (
    <div>
      <div className="space-y-0">
        {itinerary.map((day, index) => (
          <DayNode
            key={day.day}
            day={day}
            index={index}
            isLast={index === itinerary.length - 1}
          />
        ))}
      </div>

      {/* "More days" stub if itinerary is partial */}
      {itinerary.length < 6 && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mt-2 text-sm text-neutral-500"
          style={{ background: 'rgba(59,130,246,0.04)', border: '1px dashed rgba(59,130,246,0.15)' }}
        >
          <span className="text-blue-500">+</span>
          More days included — full itinerary shared after booking.
        </div>
      )}
    </div>
  );
};

export default TripTimeline;
