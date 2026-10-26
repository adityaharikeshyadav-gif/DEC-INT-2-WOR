import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Types ──
interface Message {
  id: string;
  sender: 'user' | 'lumi';
  text: string;
  isStreaming?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  short: string;
  category: string;
  tone: string;
  sensitive: boolean;
}

interface Participant {
  name: string;
  color: string;
}

// ── Constants ──
const API_BASE = 'http://localhost:8000';

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; gradient: string }> = {
  solo: { label: 'Solo & Self-Exploration', icon: '🪞', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  partner: { label: 'Romantic Partners', icon: '💙', gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
  group: { label: 'Friends & Groups', icon: '✨', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
  creative: { label: 'Deckoviz Taste & Atelier', icon: '🎨', gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)' },
};

const TONE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  fun: { label: 'Fun', bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
  deep: { label: 'Deep', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  warm: { label: 'Warm', bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
};

const PARTICIPANT_COLORS = ['#3b82f6', '#0ea5e9', '#60a5fa', '#2563eb', '#06b6d4', '#1e40af'];

// ── Component ──
export default function ElinityQuizzes() {
  // State
  const [view, setView] = useState<'landing' | 'setup' | 'chat'>('landing');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [mode, setMode] = useState<'solo' | 'partner' | 'group'>('solo');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // ── Fetch quizzes ──
  useEffect(() => {
    fetch(`${API_BASE}/quizzes`)
      .then(r => r.json())
      .then(setQuizzes)
      .catch(() => {
        // Fallback: use hardcoded minimal data if API is down
        console.warn('API unavailable, using fallback data');
      });
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  // ── Lock body scroll in chat ──
  useEffect(() => {
    if (view === 'chat') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [view]);

  // ── Stream text effect ──
  const streamText = useCallback((text: string, messageId: string) => {
    const words = text.split(' ');
    let i = 0;
    streamIntervalRef.current = setInterval(() => {
      if (i < words.length) {
        setStreamingText(prev => (i === 0 ? words[0] : prev + ' ' + words[i]));
        i++;
      } else {
        clearInterval(streamIntervalRef.current);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStreaming: false, text } : m));
        setStreamingText('');
      }
    }, 30);
  }, []);

   // ── Start quiz session ──
  const startQuiz = async (quiz: Quiz | null) => {
    setQuizLoading(true);
    try {
      const res = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quiz?.id || null,
          mode,
          participants: participants.map(p => p.name),
        }),
      });
      const data = await res.json();
      setSessionId(data.session_id);

      const greetingId = Date.now().toString();
      setMessages([{ id: greetingId, sender: 'lumi', text: '', isStreaming: true }]);
      setView('chat');
      setTimeout(() => streamText(data.greeting, greetingId), 200);
    } catch {
      console.error('Failed to start session');
    } finally {
      setQuizLoading(false);
    }
  };

  // ── Send message ──
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const sent = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: sent }),
      });
      const data = await res.json();
      const aiId = (Date.now() + 1).toString();
      setIsTyping(false);
      setMessages(prev => [...prev, { id: aiId, sender: 'lumi', text: '', isStreaming: true }]);
      setTimeout(() => streamText(data.response, aiId), 100);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'lumi', text: 'I had trouble connecting. Could you try again?' }]);
    }
  };

  // ── Filter quizzes ──
  const filteredQuizzes = quizzes.filter(q => {
    const matchFilter = filter === 'all' || q.category === filter || q.tone === filter;
    const matchSearch = !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.short.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ── Add participant ──
  const addParticipant = () => {
    if (participantInput.trim() && participants.length < 6) {
      setParticipants(prev => [...prev, { name: participantInput.trim(), color: PARTICIPANT_COLORS[prev.length % PARTICIPANT_COLORS.length] }]);
      setParticipantInput('');
    }
  };

  // ── Format message text with markdown-light ──
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  // ══════════════════════════════════════════════
  // RENDER: LANDING PAGE
  // ══════════════════════════════════════════════
  if (view === 'landing') {
    return (
      <div style={styles.pageWrap}>
        <style>{globalCSS}</style>

        {/* Ambient background */}
        <div style={styles.ambientBg}>
          <div style={styles.ambientOrb1} />
          <div style={styles.ambientOrb2} />
          <div style={styles.ambientOrb3} />
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.lumiAvatarLarge}>
              <span style={{ fontSize: 36 }}>✦</span>
            </div>
            <h1 style={styles.heroTitle}>Elinity Quizzes</h1>
            <p style={styles.heroSubtitle}>
              Know yourself better. Connect more deeply. Have more fun doing both.
            </p>
            <p style={styles.heroDesc}>
              45 quizzes across every dimension of human experience, from the deeply contemplative to the genuinely hilarious. 
              Guided by Lumi, your emotionally intelligent companion.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={styles.filterSection}>
          <div style={styles.filterBar}>
            <div style={styles.searchWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search quizzes..."
                style={styles.searchInput}
              />
            </div>
            <div style={styles.filterChips}>
              {[
                { key: 'all', label: 'All', icon: '🌟' },
                { key: 'solo', label: 'Solo', icon: '🪞' },
                { key: 'partner', label: 'Partner', icon: '💙' },
                { key: 'group', label: 'Group', icon: '✨' },
                { key: 'fun', label: 'Fun', icon: '🎭' },
                { key: 'deep', label: 'Deep', icon: '🌊' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    ...styles.filterChip,
                    ...(filter === f.key ? styles.filterChipActive : {}),
                  }}
                >
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz grid */}
        <div style={styles.quizGrid}>
          {filteredQuizzes.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => { setSelectedQuiz(q); setMode(q.category === 'partner' ? 'partner' : q.category === 'group' ? 'group' : 'solo'); setView('setup'); }}
              style={{ ...styles.quizCard, animationDelay: `${idx * 0.04}s` }}
              className="quiz-card"
            >
              <div style={styles.quizCardInner}>
                <div style={styles.quizCardHeader}>
                  <span style={{ ...styles.quizCategoryBadge, background: CATEGORY_CONFIG[q.category]?.gradient || '#6366f1' }}>
                    {CATEGORY_CONFIG[q.category]?.icon} {CATEGORY_CONFIG[q.category]?.label || q.category}
                  </span>
                  {TONE_BADGES[q.tone] && (
                    <span style={{ ...styles.toneBadge, background: TONE_BADGES[q.tone].bg, color: TONE_BADGES[q.tone].color }}>
                      {TONE_BADGES[q.tone].label}
                    </span>
                  )}
                </div>
                <h3 style={styles.quizCardTitle}>{q.title}</h3>
                <p style={styles.quizCardDesc}>{q.short}</p>
                <div style={styles.quizCardFooter}>
                  <span style={styles.startLabel}>Begin →</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom quiz CTA */}
        <div style={styles.customCTA}>
          <div style={styles.customCTAInner}>
            <span style={{ fontSize: 28 }}>💫</span>
            <div>
              <h3 style={styles.customCTATitle}>Don't see what you're looking for?</h3>
              <p style={styles.customCTADesc}>Tell Lumi what kind of quiz you're in the mood for and she'll build one for you on the spot.</p>
            </div>
            <button
              onClick={() => { setSelectedQuiz(null); setView('setup'); }}
              style={styles.customCTABtn}
              className="quiz-card"
            >
              Create Custom Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // RENDER: SETUP (mode + participants)
  // ══════════════════════════════════════════════
  if (view === 'setup') {
    const isPartnerOrGroup = selectedQuiz?.category === 'partner' || selectedQuiz?.category === 'group' || mode === 'partner' || mode === 'group';

    return (
      <div style={styles.pageWrap}>
        <style>{globalCSS}</style>
        <div style={styles.ambientBg}>
          <div style={styles.ambientOrb1} />
          <div style={styles.ambientOrb2} />
        </div>

        <div style={styles.setupContainer}>
          <button onClick={() => { setView('landing'); setParticipants([]); }} style={styles.backBtn}>
            ← Back to quizzes
          </button>

          <div style={styles.setupCard}>
            <div style={styles.lumiAvatarMed}>
              <span style={{ fontSize: 24 }}>✦</span>
            </div>

            <h2 style={styles.setupTitle}>
              {selectedQuiz ? selectedQuiz.title : 'Custom Quiz'}
            </h2>
            <p style={styles.setupDesc}>
              {selectedQuiz ? selectedQuiz.short : "Tell Lumi what you're in the mood for and she'll craft something just for you."}
            </p>

            {/* Mode selector */}
            <div style={styles.modeSection}>
              <p style={styles.modeLabel}>How would you like to take this?</p>
              <div style={styles.modeButtons}>
                {(['solo', 'partner', 'group'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{ ...styles.modeBtn, ...(mode === m ? styles.modeBtnActive : {}) }}
                  >
                    <span style={{ fontSize: 20 }}>
                      {m === 'solo' ? '🪞' : m === 'partner' ? '💙' : '✨'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            {(mode === 'partner' || mode === 'group') && (
              <div style={styles.participantSection}>
                <p style={styles.modeLabel}>
                  {mode === 'partner' ? "Who's taking this together?" : "Who's in the group?"}
                </p>
                <div style={styles.participantInputWrap}>
                  <input
                    value={participantInput}
                    onChange={e => setParticipantInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addParticipant()}
                    placeholder="Enter a name..."
                    style={styles.participantInput}
                  />
                  <button onClick={addParticipant} style={styles.addParticipantBtn}>+</button>
                </div>
                <div style={styles.participantList}>
                  {participants.map((p, i) => (
                    <div key={i} style={{ ...styles.participantChip, borderColor: p.color }}>
                      <div style={{ ...styles.participantDot, background: p.color }} />
                      {p.name}
                      <button
                        onClick={() => setParticipants(prev => prev.filter((_, j) => j !== i))}
                        style={styles.removeParticipant}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={() => startQuiz(selectedQuiz)}
              disabled={quizLoading || ((mode === 'partner' || mode === 'group') && participants.length < (mode === 'partner' ? 2 : 2))}
              style={{
                ...styles.startBtn,
                opacity: quizLoading ? 0.6 : 1,
              }}
              className="quiz-card"
            >
              {quizLoading ? (
                <span style={styles.loadingDots}>
                  <span className="ld1">·</span><span className="ld2">·</span><span className="ld3">·</span>
                </span>
              ) : (
                <>✦ Begin the Experience</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // RENDER: CHAT EXPERIENCE
  // ══════════════════════════════════════════════
  return (
    <div style={styles.chatPage} onWheel={e => e.stopPropagation()}>
      <style>{globalCSS}</style>

      {/* Chat ambient bg */}
      <div style={styles.chatAmbientBg}>
        <div style={{ ...styles.ambientOrb1, opacity: 0.15 }} />
        <div style={{ ...styles.ambientOrb2, opacity: 0.12 }} />
      </div>

      {/* Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderInner}>
          <button onClick={() => { setView('landing'); setMessages([]); setSessionId(''); }} style={styles.chatBackBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={styles.chatHeaderAvatar}>✦</div>
          <div>
            <div style={styles.chatHeaderTitle}>
              {selectedQuiz ? selectedQuiz.title : 'Custom Quiz'} 
            </div>
            <div style={styles.chatHeaderStatus}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isTyping ? '#f59e0b' : '#10b981',
                boxShadow: isTyping ? '0 0 8px #f59e0b' : '0 0 8px #10b981',
              }} />
              <span>{isTyping ? 'Lumi is thinking…' : 'Lumi is here'}</span>
            </div>
          </div>
          <div style={styles.chatHeaderRight}>
            {participants.length > 0 && (
              <div style={styles.participantAvatars}>
                {participants.map((p, i) => (
                  <div key={i} style={{ ...styles.miniAvatar, background: p.color, marginLeft: i > 0 ? -8 : 0 }}>
                    {p.name[0].toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.chatMessages}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.msgRow,
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
          }} className="msg-appear">
            {msg.sender === 'lumi' && (
              <div style={styles.lumiMsgAvatar}>✦</div>
            )}
            <div style={{
              ...styles.msgBubble,
              ...(msg.sender === 'user' ? styles.userBubble : styles.lumiBubble),
            }}>
              {msg.isStreaming ? (
                <span>
                  <span dangerouslySetInnerHTML={{ __html: formatText(streamingText) }} />
                  <span style={styles.cursor}>|</span>
                </span>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }} className="msg-appear">
            <div style={styles.lumiMsgAvatar}>✦</div>
            <div style={{ ...styles.msgBubble, ...styles.lumiBubble, padding: '16px 20px' }}>
              <div style={styles.typingDots}>
                <div style={{ ...styles.typingDot, animationDelay: '0s' }} />
                <div style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
                <div style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={styles.chatInputArea}>
        <div style={styles.chatShimmer} />
        <div style={styles.chatInputWrap}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Share your thoughts with Lumi…"
            style={styles.chatInput}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              ...styles.sendBtn,
              background: input.trim() ? 'linear-gradient(135deg, #3b82f6, #0284c7, #2563eb)' : 'rgba(255,255,255,0.06)',
              boxShadow: input.trim() ? '0 4px 20px rgba(59,130,246,0.4)' : 'none',
              transform: input.trim() ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
        <div style={styles.chatPowered}>Guided by Lumi · Elinity Quizzes</div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════
const styles: Record<string, React.CSSProperties> = {
  // Page
  pageWrap: {
    minHeight: '100vh',
    background: '#0a0a12',
    color: '#e5e7eb',
    fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 80,
  },
  ambientBg: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  ambientOrb1: {
    position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)',
    filter: 'blur(80px)', animation: 'orbFloat 12s ease-in-out infinite',
  },
  ambientOrb2: {
    position: 'absolute', top: '50%', right: '10%', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)',
    filter: 'blur(80px)', animation: 'orbFloat 15s ease-in-out 3s infinite reverse',
  },
  ambientOrb3: {
    position: 'absolute', bottom: '5%', left: '40%', width: 350, height: 350, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.1), transparent 70%)',
    filter: 'blur(80px)', animation: 'orbFloat 18s ease-in-out 6s infinite',
  },

  // Hero
  hero: { position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 24px 40px' },
  heroInner: { maxWidth: 680, margin: '0 auto' },
  lumiAvatarLarge: {
    width: 72, height: 72, borderRadius: 22, margin: '0 auto 24px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #60a5fa, #0284c7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
    boxShadow: '0 8px 40px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    animation: 'orbFloat 3s ease-in-out infinite',
  },
  heroTitle: {
    fontSize: 48, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 16px',
    background: 'linear-gradient(135deg, #ffffff, #93c5fd, #2563eb, #1e40af)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: 18, color: '#a5b4fc', fontWeight: 500, margin: '0 0 12px', letterSpacing: '-0.2px',
  },
  heroDesc: {
    fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 520, margin: '0 auto',
  },

  // Filter
  filterSection: { position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 1200, margin: '0 auto 32px' },
  filterBar: {
    display: 'flex', flexDirection: 'column' as const, gap: 16,
    background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '16px 20px',
    border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
    background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#e5e7eb', fontSize: 14, fontFamily: 'inherit',
  },
  filterChips: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  filterChip: {
    padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)', color: '#9ca3af', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'inherit',
  },
  filterChipActive: {
    background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa',
  },

  // Quiz Grid
  quizGrid: {
    position: 'relative', zIndex: 1, display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 16, padding: '0 24px', maxWidth: 1200, margin: '0 auto',
  },
  quizCard: {
    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const,
    animation: 'fadeUp 0.5s ease-out both', fontFamily: 'inherit',
  },
  quizCardInner: {
    padding: '22px 24px', borderRadius: 20,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    height: '100%', display: 'flex', flexDirection: 'column' as const,
  },
  quizCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  quizCategoryBadge: {
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#fff',
    display: 'inline-flex', alignItems: 'center', gap: 4,
  },
  toneBadge: {
    padding: '3px 9px', borderRadius: 16, fontSize: 11, fontWeight: 600,
  },
  quizCardTitle: {
    fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px', margin: '0 0 8px', lineHeight: 1.3,
  },
  quizCardDesc: {
    fontSize: 13.5, color: '#9ca3af', lineHeight: 1.6, margin: 0, flex: 1,
  },
  quizCardFooter: { marginTop: 16, display: 'flex', justifyContent: 'flex-end' },
  startLabel: { fontSize: 13, color: '#3b82f6', fontWeight: 600 },

  // Custom CTA
  customCTA: { position: 'relative', zIndex: 1, padding: '40px 24px 0', maxWidth: 1200, margin: '0 auto' },
  customCTAInner: {
    display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.06))',
    border: '1px solid rgba(59,130,246,0.15)',
    flexWrap: 'wrap' as const,
  },
  customCTATitle: { fontSize: 17, fontWeight: 700, color: '#e0e7ff', margin: 0 },
  customCTADesc: { fontSize: 13.5, color: '#9ca3af', margin: '4px 0 0', lineHeight: 1.5 },
  customCTABtn: {
    marginLeft: 'auto', padding: '10px 22px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
    transition: 'all 0.25s',
  },

  // Setup
  setupContainer: { position: 'relative', zIndex: 1, maxWidth: 540, margin: '0 auto', padding: '100px 24px 40px' },
  backBtn: {
    background: 'none', border: 'none', color: '#a5b4fc', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit',
  },
  setupCard: {
    background: 'rgba(255,255,255,0.03)', borderRadius: 28, padding: '40px 32px',
    border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
    textAlign: 'center',
  },
  lumiAvatarMed: {
    width: 56, height: 56, borderRadius: 18, margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #2563eb)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
    boxShadow: '0 6px 28px rgba(59,130,246,0.35)',
  },
  setupTitle: {
    fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 10px',
    background: 'linear-gradient(135deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  setupDesc: { fontSize: 14.5, color: '#9ca3af', lineHeight: 1.7, margin: '0 0 28px' },
  modeSection: { marginBottom: 24 },
  modeLabel: { fontSize: 13, color: '#a5b4fc', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  modeButtons: { display: 'flex', gap: 10, justifyContent: 'center' },
  modeBtn: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6,
    padding: '14px 22px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'inherit',
  },
  modeBtnActive: {
    background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa',
  },
  participantSection: { marginBottom: 24 },
  participantInputWrap: { display: 'flex', gap: 8, marginBottom: 12 },
  participantInput: {
    flex: 1, padding: '10px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e5e7eb', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  },
  addParticipantBtn: {
    width: 40, height: 40, borderRadius: 12, border: 'none',
    background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 20,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  participantList: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center' },
  participantChip: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
    borderRadius: 20, border: '1px solid', background: 'rgba(255,255,255,0.03)',
    fontSize: 13, color: '#e5e7eb',
  },
  participantDot: { width: 8, height: 8, borderRadius: '50%' },
  removeParticipant: {
    background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
    fontSize: 16, padding: 0, marginLeft: 2, fontFamily: 'inherit',
  },
  startBtn: {
    width: '100%', padding: '16px 28px', borderRadius: 16, border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)', color: '#fff',
    fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 8px 32px rgba(59,130,246,0.35)', transition: 'all 0.3s',
    letterSpacing: '-0.2px',
  },
  loadingDots: { display: 'flex', gap: 4, justifyContent: 'center', fontSize: 28 },

  // Chat
  chatPage: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: '#0a0a12',
    display: 'flex', flexDirection: 'column' as const,
    fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
  },
  chatAmbientBg: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 },
  chatHeader: {
    position: 'relative', zIndex: 2, flexShrink: 0,
    background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  chatHeaderInner: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
    maxWidth: 800, margin: '0 auto',
  },
  chatBackBtn: {
    width: 36, height: 36, borderRadius: 10, border: 'none',
    background: 'rgba(255,255,255,0.06)', color: '#60a5fa', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  chatHeaderAvatar: {
    width: 38, height: 38, borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
    boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
  },
  chatHeaderTitle: { fontWeight: 700, fontSize: 15, color: '#f1f5f9', letterSpacing: '-0.2px' },
  chatHeaderStatus: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  chatHeaderRight: { marginLeft: 'auto' },
  participantAvatars: { display: 'flex', alignItems: 'center' },
  miniAvatar: {
    width: 28, height: 28, borderRadius: '50%', color: '#fff', fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid #0a0a12',
  },

  // Messages
  chatMessages: {
    flex: 1, overflowY: 'auto' as const, overscrollBehavior: 'contain',
    padding: '24px 20px', display: 'flex', flexDirection: 'column' as const, gap: 16,
    maxWidth: 800, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1,
  },
  msgRow: {
    display: 'flex', alignItems: 'flex-end', gap: 10,
  },
  lumiMsgAvatar: {
    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
    boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
  },
  msgBubble: {
    maxWidth: '78%', padding: '14px 18px', borderRadius: 20,
    fontSize: 14.5, lineHeight: 1.7, wordBreak: 'break-word' as const,
  },
  userBubble: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)',
    color: '#fff', borderBottomRightRadius: 6,
    boxShadow: '0 4px 24px rgba(59,130,246,0.3)',
  },
  lumiBubble: {
    background: 'rgba(255,255,255,0.06)', color: '#e5e7eb',
    border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 6,
  },
  cursor: { opacity: 0.5, animation: 'blink 1s step-end infinite', marginLeft: 1 },
  typingDots: { display: 'flex', gap: 5, alignItems: 'center' },
  typingDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    animation: 'dotBounce 1.2s ease-in-out infinite',
  },

  // Chat input
  chatInputArea: {
    position: 'relative', zIndex: 2, flexShrink: 0,
    padding: '12px 20px 16px',
    background: 'rgba(10,10,18,0.9)', backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  chatShimmer: {
    height: 2, borderRadius: 2, marginBottom: 12,
    background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(6,182,212,0.3), transparent)',
    backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite',
  },
  chatInputWrap: {
    display: 'flex', gap: 10, maxWidth: 800, margin: '0 auto',
    background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '5px 5px 5px 16px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  chatInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#e5e7eb', fontSize: 14.5, fontFamily: 'inherit', padding: '8px 0',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', flexShrink: 0,
  },
  chatPowered: {
    textAlign: 'center' as const, marginTop: 8, fontSize: 11, color: 'rgba(165,180,252,0.4)', letterSpacing: '0.3px',
  },
};


// ══════════════════════════════════════════════
// GLOBAL CSS (animations + responsive)
// ══════════════════════════════════════════════
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes orbFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.02); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  @keyframes dotBounce {
    0%, 60%, 100% { transform: scale(0.5); opacity: 0.4; }
    30% { transform: scale(1.2); opacity: 1; }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .msg-appear {
    animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
  }

  .quiz-card:hover .quizCardInner,
  .quiz-card:hover > div {
    border-color: rgba(59,130,246,0.25) !important;
    background: rgba(255,255,255,0.05) !important;
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(59,130,246,0.12);
  }

  /* Scrollbar overrides for chat */
  .chatMessages::-webkit-scrollbar { width: 4px; }
  .chatMessages::-webkit-scrollbar-track { background: transparent; }
  .chatMessages::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 8px; }

  /* Responsive */
  @media (max-width: 768px) {
    .quiz-grid-override {
      grid-template-columns: 1fr !important;
    }
  }
`;
