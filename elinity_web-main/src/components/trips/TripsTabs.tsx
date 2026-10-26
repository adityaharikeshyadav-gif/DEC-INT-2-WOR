import React from 'react';
import { motion } from 'framer-motion';

interface TripsTabsProps {
  activeTab: 'recommended' | 'all';
  onChange: (tab: 'recommended' | 'all') => void;
  recommendedCount: number;
  allCount: number;
}

const TripsTabs: React.FC<TripsTabsProps> = ({ activeTab, onChange, recommendedCount, allCount }) => {
  const tabs = [
    { id: 'recommended' as const, label: 'Recommended for You', count: recommendedCount, icon: '✦' },
    { id: 'all' as const, label: 'All Trips', count: allCount, icon: '🌍' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              color: isActive ? '#fff' : '#6b7280',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="tabs-active-bg"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(123,63,228,0.15))',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              <span className={isActive ? 'opacity-100' : 'opacity-50'}>{tab.icon}</span>
              {tab.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: isActive ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#93c5fd' : '#6b7280',
                  border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {tab.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TripsTabs;
