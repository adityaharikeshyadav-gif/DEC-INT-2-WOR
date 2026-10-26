import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { Trip } from '../../types/trip';
import { bookTrip } from '../../lib/tripsApi';

interface PricingCardProps {
  trip: Trip;
  sticky?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ trip, sticky = true }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const navigate = useNavigate();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const spotsLeft = trip.groupSize.max - trip.groupSize.current;
  // Real price breakdown from the backend — no fake percentage math
  const { accommodation, activities, transport, food } = trip.priceBreakdown;

  // Track scroll position for sticky behaviour
  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBook = async () => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const result = await bookTrip({
        trip_id: trip.id,
        trip_title: trip.title,
        price: trip.price,
      });
      navigate('/payment', {
        state: {
          tripId: trip.id,
          tripTitle: trip.title,
          price: trip.price,
          bookingId: result.booking_id,
        },
      });
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={sticky ? 'sticky top-28' : ''}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,10,40,0.95)',
          border: '1px solid rgba(59,130,246,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(59,130,246,0.04)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ${trip.price.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">per person · all-inclusive</div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star size={13} className="text-yellow-400" fill="#facc15" />
              <span className="text-sm font-semibold text-white">{trip.rating}</span>
              <span className="text-xs text-neutral-500">({trip.reviewCount})</span>
            </div>
          </div>

          {/* Departure date */}
          <div
            className="flex items-center gap-2 p-2.5 rounded-lg text-xs text-neutral-300"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Clock size={12} className="text-blue-400 shrink-0" />
            <span>
              Departs{' '}
              <strong className="text-white">
                {new Date(trip.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </strong>
              {' '}· {trip.duration} days
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Price breakdown toggle */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <span>Price breakdown</span>
            {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2 text-xs overflow-hidden"
            >
              {[
                { label: 'Accommodation', value: accommodation },
                { label: 'Activities & guides', value: activities },
                { label: 'Transport & transfers', value: transport },
                { label: 'Food & meals', value: food },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-neutral-400">
                  <span>{row.label}</span>
                  <span className="text-neutral-300">${row.value.toLocaleString()}</span>
                </div>
              ))}
              <div
                className="flex justify-between font-semibold text-white pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>Total per person</span>
                <span>${trip.price.toLocaleString()}</span>
              </div>
            </motion.div>
          )}

          {/* Spots remaining */}
          {spotsLeft > 0 && (
            <div
              className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold"
              style={{
                background: spotsLeft <= 3 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                border: `1px solid ${spotsLeft <= 3 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                color: spotsLeft <= 3 ? '#f87171' : '#4ade80',
              }}
            >
              {spotsLeft <= 3 ? '🔥' : '✓'} {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
            </div>
          )}

          {/* CTA Button */}
          <motion.button
            onClick={handleBook}
            disabled={bookingLoading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white relative overflow-hidden disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #7B3FE4)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
            }}
            whileHover={bookingLoading ? {} : { scale: 1.02 }}
            whileTap={bookingLoading ? {} : { scale: 0.98 }}
          >
            {/* Shimmer effect */}
            {!bookingLoading && (
              <motion.div
                className="absolute inset-0 w-1/2 h-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', skewX: '-20deg' }}
                animate={{ x: ['-100%', '250%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            )}
            {bookingLoading ? 'Reserving...' : 'Book This Trip'}
          </motion.button>

          {/* Booking error */}
          {bookingError && (
            <p className="text-xs text-red-400 text-center -mt-1">{bookingError}</p>
          )}

          {/* Reserve / enquire secondary */}
          <button
            className="w-full py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/20"
          >
            Ask Lumi a question
          </button>

          {/* Trust signals */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { icon: <Shield size={12} className="text-blue-400" />, label: 'Lumi-verified' },
              { icon: <Zap size={12} className="text-yellow-400" />, label: 'Instant confirm' },
            ].map((sig) => (
              <div
                key={sig.label}
                className="flex items-center gap-1.5 p-2 rounded-lg text-xs text-neutral-400"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {sig.icon}
                {sig.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingCard;
