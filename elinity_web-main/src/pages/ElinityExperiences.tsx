import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

import ExperiencesHero from '../components/experiences/ExperiencesHero';
import ExperiencesTabs from '../components/experiences/ExperiencesTabs';
import ExperiencesGrid from '../components/experiences/ExperiencesGrid';
import ExperiencesFilterSidebar, { ExperienceFilterState } from '../components/experiences/ExperiencesFilterSidebar';

import { fetchExperiences } from '../lib/experiencesApi';
import type { Experience } from '../components/experiences/experiencesData';

const DEFAULT_FILTERS: ExperienceFilterState = {
  categories: [],
  cities: [],
  maxPrice: null,
  dateOption: null,
  hideSoldOut: false,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const ElinityExperiences: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  const [filters, setFilters] = useState<ExperienceFilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  // API State
  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchExperiences()
      .then(setAllExperiences)
      .catch(() => setError('Could not load experiences. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  // Derived counts for tabs
  const recommendedExperiences = useMemo(() => allExperiences.filter((e) => e.isRecommended), [allExperiences]);

  // Apply filters to the currently active tab's experiences
  const baseExperiences = activeTab === 'recommended' ? recommendedExperiences : allExperiences;


  const filteredExperiences = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return baseExperiences.filter((exp) => {
      // Text search
      if (q && !exp.title.toLowerCase().includes(q) && !exp.venue.toLowerCase().includes(q) && !exp.tagline.toLowerCase().includes(q)) {
        return false;
      }
      // Sidebar filters
      if (filters.categories.length > 0 && !filters.categories.includes(exp.category)) return false;
      if (filters.cities.length > 0 && !filters.cities.includes(exp.city)) return false;
      if (filters.maxPrice !== null && exp.price > filters.maxPrice) return false;
      if (filters.hideSoldOut && exp.status === 'sold-out') return false;

      // Date filtering
      if (filters.dateOption) {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        if (filters.dateOption === 'today' && exp.date !== todayStr) return false;
        if (filters.dateOption === 'tomorrow' && exp.date !== tomorrowStr) return false;
        if (filters.dateOption === 'weekend') {
          // Check if Friday, Saturday or Sunday
          const dateObj = new Date(exp.date + 'T00:00:00');
          const day = dateObj.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
          if (day !== 0 && day !== 5 && day !== 6) return false;
        }
      }

      return true;
    });
  }, [baseExperiences, filters, searchQuery]);

  // Reset visible count when search, tab, or filters change
  React.useEffect(() => {
    setVisibleCount(6);
  }, [filters, searchQuery, activeTab]);

  const visibleExperiences = useMemo(() => {
    return filteredExperiences.slice(0, visibleCount);
  }, [filteredExperiences, visibleCount]);

  const activeFilterCount = [
    filters.categories.length,
    filters.cities.length,
    filters.maxPrice ? 1 : 0,
    filters.dateOption ? 1 : 0,
    filters.hideSoldOut ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{ background: 'linear-gradient(to bottom, #030014, #0a0a2e)' }}
    >
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-16 w-full">
        {/* Hero */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <ExperiencesHero searchValue={searchQuery} onSearchChange={setSearchQuery} />
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
        <motion.section initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <ExperiencesTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              recommendedCount={recommendedExperiences.length}
              allCount={allExperiences.length}
            />
            {/* Mobile filter button */}
            <div className="lg:hidden">
              <ExperiencesFilterSidebar
                filters={filters}
                onChange={setFilters}
                activeCount={activeFilterCount}
              />
            </div>
          </div>
        </motion.section>

        {/* Main layout: sidebar + grid */}
        <section>
          <div className="flex gap-6 items-start">
            {/* Sidebar — desktop only, sticky */}
            <div className="hidden lg:block sticky top-28 self-start">
              <ExperiencesFilterSidebar
                filters={filters}
                onChange={setFilters}
                activeCount={activeFilterCount}
              />
            </div>

            {/* Right: grid */}
            <div className="flex-1 min-w-0 flex flex-col">
              <ExperiencesGrid experiences={visibleExperiences} loading={loading} />
              
              {!loading && filteredExperiences.length > visibleCount && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all border border-orange-500/20 hover:border-orange-500/50 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(236, 72, 153, 0.15))',
                    }}
                  >
                    View More
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ElinityExperiences;
