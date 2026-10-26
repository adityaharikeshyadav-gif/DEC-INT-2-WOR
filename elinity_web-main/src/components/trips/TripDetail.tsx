import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Users, Star, Calendar, ChevronLeft,
  Shield, Check, X, ChevronLeft as ChevronLeftIcon, ChevronRight,
  Mountain, Leaf, Landmark, Sparkles,
} from 'lucide-react';
import { VIBE_CONFIG } from './tripsData';
import type { Trip } from '../../types/trip';
import { fetchTripById, fetchLumiInsight } from '../../lib/tripsApi';
import TripTimeline from './TripTimeline';
import GroupPreview from './GroupPreview';
import PricingCard from './PricingCard';

// ─── Section wrapper with reveal ─────────────────────────────────────────────

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl font-bold text-white mb-5"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' }}
    >
      {children}
    </h2>
  );
}

// ─── Gallery lightbox ─────────────────────────────────────────────────────────

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const allImages = images;

  const prev = () => setLightbox((n) => (n === null ? 0 : (n - 1 + allImages.length) % allImages.length));
  const next = () => setLightbox((n) => (n === null ? 0 : (n + 1) % allImages.length));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {allImages.map((img, i) => (
          <motion.div
            key={i}
            className="relative rounded-xl overflow-hidden cursor-pointer group"
            style={{ paddingBottom: '66%' }}
            onClick={() => setLightbox(i)}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={img}
              alt={`${title} photo ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              className="relative max-w-4xl w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[lightbox]}
                alt="Gallery"
                className="w-full max-h-[80vh] object-contain rounded-2xl"
              />
              {/* Controls */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="text-center text-xs text-neutral-400 mt-3">
                {lightbox + 1} / {allImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Quick Fact Pill ──────────────────────────────────────────────────────────

function FactPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="text-blue-400 shrink-0">{icon}</div>
      <div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">{label}</div>
        <div className="text-sm font-semibold text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lumiInsight, setLumiInsight] = useState<string>('');
  const [lumiLoading, setLumiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    fetchTripById(id)
      .then((data) => {
        setTrip(data);
        // Lazy-load Lumi insight after trip renders
        setLumiLoading(true);
        fetchLumiInsight(id)
          .then(setLumiInsight)
          .catch(() => {/* fail silently */})
          .finally(() => setLumiLoading(false));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030014' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-neutral-500 text-sm">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#030014' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold mb-2">Trip not found</h2>
          <p className="text-neutral-400 mb-6">The trip you're looking for doesn't exist.</p>
          <Link
            to="/trips"
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)' }}
          >
            Browse all trips
          </Link>
        </div>
      </div>
    );
  }

  const vibe = VIBE_CONFIG[trip.vibe];
  const difficultyColor = { easy: '#22c55e', moderate: '#f59e0b', challenging: '#ef4444' };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #030014, #0a0a2e)' }}>
      {/* ── Hero ── */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <motion.img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(3,0,20,0.3) 0%, rgba(3,0,20,0.85) 100%)' }}
        />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate('/trips')}
          className="absolute top-28 left-6 md:left-12 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <ChevronLeft size={16} />
          All Trips
        </motion.button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: vibe.bg, color: vibe.color, border: `1px solid ${vibe.color}33` }}
              >
                {vibe.icon} {vibe.label}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${difficultyColor[trip.difficulty]}15`, color: difficultyColor[trip.difficulty], border: `1px solid ${difficultyColor[trip.difficulty]}30` }}
              >
                {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
              </span>
              {trip.isRecommended && (
                <span
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}
                >
                  <Sparkles size={10} /> Lumi Pick
                </span>
              )}
            </div>

            <h1
              className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
            >
              {trip.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-neutral-300">
              <MapPin size={13} className="text-blue-400" />
              {trip.destination}
              <span className="text-neutral-600 mx-1">·</span>
              <Star size={12} className="text-yellow-400" fill="#facc15" />
              <span>{trip.rating}</span>
              <span className="text-neutral-500">({trip.reviewCount} reviews)</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Quick facts */}
            <Section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FactPill icon={<Clock size={16} />}     label="Duration"   value={`${trip.duration} days`} />
                <FactPill icon={<Users size={16} />}     label="Group size" value={`Up to ${trip.groupSize.max} people`} />
                <FactPill icon={<Calendar size={16} />}  label="Departs"    value={new Date(trip.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <FactPill icon={<MapPin size={16} />}    label="Region"     value={trip.destination} />
              </div>
            </Section>

            {/* About */}
            <Section>
              <SectionTitle>About this trip</SectionTitle>
              <p className="text-neutral-400 leading-relaxed text-sm md:text-base">{trip.summary}</p>
            </Section>

            {/* Lumi Insight — real AI, lazy loaded */}
            <Section>
              <div
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)' }}
                  >
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-300">Lumi's take</span>
                </div>
                {lumiLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-blue-500/10 rounded-full w-full animate-pulse" />
                    <div className="h-3 bg-blue-500/10 rounded-full w-4/5 animate-pulse" />
                  </div>
                ) : lumiInsight ? (
                  <p className="text-sm text-blue-100 italic leading-relaxed">{lumiInsight}</p>
                ) : (
                  <p className="text-sm text-blue-300/50 italic">Lumi is thinking...</p>
                )}
              </div>
            </Section>

            {/* Highlights */}
            <Section>
              <SectionTitle>Trip highlights</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {trip.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl text-sm text-neutral-300"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Check size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    {h}
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Gallery */}
            <Section>
              <SectionTitle>Gallery</SectionTitle>
              <Gallery images={trip.gallery} title={trip.title} />
            </Section>

            {/* Itinerary */}
            <Section>
              <SectionTitle>Itinerary</SectionTitle>
              <TripTimeline itinerary={trip.itinerary} />
            </Section>

            {/* Includes / Excludes */}
            <Section>
              <SectionTitle>What's included</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Included</h4>
                  <ul className="space-y-2">
                    {trip.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                        <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Not included</h4>
                  <ul className="space-y-2">
                    {trip.excludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-500">
                        <X size={14} className="text-neutral-600 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* Group preview */}
            <Section>
              <SectionTitle>Your group</SectionTitle>
              <GroupPreview trip={trip} />
            </Section>

            {/* Reviews */}
            {trip.reviews.length > 0 && (
              <Section>
                <SectionTitle>Reviews</SectionTitle>
                <div className="space-y-4">
                  {trip.reviews.map((review, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)' }}
                        >
                          {review.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{review.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: review.rating }).map((_, j) => (
                              <Star key={j} size={11} className="text-yellow-400" fill="#facc15" />
                            ))}
                            <span className="text-xs text-neutral-500 ml-1">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed italic">"{review.text}"</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Mobile pricing */}
            <div className="lg:hidden">
              <Section>
                <SectionTitle>Pricing & Booking</SectionTitle>
                <PricingCard trip={trip} sticky={false} />
              </Section>
            </div>
          </div>

          {/* Right column — sticky pricing (desktop only) */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0">
            <PricingCard trip={trip} sticky />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
