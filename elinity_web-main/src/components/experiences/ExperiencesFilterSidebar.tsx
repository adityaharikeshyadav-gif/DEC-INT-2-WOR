import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ExperienceCategory, CATEGORY_CONFIG } from './experiencesData';

export interface ExperienceFilterState {
  categories: ExperienceCategory[];
  cities: string[];
  maxPrice: number | null;
  dateOption: string | null; // 'today' | 'tomorrow' | 'weekend' | 'all'
  hideSoldOut: boolean;
}

interface ExperiencesFilterSidebarProps {
  filters: ExperienceFilterState;
  onChange: (filters: ExperienceFilterState) => void;
  activeCount: number;
}

const CITIES = ['San Francisco', 'Oakland', 'Berkeley'];

const DATES = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'weekend', label: 'This Weekend' },
];

const PRICES = [
  { label: 'Under $50', value: 50 },
  { label: 'Under $100', value: 100 },
  { label: 'Under $150', value: 150 },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-xs font-bold text-neutral-300 hover:text-white transition-colors uppercase tracking-wider"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={12} className="text-neutral-500" /> : <ChevronDown size={12} className="text-neutral-500" />}
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

export const ExperiencesFilterSidebar: React.FC<ExperiencesFilterSidebarProps> = ({
  filters,
  onChange,
  activeCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCategory = (cat: ExperienceCategory) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleCity = (city: string) => {
    const next = filters.cities.includes(city)
      ? filters.cities.filter((c) => c !== city)
      : [...filters.cities, city];
    onChange({ ...filters, cities: next });
  };

  const clearAll = () => {
    onChange({
      categories: [],
      cities: [],
      maxPrice: null,
      dateOption: null,
      hideSoldOut: false,
    });
  };

  const SidebarContent = () => (
    <div className="space-y-0 text-white">
      {/* Header */}
      <div
        className="flex items-center justify-between pb-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-orange-400" />
          <span className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Filters
          </span>
          {activeCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: 'rgba(249,115,22,0.25)',
                color: '#ffedd5',
                border: '1px solid rgba(249,115,22,0.2)',
              }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-orange-400 transition-colors"
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_CONFIG) as ExperienceCategory[]).map((cat) => {
            const active = filters.categories.includes(cat);
            const conf = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? `${conf.color}25` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? conf.color + '50' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? '#fff' : '#9ca3af',
                  transform: active ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <span>{conf.icon}</span>
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => {
            const active = filters.cities.includes(city);
            return (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#ffedd5' : '#9ca3af',
                }}
              >
                {city}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Date Option */}
      <FilterSection title="When">
        <div className="space-y-2">
          {DATES.map((d) => {
            const active = filters.dateOption === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onChange({ ...filters, dateOption: active ? null : d.id })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
                  color: active ? '#ffedd5' : '#9ca3af',
                }}
              >
                <span>{d.label}</span>
                {active && <span className="text-orange-400">✓</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="space-y-2">
          {PRICES.map((p) => {
            const active = filters.maxPrice === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onChange({ ...filters, maxPrice: active ? null : p.value })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
                  color: active ? '#ffedd5' : '#9ca3af',
                }}
              >
                <span>{p.label}</span>
                {active && <span className="text-orange-400">✓</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Availability Toggle */}
      <div className="py-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400">Hide Sold Out</span>
        <button
          onClick={() => onChange({ ...filters, hideSoldOut: !filters.hideSoldOut })}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          style={{
            backgroundColor: filters.hideSoldOut ? '#f97316' : '#2d2d3d',
          }}
        >
          <span
            className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            style={{
              transform: filters.hideSoldOut ? 'translateX(16px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block w-64 shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.01)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Trigger & Drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <SlidersHorizontal size={14} className="text-orange-400" />
          Filters
          {activeCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(249,115,22,0.25)', color: '#fff' }}
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
                style={{ background: 'rgba(3,0,20,0.75)', backdropFilter: 'blur(6px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
                style={{
                  background: 'rgba(18, 18, 28, 0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderBottom: 'none',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              >
                <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />
                <SidebarContent />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
                >
                  Apply Filters
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ExperiencesFilterSidebar;
