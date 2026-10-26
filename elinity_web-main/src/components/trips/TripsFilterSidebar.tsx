import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { TripVibe, TripRegion } from '../../types/trip';

export interface FilterState {
  vibes: TripVibe[];
  regions: TripRegion[];
  maxDuration: number | null;
  maxPrice: number | null;
  difficulty: string[];
}

interface TripsFilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  activeCount: number;
}

const VIBES: { id: TripVibe; label: string; icon: string }[] = [
  { id: 'adventure', label: 'Adventure', icon: '⛰️' },
  { id: 'wellness',  label: 'Wellness',  icon: '🌿' },
  { id: 'culture',   label: 'Culture',   icon: '🏛️' },
  { id: 'social',    label: 'Social',    icon: '✨' },
];

const REGIONS: { id: TripRegion; label: string; emoji: string }[] = [
  { id: 'asia',     label: 'Asia',     emoji: '🌏' },
  { id: 'europe',   label: 'Europe',   emoji: '🌍' },
  { id: 'americas', label: 'Americas', emoji: '🌎' },
  { id: 'africa',   label: 'Africa',   emoji: '🌍' },
  { id: 'oceania',  label: 'Oceania',  emoji: '🌊' },
];

const DURATIONS = [
  { label: 'Up to 7 days', value: 7 },
  { label: 'Up to 10 days', value: 10 },
  { label: 'Up to 14 days', value: 14 },
];

const PRICES = [
  { label: 'Under $2,000', value: 2000 },
  { label: 'Under $3,000', value: 3000 },
  { label: 'Under $4,000', value: 4000 },
];

const DIFFICULTIES = [
  { id: 'easy',        label: 'Easy' },
  { id: 'moderate',    label: 'Moderate' },
  { id: 'challenging', label: 'Challenging' },
];

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
        {open ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TripsFilterSidebar: React.FC<TripsFilterSidebarProps> = ({ filters, onChange, activeCount }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleVibe = (vibe: TripVibe) => {
    const next = filters.vibes.includes(vibe)
      ? filters.vibes.filter((v) => v !== vibe)
      : [...filters.vibes, vibe];
    onChange({ ...filters, vibes: next });
  };

  const toggleRegion = (region: TripRegion) => {
    const next = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onChange({ ...filters, regions: next });
  };

  const toggleDifficulty = (d: string) => {
    const next = filters.difficulty.includes(d)
      ? filters.difficulty.filter((x) => x !== d)
      : [...filters.difficulty, d];
    onChange({ ...filters, difficulty: next });
  };

  const clearAll = () => onChange({ vibes: [], regions: [], maxDuration: null, maxPrice: null, difficulty: [] });

  const SidebarContent = () => (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-blue-400" />
          <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Filters
          </span>
          {activeCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(59,130,246,0.25)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-400 transition-colors">
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Vibe */}
      <FilterSection title="Vibe">
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => {
            const active = filters.vibes.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVibe(v.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#93c5fd' : '#9ca3af',
                  transform: active ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {v.icon} {v.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Region */}
      <FilterSection title="Region">
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => {
            const active = filters.regions.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRegion(r.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#93c5fd' : '#9ca3af',
                  transition: 'all 0.2s ease',
                }}
              >
                {r.emoji} {r.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Duration">
        <div className="space-y-2">
          {DURATIONS.map((d) => {
            const active = filters.maxDuration === d.value;
            return (
              <button
                key={d.value}
                onClick={() => onChange({ ...filters, maxDuration: active ? null : d.value })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  color: active ? '#93c5fd' : '#9ca3af',
                }}
              >
                <span>{d.label}</span>
                {active && <span className="text-blue-400">✓</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Budget">
        <div className="space-y-2">
          {PRICES.map((p) => {
            const active = filters.maxPrice === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onChange({ ...filters, maxPrice: active ? null : p.value })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  color: active ? '#93c5fd' : '#9ca3af',
                }}
              >
                <span>{p.label}</span>
                {active && <span className="text-blue-400">✓</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Difficulty */}
      <FilterSection title="Difficulty" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => {
            const active = filters.difficulty.includes(d.id);
            const colors: Record<string, string> = { easy: '#22c55e', moderate: '#f59e0b', challenging: '#ef4444' };
            return (
              <button
                key={d.id}
                onClick={() => toggleDifficulty(d.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? `${colors[d.id]}15` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? colors[d.id] + '40' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? colors[d.id] : '#9ca3af',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-64 shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: filter button + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <SlidersHorizontal size={14} className="text-blue-400" />
          Filters
          {activeCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(59,130,246,0.25)', color: '#93c5fd' }}
            >
              {activeCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(3,0,20,0.7)', backdropFilter: 'blur(8px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
                style={{ background: '#0a0a28', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              >
                <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />
                <SidebarContent />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)' }}
                >
                  Show results
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default TripsFilterSidebar;
