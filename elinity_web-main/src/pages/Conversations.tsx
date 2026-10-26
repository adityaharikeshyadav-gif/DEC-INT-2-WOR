import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Compass, HelpCircle, BookOpen } from 'lucide-react';

import { fetchPersonas, fetchJourneys, startConversationSession } from '../lib/conversationsApi';
import type { Persona, Journey } from '../types/conversation';
import { PersonaCard } from '../components/conversation/PersonaCard';
import { JourneyCarousel } from '../components/conversation/JourneyCarousel';

export default function Conversations() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [personasData, journeysData] = await Promise.all([
          fetchPersonas(),
          fetchJourneys(),
        ]);
        setPersonas(personasData);
        setJourneys(journeysData);
      } catch (err) {
        console.error('Failed to fetch library data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectPersona = (persona: Persona) => {
    navigate(`/conversations/persona/${persona.id}`);
  };

  const handleSelectJourney = async (journey: Journey) => {
    // LOWER FRICTION: start session immediately with recommended persona
    try {
      setLoading(true);
      const res = await startConversationSession(journey.recommended_persona, journey.id);
      navigate(`/conversations/chat/${res.session_id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredPersonas = personas.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      activeFilter === 'all' || p.category.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Entering the Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white relative overflow-hidden font-sans pt-28 pb-16">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-blue-500/5 filter blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-[450px] h-[450px] rounded-full bg-purple-500/5 filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/10"
          >
            <Compass size={28} className="animate-spin-slow" />
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Conversational Sessions & Journeys
          </h1>
          <p className="text-base md:text-lg text-blue-200/70 font-medium mb-2 leading-relaxed">
            Reflect with history's greatest minds.
          </p>
          <p className="text-xs md:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Engage in guided conversations structured around psychological depth, self-reflection, and inner growth.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/conversations/history')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-bold text-neutral-300 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer shadow-lg shadow-black/20"
            >
              <BookOpen size={14} className="text-indigo-400" />
              My Life Book & Saved Insights
            </button>
          </div>
        </div>

        {/* Journey Row Section */}
        {journeys.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Featured Journeys</span>
              <div className="h-px bg-white/10 flex-grow" />
            </div>
            <JourneyCarousel
              journeys={journeys}
              personas={personas}
              onSelectJourney={handleSelectJourney}
            />
          </div>
        )}

        {/* Library Filters and Search */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Persona Directory</span>
            <div className="h-px bg-white/10 flex-grow" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/15 rounded-2xl p-4 md:p-6 backdrop-blur-xl mb-6">
            {/* Search Input */}
            <div className="relative w-full md:w-80 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 group focus-within:border-blue-500/50 transition-all">
              <Search size={16} className="text-neutral-500 group-focus-within:text-blue-400 mr-2.5 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search thinkers or topics..."
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-neutral-500"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
              {[
                { id: 'all', label: 'All Thinkers' },
                { id: 'psychology', label: 'Psychology' },
                { id: 'philosophy', label: 'Philosophy' },
                { id: 'stoicism', label: 'Stoicism' },
                { id: 'pragmatism', label: 'Pragmatism' },
                { id: 'creative', label: 'Creative & Taste (Vizzy)' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                    activeFilter === chip.id
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                      : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Persona Cards Grid */}
        {filteredPersonas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={handleSelectPersona}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-white/5 bg-white/5 rounded-2xl">
            <HelpCircle size={32} className="text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-400 mb-1">No Thinkers Found</h3>
            <p className="text-xs text-neutral-500">Try adjusting your search criteria or filter tags.</p>
          </div>
        )}

      </div>
    </div>
  );
}
