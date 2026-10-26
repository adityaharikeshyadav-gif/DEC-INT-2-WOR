import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, ListChecks, Sparkles, Trophy, X } from 'lucide-react';
import { getGameHelpGuide } from '../../lib/gameHelp';

interface GameHelpButtonProps {
  gameSlug?: string | null;
  compact?: boolean;
  accentClassName?: string;
}

export function GameHelpButton({ gameSlug, compact = false, accentClassName = 'text-purple-300 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15' }: GameHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const guide = getGameHelpGuide(gameSlug);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (!guide) return null;

  const overlay = (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-[#05050a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[12%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-purple-600/[0.08] blur-[150px]" />
        <div className="absolute bottom-[8%] right-[10%] h-[30rem] w-[30rem] rounded-full bg-indigo-500/[0.06] blur-[150px]" />
      </div>

      <div
        className="relative z-10 flex min-h-screen flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`game-help-${gameSlug}`}
      >
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05050a]/90 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">
                <Sparkles size={13} /> Quick Guide
              </p>
              <h2 id={`game-help-${gameSlug}`} className="mt-1 text-xl font-black tracking-tight md:text-2xl">{guide.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close how to play guide"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-8 md:px-8 md:py-10">
          <section className="rounded-[1.75rem] border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-indigo-500/5 p-6 shadow-2xl shadow-purple-950/20 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">Your mission</p>
            <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-purple-50/90">{guide.mission}</p>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-300">
                <ListChecks size={15} className="text-purple-300" /> Step by step
              </h3>
              <ol className="mt-5 space-y-4">
                {guide.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-neutral-300">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-[10px] font-black text-purple-200">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <div className="space-y-4">
              <section className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-5 md:p-6">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-200">
                  <Trophy size={15} /> How you win
                </h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/90">{guide.winCondition}</p>
              </section>

              <section className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 md:p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-300">Play better</h3>
                <div className="mt-3 space-y-2">
                  {guide.quickTips.map((tip) => (
                    <div key={tip} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold leading-5 text-neutral-300">
                      {tip}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${accentClassName}`}
        aria-label={`How to play ${guide.title}`}
      >
        <HelpCircle size={compact ? 13 : 14} />
        <span>How to play</span>
      </button>

      {isOpen && createPortal(overlay, document.body)}
    </>
  );
}
