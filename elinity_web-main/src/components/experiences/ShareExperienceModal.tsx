import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Copy, Check, Share, Send } from 'lucide-react';
import { Experience } from './experiencesData';

interface ShareExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: Experience;
}

const MOCK_CONTACTS = [
  { id: 'c1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80' },
  { id: 'c2', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80' },
  { id: 'c3', name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80' },
  { id: 'c4', name: 'Sophia Martinez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80' },
];

export const ShareExperienceModal: React.FC<ShareExperienceModalProps> = ({ isOpen, onClose, experience }) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentContacts, setSentContacts] = useState<string[]>([]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(experience.shareLink || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: experience.title,
          text: experience.tagline,
          url: experience.shareLink,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendToContact = (contactId: string) => {
    setSentContacts((prev) => [...prev, contactId]);
    setTimeout(() => {
      // Simulate reset after some time
    }, 3000);
  };

  const filteredContacts = MOCK_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-md w-full rounded-2xl p-6 overflow-hidden z-10 text-white"
            style={{
              background: 'rgba(18, 18, 28, 0.96)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(249, 115, 22, 0.05)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Share Experience
            </h3>

            {/* Experience Preview */}
            <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-5">
              <img
                src={experience.heroImage}
                alt={experience.title}
                className="w-16 h-16 object-cover rounded-lg shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{experience.title}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {experience.tagline}
                </p>
              </div>
            </div>

            {/* Quick Actions (Copy & Native Share) */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ec4899)',
                }}
              >
                <Share size={14} />
                <span>Share Externally</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase tracking-wider">
                Send to Elinity Contacts
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-neutral-500" size={14} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>

            {/* Contacts List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {filteredContacts.map((contact) => {
                const isSent = sentContacts.includes(contact.id);
                return (
                  <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-neutral-200">{contact.name}</span>
                    </div>

                    <button
                      disabled={isSent}
                      onClick={() => handleSendToContact(contact.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isSent
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 hover:bg-orange-500/10 hover:text-orange-400 border border-white/5 hover:border-orange-500/30 text-neutral-300'
                      }`}
                    >
                      {isSent ? <Check size={10} /> : <Send size={10} />}
                      <span>{isSent ? 'Sent' : 'Send'}</span>
                    </button>
                  </div>
                );
              })}

              {filteredContacts.length === 0 && (
                <div className="text-center py-6 text-xs text-neutral-500">No contacts found.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareExperienceModal;
