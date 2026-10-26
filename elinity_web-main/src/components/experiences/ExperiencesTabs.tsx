import React from 'react';
import { motion } from 'framer-motion';

interface ExperiencesTabsProps {
  activeTab: 'recommended' | 'all';
  onChange: (tab: 'recommended' | 'all') => void;
  recommendedCount: number;
  allCount: number;
}

export const ExperiencesExperiencesTabs: React.FC<ExperiencesTabsProps> = ({
  activeTab,
  onChange,
  recommendedCount,
  allCount,
}) => {
  const tabs = [
    { id: 'recommended' as const, label: 'Recommended', count: recommendedCount, icon: ' ' },
    { id: 'all' as const, label: 'All Upcoming', count: allCount, icon: '📅' },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-2xl w-fit"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-colors"
            style={{
              color: isActive ? '#fff' : '#888899',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {/* Active Background */}
            {isActive && (
              <motion.div
                layoutId="experiences-tabs-active-bg"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(236,72,153,0.1))',
                  border: '1px solid rgba(249,115,22,0.35)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              <span className={isActive ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className="px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold"
                style={{
                  background: isActive ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#ffedd5' : '#888899',
                  border: isActive ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.04)',
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

export default ExperiencesExperiencesTabs;
