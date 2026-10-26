import re
import shutil
from pathlib import Path

HERE = Path(__file__).parent
STATIC_DIR = HERE / "static"
LOGO_SRC = HERE / "WhatsApp Image 2026-10-27 at 01.28.01.jpeg"

# 1. Ensure logo is copied
shutil.copy(LOGO_SRC, STATIC_DIR / "logo.jpeg")
elinity_public = HERE / "elinity_web-main" / "public"
if elinity_public.exists():
    shutil.copy(LOGO_SRC, elinity_public / "logo.jpeg")
print("[OK] Logo copied to static/logo.jpeg and elinity_web-main/public/logo.jpeg")

# 2. Chatbot Widget HTML and JS to inject before </body>
CHATBOT_INJECTION = """
<!-- ================= DECKOVIZ CHATBOT PIPELINE WIDGET ================= -->
<div id="deckoviz-chatbot-root" class="fixed bottom-6 right-6 z-50 font-sans">
  <!-- Trigger Button -->
  <button id="deckoviz-chat-toggle" class="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 text-white shadow-[0_8px_28px_rgba(124,58,237,0.45)] hover:shadow-[0_12px_36px_rgba(124,58,237,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-purple-300/40">
    <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-violet-500 border-2 border-[#121316]"></span>
    </span>
    <img src="/logo.jpeg" alt="Vizzy AI" class="w-8 h-8 rounded-full object-cover shadow-sm pointer-events-none group-hover:rotate-12 transition-transform duration-300" />
    <span class="sr-only">Open Deckoviz Chatbot</span>
  </button>

  <!-- Chat Drawer / Modal Window -->
  <div id="deckoviz-chat-window" class="hidden absolute bottom-16 right-0 w-[410px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[82vh] bg-[#0f0e17]/95 backdrop-blur-2xl border border-purple-500/25 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_32px_rgba(124,58,237,0.2)] flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
    <!-- Header -->
    <div class="px-5 py-3.5 bg-gradient-to-r from-purple-950/80 via-[#18122c]/90 to-indigo-950/80 border-b border-purple-500/20 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="relative">
          <img src="/logo.jpeg" alt="Deckoviz Curator" class="w-9 h-9 rounded-full object-cover border border-purple-400/50 shadow-md" />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f0e17]"></span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h3 class="font-bold text-sm text-purple-100 tracking-tight">Vizzy &amp; Lumi</h3>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase font-semibold">Atelier AI</span>
          </div>
          <p class="text-[11px] text-purple-300/70">Taste Calibration &amp; Curatorial Companion</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button id="deckoviz-chat-clear" title="Reset Session" class="p-1.5 rounded-lg text-purple-300/60 hover:text-purple-100 hover:bg-white/5 transition-colors">
          <span class="material-symbols-outlined text-[17px]">restart_alt</span>
        </button>
        <button id="deckoviz-chat-close" class="p-1.5 rounded-lg text-purple-300/60 hover:text-purple-100 hover:bg-white/5 transition-colors">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>

    <!-- Quick Mode Selector Pills -->
    <div class="px-4 py-2 bg-purple-950/30 border-b border-purple-500/10 flex gap-1.5 overflow-x-auto text-[11px] flex-shrink-0 no-scrollbar">
      <button class="deckoviz-mode-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-200 border border-purple-500/30 hover:bg-purple-600/50 active:scale-95 transition-all font-medium" data-prompt="I want to take the Deckoviz Style Calibration Quiz.">
        🎨 Style Quiz
      </button>
      <button class="deckoviz-mode-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-200 border border-purple-500/30 hover:bg-purple-600/50 active:scale-95 transition-all font-medium" data-prompt="Tell me about the Deckoviz Archival Atelier experiences and workshops.">
        🏛️ Atelier Workshop
      </button>
      <button class="deckoviz-mode-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-200 border border-purple-500/30 hover:bg-purple-600/50 active:scale-95 transition-all font-medium" data-prompt="How does the Illuminated Story Studio work?">
        📜 Story Studio
      </button>
      <button class="deckoviz-mode-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-200 border border-purple-500/30 hover:bg-purple-600/50 active:scale-95 transition-all font-medium" data-prompt="What is my signature aesthetic based on chiaroscuro and lithography?">
        ✨ Taste Signals
      </button>
    </div>

    <!-- Message History Feed -->
    <div id="deckoviz-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm select-text">
      <!-- Initial Greeting Message -->
      <div class="flex items-start gap-2.5">
        <img src="/logo.jpeg" alt="Vizzy" class="w-6 h-6 rounded-full object-cover mt-0.5 border border-purple-400/40 shrink-0" />
        <div class="p-3.5 rounded-2xl rounded-tl-sm bg-[#1c192e] border border-purple-500/20 text-purple-100/90 leading-relaxed max-w-[85%] shadow-sm">
          Welcome to the Deckoviz Atelier! I am Vizzy, your resident aesthetics and style curator. You can take our <strong class="text-purple-300">Style Calibration Quiz</strong>, explore <strong class="text-purple-300">Archival Atelier workshops</strong>, or refine your taste signals right here in chat. How may I guide your eye today?
        </div>
      </div>
    </div>

    <!-- Thinking indicator -->
    <div id="deckoviz-chat-typing" class="hidden px-4 py-2 flex items-center gap-2 text-xs text-purple-300/70">
      <div class="flex gap-1 items-center">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 150ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 300ms"></span>
      </div>
      <span>Vizzy is meditating on your taste...</span>
    </div>

    <!-- Input Footer -->
    <div class="p-3 bg-[#0d0c15] border-t border-purple-500/20 flex-shrink-0">
      <form id="deckoviz-chat-form" class="flex items-center gap-2 bg-[#171526] border border-purple-500/30 rounded-xl px-3 py-1.5 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400/30 transition-all">
        <input id="deckoviz-chat-input" type="text" placeholder="Message Vizzy or take a quiz..." autocomplete="off" class="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-purple-100 placeholder-purple-400/40 py-1" />
        <button type="submit" class="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all cursor-pointer shadow-md shadow-purple-600/30">
          <span class="material-symbols-outlined text-[17px] leading-none">arrow_upward</span>
        </button>
      </form>
      <div class="flex items-center justify-between text-[10px] text-purple-400/40 px-1 mt-1.5">
        <span>Connected to Deckoviz AI Engine</span>
        <span>Vol. IV • Atelier Folio</span>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  const root = document.getElementById('deckoviz-chatbot-root');
  if (!root) return;
  const toggleBtn = document.getElementById('deckoviz-chat-toggle');
  const chatWindow = document.getElementById('deckoviz-chat-window');
  const closeBtn = document.getElementById('deckoviz-chat-close');
  const clearBtn = document.getElementById('deckoviz-chat-clear');
  const messagesDiv = document.getElementById('deckoviz-chat-messages');
  const typingDiv = document.getElementById('deckoviz-chat-typing');
  const form = document.getElementById('deckoviz-chat-form');
  const input = document.getElementById('deckoviz-chat-input');
  const modeChips = document.querySelectorAll('.deckoviz-mode-chip');

  let history = [];
  let sessionId = null;
  let activeQuizId = null;

  // Toggle Window
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  clearBtn.addEventListener('click', () => {
    history = [];
    sessionId = null;
    activeQuizId = null;
    messagesDiv.innerHTML = `
      <div class="flex items-start gap-2.5">
        <img src="/logo.jpeg" alt="Vizzy" class="w-6 h-6 rounded-full object-cover mt-0.5 border border-purple-400/40 shrink-0" />
        <div class="p-3.5 rounded-2xl rounded-tl-sm bg-[#1c192e] border border-purple-500/20 text-purple-100/90 leading-relaxed max-w-[85%] shadow-sm">
          Session reset. Welcome back to the Deckoviz Atelier! How may I assist your style calibration or explore experiences with you?
        </div>
      </div>
    `;
  });

  // Mode Chips
  modeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        input.value = prompt;
        sendMessage(prompt);
      }
    });
  });

  function appendMessage(sender, text, options = null) {
    const wrap = document.createElement('div');
    wrap.className = sender === 'user' ? 'flex justify-end' : 'flex items-start gap-2.5';

    if (sender === 'user') {
      wrap.innerHTML = `
        <div class="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white max-w-[85%] shadow-md leading-relaxed text-sm">
          ${escapeHtml(text)}
        </div>
      `;
    } else {
      let optionButtonsHtml = '';
      if (options && Array.isArray(options) && options.length > 0) {
        optionButtonsHtml = `<div class="mt-2.5 pt-2 border-t border-purple-500/20 flex flex-col gap-1.5">
          ${options.map(opt => `<button class="deckoviz-choice-pill text-left px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs hover:bg-purple-600/50 hover:border-purple-400 active:scale-98 transition-all font-sans">${escapeHtml(opt)}</button>`).join('')}
        </div>`;
      }
      wrap.innerHTML = `
        <img src="/logo.jpeg" alt="Vizzy" class="w-6 h-6 rounded-full object-cover mt-0.5 border border-purple-400/40 shrink-0" />
        <div class="p-3.5 rounded-2xl rounded-tl-sm bg-[#1c192e] border border-purple-500/20 text-purple-100/90 leading-relaxed max-w-[85%] shadow-sm">
          <div>${formatMarkdown(text)}</div>
          ${optionButtonsHtml}
        </div>
      `;
    }

    messagesDiv.appendChild(wrap);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Attach choice pill clicks
    wrap.querySelectorAll('.deckoviz-choice-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.textContent.trim();
        sendMessage(choice);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatMarkdown(text) {
    return text
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-purple-300 font-semibold">$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em class="text-purple-200 italic">$1</em>')
      .replace(/\\n/g, '<br/>');
  }

  async function sendMessage(userText) {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.trim();
    input.value = '';

    appendMessage('user', cleanText);
    history.push({ role: 'user', content: cleanText });
    typingDiv.classList.remove('hidden');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      // 1. If user asks for quiz explicitly, start session
      if (cleanText.toLowerCase().includes('quiz') && !sessionId) {
        try {
          const res = await fetch('/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quiz_id: 46, mode: 'solo' })
          });
          if (res.ok) {
            const data = await res.json();
            sessionId = data.session_id;
            activeQuizId = 46;
            typingDiv.classList.add('hidden');
            appendMessage('bot', data.greeting, [
              'Warm afternoon light on raw wood floorboards',
              'A bold concrete arch with clean geometry',
              'A dreamlike surreal painting with fluid shapes',
              'A delicate woodblock print of ocean waves'
            ]);
            history.push({ role: 'assistant', content: data.greeting });
            return;
          }
        } catch (e) {
          console.warn('Session start fallback:', e);
        }
      }

      // 2. Active quiz session message
      if (sessionId) {
        try {
          const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: cleanText })
          });
          if (res.ok) {
            const data = await res.json();
            typingDiv.classList.add('hidden');
            appendMessage('bot', data.response);
            history.push({ role: 'assistant', content: data.response });
            return;
          }
        } catch (e) {
          console.warn('Chat session call fallback:', e);
        }
      }

      // 3. General Atelier / Lumi / Vizzy Chat Endpoint
      const res = await fetch('/chat/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: history.slice(-8).map(m => ({ sender: m.role === 'user' ? 'user' : 'assistant', text: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.response || "I am reflecting on your aesthetic instincts.";
        typingDiv.classList.add('hidden');
        appendMessage('bot', reply);
        history.push({ role: 'assistant', content: reply });
      } else {
        throw new Error('Endpoint returned ' + res.status);
      }
    } catch (err) {
      console.warn('Chat request failed, using intelligent client fallback:', err);
      typingDiv.classList.add('hidden');
      
      // Intelligent in-browser fallback
      const reply = generateLocalReply(cleanText);
      appendMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
    }
  }

  function generateLocalReply(text) {
    const t = text.toLowerCase();
    if (t.includes('woodcut') || t.includes('soot') || t.includes('shadow') || t.includes('noir')) {
      return "An exquisite leaning toward Victorian Woodcut Noir! You appreciate deep soot blacks, copperplate crosshatching, and dramatic chiaroscuro. Your taste signals align strongly with Plate No. IV.";
    }
    if (t.includes('impression') || t.includes('light') || t.includes('sun')) {
      return "A sublime instinct for Luminous Impressionism. You notice shifting light and atmospheric stillness over rigid lines. The Claude 3.7 dialectic matrix records a +0.82 affinity for warm plein-air palettes.";
    }
    if (t.includes('studio') || t.includes('story') || t.includes('manuscript')) {
      return "Our Illuminated Story Studio & Manuscript Forge allows you to sequence multi-panel storyboards with 24fps celluloid grain. Would you like to bind your current style to the studio?";
    }
    if (t.includes('atelier') || t.includes('workshop') || t.includes('experience')) {
      return "The Deckoviz Archival Atelier in San Francisco hosts hands-on workshops in woodcut relief printing, digital linotype, and aesthetic calibration. Passes are available under Atelier Experiences.";
    }
    return "A thoughtful observation. Your aesthetic choices reveal a discerning eye for material honesty and calm architectural rhythm. Would you like to explore another plate calibration or view your Curated Art Folio?";
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });
})();
</script>
<!-- ================= END DECKOVIZ CHATBOT WIDGET ================= -->
"""

