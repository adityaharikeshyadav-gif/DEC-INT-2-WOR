import React from 'react';
import { JourneyCard } from './JourneyCard';
import type { Journey, Persona } from '../../types/conversation';

interface JourneyCarouselProps {
  journeys: Journey[];
  personas: Persona[];
  onSelectJourney: (journey: Journey) => void;
}

export const JourneyCarousel: React.FC<JourneyCarouselProps> = ({
  journeys,
  personas,
  onSelectJourney,
}) => {
  const getPersonaName = (id: string) => {
    const p = personas.find((x) => x.id === id);
    return p ? p.name : 'Thinker';
  };

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Horizontally scrolling list container */}
      <div 
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
        style={{
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {journeys.map((journey) => (
          <div key={journey.id} className="snap-start shrink-0">
            <JourneyCard
              journey={journey}
              personaName={getPersonaName(journey.recommended_persona)}
              onSelect={onSelectJourney}
            />
          </div>
        ))}
      </div>

      {/* Fade shadows to indicate scrollable content on desktop */}
      <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-[#0a0a12] to-transparent pointer-events-none hidden md:block" />
      <div className="absolute top-0 left-0 bottom-4 w-12 bg-gradient-to-r from-[#0a0a12] to-transparent pointer-events-none hidden md:block" />
    </div>
  );
};
