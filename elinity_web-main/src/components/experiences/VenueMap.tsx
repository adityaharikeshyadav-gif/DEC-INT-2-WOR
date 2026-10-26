import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface VenueMapProps {
  venue: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

export const VenueMap: React.FC<VenueMapProps> = ({ venue, city, coordinates }) => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue}, ${city}`
  )}`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Location
      </h3>

      <div
        className="relative rounded-2xl overflow-hidden border p-4 flex flex-col md:flex-row items-center gap-6"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Styled Map Graphic */}
        <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/10">
          {/* Abstract vector map background */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,10 L 200,80 M 50,0 L 50,150 M 120,0 L 180,150 M 0,90 L 200,120" stroke="#444" strokeWidth="2" />
            <path d="M 10,40 Q 80,60 100,120 T 200,130" stroke="#ff7a00" strokeWidth="1" strokeDasharray="4 4" fill="none" />
            <circle cx="100" cy="70" r="40" stroke="#333" strokeWidth="1" fill="none" />
            <circle cx="120" cy="90" r="25" stroke="#333" strokeWidth="1" fill="none" />
          </svg>

          {/* Glowing Venue Pin */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping" />
              <div className="relative p-2 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/50 border border-orange-400">
                <MapPin size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Address and CTA info */}
        <div className="flex-grow text-center md:text-left">
          <h4 className="text-sm font-bold text-white mb-1">{venue}</h4>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            {city} Area • Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all border border-orange-500/20 hover:border-orange-500/50"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(236, 72, 153, 0.15))',
            }}
          >
            <Navigation size={12} />
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;
