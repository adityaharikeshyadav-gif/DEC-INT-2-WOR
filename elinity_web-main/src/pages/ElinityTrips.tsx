import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

import TripsHero from '../components/trips/TripsHero';
import TripsTabs from '../components/trips/TripsTabs';
import TripsGrid from '../components/trips/TripsGrid';
import TripsFilterSidebar, { FilterState } from '../components/trips/TripsFilterSidebar';

import { fetchTrips } from '../lib/tripsApi';
import type { Trip } from '../types/trip';

const DEFAULT_FILTERS: FilterState = {
  vibes: [],
  regions: [],
  maxDuration: null,
  maxPrice: null,
  difficulty: [],
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const ElinityTrips: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  // ── API state ──────────────────────────────────────────────────────────────
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTrips()
      .then(setAllTrips)
      .catch(() => setError('Could not load trips. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived counts for tabs ────────────────────────────────────────────────
  const recommendedTrips = useMemo(() => allTrips.filter((t) => t.isRecommended), [allTrips]);
  const baseTrips = activeTab === 'recommended' ? recommendedTrips : allTrips;

  // ── Apply filters ──────────────────────────────────────────────────────────
  const filteredTrips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return baseTrips.filter((trip) => {
      if (q && !trip.title.toLowerCase().includes(q) && !trip.destination.toLowerCase().includes(q)) return false;
      if (filters.vibes.length > 0 && !filters.vibes.includes(trip.vibe)) return false;
      if (filters.regions.length > 0 && !filters.regions.includes(trip.region)) return false;
      if (filters.maxDuration !== null && trip.duration > filters.maxDuration) return false;
      if (filters.maxPrice !== null && trip.price > filters.maxPrice) return false;
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(trip.difficulty)) return false;
      return true;
    });
  }, [baseTrips, filters, searchQuery]);

  const activeFilterCount = [
    filters.vibes.length,
    filters.regions.length,
    filters.maxDuration ? 1 : 0,
    filters.maxPrice ? 1 : 0,
    filters.difficulty.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{ background: 'linear-gradient(to bottom, #030014, #0a0a2e)' }}
    >
      <main
        className="flex-1 max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-16 w-full"
      >
        {/* Hero */}
        <motion.section variants={fadeUp} className="mb-10">
          <TripsHero searchValue={searchQuery} onSearchChange={setSearchQuery} />
        </motion.section>

        {/* Error state */}
        {error && (
          <motion.div
            variants={fadeUp}
            className="mb-6 p-4 rounded-xl text-sm text-red-400 text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </motion.div>
        )}

        {/* Tabs + filter toggle row */}
        <motion.section variants={fadeUp} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TripsTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              recommendedCount={recommendedTrips.length}
              allCount={allTrips.length}
            />
            {/* Mobile filter button */}
            <div className="lg:hidden">
              <TripsFilterSidebar
                filters={filters}
                onChange={setFilters}
                activeCount={activeFilterCount}
              />
            </div>
          </div>
        </motion.section>

        {/* Main layout: sidebar + content */}
        <section>
          <div className="flex gap-6 items-start">
            {/* Sidebar — desktop only */}
            <div className="hidden lg:block sticky top-28 self-start">
              <TripsFilterSidebar
                filters={filters}
                onChange={setFilters}
                activeCount={activeFilterCount}
              />
            </div>

            {/* Right: grid */}
            <div className="flex-1 min-w-0">
              <TripsGrid trips={filteredTrips} loading={loading} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ElinityTrips;