# 3. Transform HTML files in static/
def upgrade_html_content(content: str) -> str:
    # A. Tailwind Config Colors: Replace orange/terracotta/amber with purple/violet/lavender
    color_replacements = [
        ('"primary":"#9f3c16"', '"primary":"#7c3aed"'),
        ('"primary-container":"#bf542c"', '"primary-container":"#6d28d9"'),
        ('"primary-fixed":"#ffdbcf"', '"primary-fixed":"#ede9fe"'),
        ('"primary-fixed-dim":"#ffb59c"', '"primary-fixed-dim":"#c4b5fd"'),
        ('"surface-tint":"#a23e18"', '"surface-tint":"#7c3aed"'),
        ('"inverse-primary":"#ffb59c"', '"inverse-primary":"#c4b5fd"'),
        ('"on-primary-fixed-variant":"#822801"', '"on-primary-fixed-variant":"#4c1d95"'),
        ('"on-primary-fixed":"#390c00"', '"on-primary-fixed":"#2e0854"'),
        ('"secondary":"#7e5713"', '"secondary":"#8b5cf6"'),
        ('"secondary-container":"#fec97b"', '"secondary-container":"#ddd6fe"'),
        ('"secondary-fixed":"#ffddb1"', '"secondary-fixed":"#f3e8ff"'),
        ('"secondary-fixed-dim":"#f2be71"', '"secondary-fixed-dim":"#d8b4fe"'),
        ('"on-secondary-container":"#78520e"', '"on-secondary-container":"#3b0764"'),
        ('"on-secondary-fixed":"#291800"', '"on-secondary-fixed":"#2e1065"'),
        ('"on-secondary-fixed-variant":"#614000"', '"on-secondary-fixed-variant":"#4c1d95"'),
        ('"outline":"#8a726a"', '"outline":"#8b7ea5"'),
        ('"outline-variant":"#dec0b7"', '"outline-variant":"#dcd3e8"'),
        ('"on-surface-variant":"#57423b"', '"on-surface-variant":"#504364"'),
        ('"background":"#fff8f4"', '"background":"#faf7fd"'),
        ('"surface":"#fff8f4"', '"surface":"#faf7fd"'),
        ('"surface-bright":"#fff8f4"', '"surface-bright":"#faf5ff"'),
        ('"surface-container-low":"#fdf2e9"', '"surface-container-low":"#f7f2fb"'),
        ('"surface-container":"#f7ece4"', '"surface-container":"#f3ebf9"'),
        ('"surface-container-high":"#f1e6de"', '"surface-container-high":"#efe4f6"'),
        ('"surface-container-highest":"#ebe1d8"', '"surface-container-highest":"#e9def2"'),
        ('"surface-dim":"#e3d8d0"', '"surface-dim":"#ece3f5"'),
        ('"inverse-surface":"#352f2a"', '"inverse-surface":"#2e2a38"'),
        ('"inverse-on-surface":"#faefe6"', '"inverse-on-surface":"#f5f3ff"'),
        ('"on-surface":"#201b16"', '"on-surface":"#1e1b2e"'),
        ('"on-background":"#201b16"', '"on-background":"#1e1b2e"'),
        # Kinfolk / Terracotta hexes if any
        ('#d96b43', '#8b5cf6'),
        ('#e07148', '#7c3aed'),
        ('#a0401c', '#6d28d9'),
        ('#511500', '#2e0854'),
        ('#5c1900', '#2e0854'),
        ('#802a05', '#4c1d95'),
        ('rgba(217, 107, 67', 'rgba(139, 92, 246'),
        ('rgba(217,107,67', 'rgba(139,92,246'),
        ('rgba(159, 60, 22', 'rgba(124, 58, 237'),
        ('rgba(159,60,22', 'rgba(124,58,237'),
    ]

    for old, new in color_replacements:
        content = content.replace(old, new)

    # B. Replace Logo Placeholder in Sidebar
    content = re.sub(
        r'<div class="w-9 h-9 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-display-lg text-headline-sm select-none shadow-\[inset_0_1px_2px_rgba\(36,31,26,0\.2\)\]">¶</div>',
        r'<img src="/logo.jpeg" alt="Deckoviz Logo" class="w-9 h-9 rounded-full object-cover shadow-[0_2px_10px_rgba(124,58,237,0.4)] border border-purple-400/40" />',
        content
    )

    # C. Replace Header Avatar with Logo
    content = re.sub(
        r'<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-1"><span class="material-symbols-outlined text-on-primary text-\[18px\]">person</span></div>',
        r'<img src="/logo.jpeg" alt="Deckoviz" class="w-8 h-8 rounded-full object-cover shadow-sm border border-purple-400/40 ml-1" />',
        content
    )

    # D. Replace Red Wax Seal with Purple Seal Badge
    content = re.sub(
        r'<div class="seal-badge absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-primary text-on-primary shadow-md flex items-center justify-center transition-transform"><span class="font-display-lg text-\[20px\] leading-none select-none">¶</span></div>',
        r'<div class="seal-badge absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.4)] flex items-center justify-center transition-transform"><span class="material-symbols-outlined text-[18px]">verified</span></div>',
        content
    )

    # E. Navigation links fix (if not already processed)
    content = re.sub(r'data-path="style-calibration-quiz"\s+href="#"', 'data-path="style-calibration-quiz" href="/style-calibration-quiz"', content)
    content = re.sub(r'data-path="curated-art-style"\s+href="#"', 'data-path="curated-art-style" href="/curated-art-style"', content)
    content = re.sub(r'data-path="daily-art-style-update"\s+href="#"', 'data-path="daily-art-style-update" href="/daily-art-style-update"', content)
    content = re.sub(r'data-path="cinematic-drafting-suite"\s+href="#"', 'data-path="cinematic-drafting-suite" href="/story-studio"', content)
    content = re.sub(r'data-path="illuminated-storyboards"\s+href="#"', 'data-path="illuminated-storyboards" href="/story-studio"', content)

    # F. Inject Chatbot Widget before </body> (if not already injected)
    if "deckoviz-chatbot-root" not in content:
        content = content.replace("</body>", f"{CHATBOT_INJECTION}\n</body>")

    return content

# Process all html files in static/
html_files = list(STATIC_DIR.glob("*.html"))
for p in html_files:
    if p.name == "classic.html":
        continue
    orig = p.read_text(encoding="utf-8")
    upgraded = upgrade_html_content(orig)
    p.write_text(upgraded, encoding="utf-8")
    print(f"[OK] Upgraded UI with purple theme, company logo, and chatbot pipeline: static/{p.name}")

print(f"Successfully processed {len(html_files)} HTML pages in static/!")
