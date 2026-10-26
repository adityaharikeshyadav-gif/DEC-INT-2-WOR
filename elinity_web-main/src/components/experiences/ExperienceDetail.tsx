import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, Heart, ShieldAlert, ArrowUpRight, Award, Flame, Send, Camera, UserCheck, Sparkles } from 'lucide-react';
import { fetchExperienceById, fetchExperienceLumiInsight } from '../../lib/experiencesApi';
import type { Experience } from './experiencesData';

import ExperienceInfoRow from './ExperienceInfoRow';
import ExperienceGallery from './ExperienceGallery';
import PeopleGrid from './PeopleGrid';
import VenueMap from './VenueMap';
import BookingCard from './BookingCard';
import ExperienceStatusBadge from './ExperienceStatusBadge';

export const ExperienceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  
  // Post-experience review state
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  // API State
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lumiInsight, setLumiInsight] = useState<string>('');
  const [lumiLoading, setLumiLoading] = useState(false);

  // Scroll to top and fetch experience on load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!id) return;
    setLoading(true);
    setError(null);
    fetchExperienceById(id)
      .then((data) => {
        setExperience(data);
        // Lazy-load Lumi insight
        setLumiLoading(true);
        fetchExperienceLumiInsight(id)
          .then(setLumiInsight)
          .catch(() => {/* fail silently */})
          .finally(() => setLumiLoading(false));
      })
      .catch(() => setError('Could not load experience details. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#07070f]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400">Loading experience details...</p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#07070f] px-4 text-center">
        <h3 className="text-xl font-bold mb-2">{error || 'Experience not found'}</h3>
        <Link to="/experiences" className="text-orange-400 hover:underline text-sm">
          Back to all experiences
        </Link>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(experience.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating > 0) {
      setHasReviewed(true);
    }
  };

  return (
    <div
      className="min-h-screen text-white pb-20"
      style={{ background: 'linear-gradient(to bottom, #030014, #0a0a2e)' }}
    >
      {/* Top Header/Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-28 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/experiences')}
            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to Experiences</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all text-neutral-300"
            >
              <Heart size={16} fill={isLiked ? '#f97316' : 'none'} className={isLiked ? 'text-orange-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Content (60% / 7 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Card */}
            <div className="relative rounded-3xl overflow-hidden h-64 md:h-[400px] border border-white/5">
              <img
                src={experience.heroImage}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
              
              {/* Floating badges inside image */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/35">
                    {experience.category.toUpperCase()}
                  </span>
                  <ExperienceStatusBadge status={experience.status} />
                </div>

                <h1
                  className="text-2xl md:text-4xl font-black text-white leading-tight mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {experience.title}
                </h1>
                <p className="text-sm md:text-base text-neutral-300 font-medium">
                  {experience.tagline}
                </p>
              </div>
            </div>

            {/* Host Section */}
            <div
              className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={experience.host.avatar}
                  alt={experience.host.name}
                  className="w-12 h-12 rounded-full object-cover border border-orange-500/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400">Hosted by</span>
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-0.5">
                      <Award size={10} />
                      {experience.host.role}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{experience.host.name}</h3>
                </div>
              </div>
              <p className="text-xs text-neutral-400 max-w-md italic sm:text-right">
                "{experience.host.bio}"
              </p>
            </div>

            {/* Quick Info Rows */}
            <ExperienceInfoRow experience={experience} />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                About the Experience
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Lumi Insight — real AI, lazy loaded */}
            <div
              className="p-5 rounded-2xl border animate-reveal"
              style={{
                background: 'rgba(249, 115, 22, 0.04)',
                borderColor: 'rgba(249, 115, 22, 0.15)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
                >
                  <Sparkles size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-orange-400">Lumi's take</span>
              </div>
              {lumiLoading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-orange-500/10 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-orange-500/10 rounded-full w-4/5 animate-pulse" />
                </div>
              ) : lumiInsight ? (
                <p className="text-xs text-neutral-200 italic leading-relaxed">{lumiInsight}</p>
              ) : (
                <p className="text-xs text-neutral-500 italic">Lumi is thinking...</p>
              )}
            </div>

            {/* Experience Brief (Tomorrow Reminder & Prep Tips) */}
            <div
              className="p-5 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(236, 72, 153, 0.03))',
                borderColor: 'rgba(249, 115, 22, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Experience Brief & Prep Tips
                </h4>
              </div>
              <div className="space-y-3 text-xs text-neutral-300">
                <p>
                  📅 <strong>Schedule:</strong> Arrive at <strong>{experience.venue}</strong> around{' '}
                  <strong>{experience.time.split(' - ')[0]}</strong>. The host will greet you at the entrance.
                </p>
                <p>
                  🎒 <strong>What to bring:</strong> {experience.requirements.join(', ')}. All other materials and refreshments are fully provided.
                </p>
                <p>
                  💬 <strong>Host note:</strong> "Dress comfortably and bring your curious self. We will have icebreakers, so don't worry if you're coming alone!"
                </p>
              </div>
            </div>

            {/* Recommended People attending */}
            {experience.recommendedPeople && (
              <PeopleGrid people={experience.recommendedPeople} />
            )}

            {/* Gallery */}
            <ExperienceGallery images={experience.gallery} />

            {/* Included Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                What's Included
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {experience.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <span className="text-orange-500 text-sm leading-none">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Venue Map */}
            <VenueMap
              venue={experience.venue}
              city={experience.city}
              coordinates={experience.coordinates}
            />

            {/* Post Experience Feedback UI */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Post-Experience Hub
              </h3>
              
              {!hasReviewed ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-300">Have you attended this experience before?</h4>
                      <p className="text-[10px] text-neutral-500">Leave a rating and share your moments with the tribe.</p>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-yellow-500 transition-transform hover:scale-110"
                        >
                          <Star
                            size={20}
                            fill={star <= (hoverRating || userRating) ? '#facc15' : 'none'}
                            className={star <= (hoverRating || userRating) ? 'text-yellow-400' : 'text-neutral-600'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      placeholder="Share feedback, tips for future attendees, or a quick thank you..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full h-20 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                    />
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-neutral-300 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                      >
                        <Camera size={12} />
                        <span>Upload Photos</span>
                      </button>
                      
                      <button
                        type="submit"
                        disabled={userRating === 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
                      >
                        <Send size={12} />
                        <span>Submit Review</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 text-emerald-400 flex flex-col items-center gap-2">
                  <UserCheck size={28} />
                  <h4 className="text-xs font-bold text-white">Thank you for your feedback!</h4>
                  <p className="text-[10px] text-neutral-400">Your review will be shared with the host and community.</p>
                </div>
              )}
            </div>

            {/* Existing Reviews list */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Reviews ({experience.reviews.length})
              </h3>
              <div className="space-y-4">
                {experience.reviews.map((review, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/2 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{review.name}</h4>
                        <span className="text-[9px] text-neutral-500">{review.date}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5">
                        <Star size={10} className="text-yellow-400" fill="#facc15" />
                        <span className="text-xs text-neutral-300 font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Content (40% / 4 cols) */}
          <div className="lg:col-span-4">
            <BookingCard experience={experience} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
