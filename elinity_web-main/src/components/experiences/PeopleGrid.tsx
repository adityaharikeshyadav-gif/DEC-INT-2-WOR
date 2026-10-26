import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, UserPlus } from 'lucide-react';
import { RecommendedPerson } from './experiencesData';

interface PeopleGridProps {
  people: RecommendedPerson[];
}

export const PeopleGrid: React.FC<PeopleGridProps> = ({ people }) => {
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const handleConnect = (id: string) => {
    setConnectedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Recommended People Joining
        </h3>
        <span className="text-xs text-orange-400 font-medium flex items-center gap-1">
          <Sparkles size={12} className="animate-pulse" />
          <span>Curated by Lumi</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {people.map((person, index) => {
          const isConnected = connectedIds.includes(person.id);
          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="p-4 rounded-2xl flex flex-col justify-between border h-full"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
              }}
              whileHover={{ borderColor: 'rgba(249, 115, 22, 0.25)' }}
            >
              <div>
                {/* Header with Photo, Name, and Compatibility */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate leading-snug">{person.name}</h4>
                    <span className="text-[10px] text-neutral-400 font-medium">{person.profession}</span>
                  </div>
                  <div className="ml-auto shrink-0">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                      {person.compatibility}
                    </span>
                  </div>
                </div>

                {/* Bio / Mini Profile */}
                <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                  {person.bio}
                </p>

                {/* Shared Interests */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {person.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] text-neutral-300 border border-white/5"
                      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      #{interest.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connect Action */}
              <button
                disabled={isConnected}
                onClick={() => handleConnect(person.id)}
                className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-white/5 hover:bg-orange-500/10 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 text-neutral-300'
                }`}
              >
                {isConnected ? <Check size={12} /> : <UserPlus size={12} />}
                <span>{isConnected ? 'Connected' : 'Connect'}</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PeopleGrid;
