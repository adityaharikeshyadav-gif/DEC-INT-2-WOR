import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Users, ShieldCheck, Share2 } from 'lucide-react';
import { Experience } from './experiencesData';
import ShareExperienceModal from './ShareExperienceModal';
import { bookExperience } from '../../lib/experiencesApi';

interface BookingCardProps {
  experience: Experience;
}

export const BookingCard: React.FC<BookingCardProps> = ({ experience }) => {
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'idle' | 'booking' | 'confirmed'>('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);

  const spotsLeft = experience.capacity - experience.filled;
  const fillPercent = Math.round((experience.filled / experience.capacity) * 100);
  const selectedTicket = experience.ticketTypes[selectedTicketIndex] || experience.ticketTypes[0];

  const handleBook = () => {
    setBookingStep('booking');
    setBookingError(null);
    bookExperience({
      experience_id: experience.id,
      experience_title: experience.title,
      price: selectedTicket.price,
      user_email: 'guest@elinity.com', // fallback for mockup
      user_name: 'Guest User'
    })
      .then(() => {
        setBookingStep('confirmed');
      })
      .catch((err: any) => {
        setBookingError(err.message || 'Booking failed');
        setBookingStep('idle');
      });
  };

  return (
    <div
      className="sticky top-28 rounded-3xl p-6 border text-white"
      style={{
        background: 'rgba(15, 15, 25, 0.9)',
        borderColor: 'rgba(249, 115, 22, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(249, 115, 22, 0.03)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-black">${selectedTicket.price}</span>
          <span className="text-xs text-neutral-400 ml-1.5">
            {selectedTicketIndex === 1 ? 'for 2 spots' : 'per spot'}
          </span>
        </div>
        {selectedTicketIndex === 1 && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
            Save $30
          </span>
        )}
      </div>

      {/* Ticket Selector */}
      <div className="space-y-3 mb-6">
        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Select Package</label>
        <div className="grid grid-cols-1 gap-2">
          {experience.ticketTypes.map((ticket, idx) => {
            const isSelected = selectedTicketIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedTicketIndex(idx)}
                className={`p-3 rounded-xl text-left border transition-all flex justify-between items-center ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{ticket.name}</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{ticket.description}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-orange-500 bg-orange-500' : 'border-neutral-500'
                  }`}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Capacity Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] text-neutral-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {spotsLeft} spots remaining
          </span>
          <span>{experience.filled}/{experience.capacity} filled</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${fillPercent}%`,
              background: 'linear-gradient(90deg, #f97316, #ec4899)',
            }}
          />
        </div>
      </div>

      {/* Booking CTAs */}
      {bookingStep === 'idle' && (
        <div className="space-y-2.5">
          <button
            onClick={handleBook}
            disabled={experience.status === 'sold-out'}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
            }}
          >
            {experience.status === 'sold-out' ? 'Sold Out' : 'Book Spots'}
          </button>

          <button
            onClick={handleBook}
            disabled={experience.status === 'sold-out'}
            className="w-full py-3 rounded-xl text-sm font-semibold text-neutral-300 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          >
            Reserve Spot (Pay Later)
          </button>
          
          {bookingError && (
            <div className="text-[10px] text-red-400 text-center mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
              {bookingError}
            </div>
          )}
        </div>
      )}

      {bookingStep === 'booking' && (
        <div className="py-4 text-center">
          <span className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-neutral-400">Securing your tickets...</p>
        </div>
      )}

      {bookingStep === 'confirmed' && (
        <div className="py-4 text-center bg-emerald-500/10 rounded-2xl border border-emerald-500/25">
          <ShieldCheck size={28} className="text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">Booking Confirmed!</h4>
          <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px] mx-auto">
            Details and receipt have been sent to your email.
          </p>
        </div>
      )}

      {/* Share & Support row */}
      <div className="flex gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button
          onClick={() => setShareOpen(true)}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-white/5 border border-white/10 hover:border-orange-500/30 hover:text-orange-400 transition-all flex items-center justify-center gap-1.5"
        >
          <Share2 size={12} />
          <span>Share Event</span>
        </button>
      </div>

      {/* Share Modal */}
      <ShareExperienceModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        experience={experience}
      />
    </div>
  );
};

export default BookingCard;
