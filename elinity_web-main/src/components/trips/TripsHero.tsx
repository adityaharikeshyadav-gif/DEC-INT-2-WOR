import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Compass } from 'lucide-react';

const MARQUEE_DESTINATIONS = [
  'Bali ✦', 'Patagonia ✦', 'Kyoto ✦', 'Santorini ✦',
  'Morocco ✦', 'Sri Lanka ✦', 'Amalfi ✦', 'New Zealand ✦',
  'Lisbon ✦', 'Cape Town ✦', 'Maldives ✦', 'Georgia ✦',
];

// Inject styles once
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || document.getElementById('trips-hero-styles')) return;
  stylesInjected = true;
  const s = document.createElement('style');
  s.id = 'trips-hero-styles';
  s.textContent = `
    @keyframes marqueeScroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .trips-marquee-track {
      display: flex;
      width: max-content;
      animation: marqueeScroll 30s linear infinite;
    }
    .trips-marquee-track:hover { animation-play-state: paused; }
    @keyframes heroOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33%       { transform: translate(30px, -20px) scale(1.06); }
      66%       { transform: translate(-20px, 15px) scale(0.96); }
    }
    @keyframes heroOrb2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50%       { transform: translate(-25px, 20px) scale(1.08); }
    }
    .hero-orb-1 { animation: heroOrb 18s ease-in-out infinite; }
    .hero-orb-2 { animation: heroOrb2 22s ease-in-out infinite; }
    .hero-orb-3 { animation: heroOrb 26s ease-in-out infinite reverse; }
  `;
  document.head.appendChild(s);
}

interface TripsHeroProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const TripsHero: React.FC<TripsHeroProps> = ({ searchValue, onSearchChange }) => {
  useEffect(() => { injectStyles(); }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl py-10 px-6 md:px-6" style={{ minHeight: 420 }}>
      {/* Background orbs */}
      {/* <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"> */}
        {/* <div
          className="hero-orb-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div
          className="hero-orb-2 absolute -bottom-20 -right-20 w-[420px] h-[420px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7B3FE4 0%, transparent 70%)' }}
        />
        <div
          className="hero-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
        /> */}
        {/* Subtle grid */}
        {/* <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        /> */}
      {/* </div> */}

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
        >
          find your next{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #7B3FE4, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            adventure
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-neutral-400 mb-8 max-w-lg mx-auto leading-relaxed"
        >
          small-group trips with people you'll actually want to travel with. 
          lumi matches you to the right journey and the right humans.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-0 max-w-xl mx-auto rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(59,130,246,0.25)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 px-4 py-3.5 flex-1">
            <Search size={16} className="text-blue-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.blur(); }}
              placeholder="where do you want to go?"
              className="bg-transparent text-white placeholder-neutral-500 text-sm outline-none w-full"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
          <button
            onClick={() => inputRef.current?.blur()}
            className="px-5 py-3.5 text-sm font-semibold text-white shrink-0 transition-all"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)' }}
          >
            explore
          </button>
        </motion.div>

        {/* Quick filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-5"
        >
          {[
            { icon: <MapPin size={11} />, label: 'Asia' },
            { icon: <MapPin size={11} />, label: 'Europe' },
            { icon: <MapPin size={11} />, label: 'Americas' },
            { icon: <Calendar size={11} />, label: 'This Autumn' },
            { icon: <Calendar size={11} />, label: 'Under 7 days' },
          ].map((tag) => (
            <button
              key={tag.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-neutral-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {tag.icon}
              {tag.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Marquee strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 py-3 overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(3,0,20,0.4)', backdropFilter: 'blur(8px)' }}
      >
        <div className="trips-marquee-track">
          {[...MARQUEE_DESTINATIONS, ...MARQUEE_DESTINATIONS].map((dest, i) => (
            <span
              key={i}
              className="whitespace-nowrap mx-8 text-xs font-medium text-neutral-500 hover:text-blue-400 cursor-pointer transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.08em' }}
            >
              {dest}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TripsHero;
