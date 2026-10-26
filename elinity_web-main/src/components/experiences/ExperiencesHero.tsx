import React from 'react';
import { Search } from 'lucide-react';

interface ExperiencesHeroProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const ExperiencesHero: React.FC<ExperiencesHeroProps> = ({ searchValue, onSearchChange }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-12">
      {/* Hero Content */}
      <div className="relative px-6 py-12 md:p-16 text-center max-w-3xl mx-auto flex flex-col items-center">
        {/* <span
          className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4 border border-orange-500/30 text-orange-400 bg-orange-500/10"
        >
          Elinity Activities
        </span> */}

        <h1
          className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Curated Experiences.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-coral-400 to-rose-400">
            Meet Amazing People.
          </span>
        </h1>

        <p className="text-sm md:text-base text-neutral-400 mb-8 max-w-xl leading-relaxed">
          Book memorable evenings, learn new crafts, and connect with matching locals. Handpicked and hosted city activities.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search experiences, venues, or tags..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default ExperiencesHero;
