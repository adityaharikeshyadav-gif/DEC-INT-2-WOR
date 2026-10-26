import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, BookOpen, Check, Copy, Download, Feather, Pause, Play, Send, UsersRound, X } from 'lucide-react';
import type { GameSession, LongTableEntry, LongTableHistorySnapshot } from '../../lib/gamesApi';
import { downloadLongTableHistory, getLongTableHistorySnapshot, loadLongTableHistory, saveLongTableEntry } from '../../lib/longTableHistory';
import { GameHelpButton } from './GameHelpButton';

interface Props {
  session: GameSession;
  username: string;
  isConnected: boolean;
  isHostTyping: boolean;
  error: string | null;
  onBack: () => void;
  onCompass: (text: string, history: LongTableHistorySnapshot[]) => void;
  onOccasion: (text: string) => void;
  onIntake: (text: string | null) => void;
  onConfirmSparse: () => void;
  onResponse: (text: string, targetType?: 'all' | 'specific' | 'vote', targetAge?: string) => void;
  onPass: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  COMPASS: 'Setting the compass',
  OCCASION: 'Why this letter, now',
  VOICE_INTAKE: 'Building the voices',
  INTAKE_CONFIRM: 'Voice material check',
  ENTERING_SELF: 'A self is arriving',
  SEATING: 'Seating the council',
  LETTER_WRITING: 'Writing the letter',
  CONVERSATION: 'Across the table',
  COUNCIL: 'The council is open',
  TABLE_LOG: 'Writing the Table Log',
  COMPLETED: 'The table is closed',
};

const MODE_LABELS = { letter: 'The Letter', conversation: 'The Conversation', council: 'The Council' } as const;

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function TableLogCard({ entry }: { entry: LongTableEntry }) {
  return (
    <article className="rounded-3xl border border-violet-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-violet-950/20 md:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">Table Log</p>
      <h2 className="mt-3 text-xl font-bold text-white">{entry.compass}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-violet-100/80">{entry.summary}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-black/25 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">What shifted</p><p className="mt-2 text-xs leading-5 text-neutral-300">{entry.shift}</p></div>
        <div className="rounded-2xl border border-white/5 bg-black/25 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Still open</p><p className="mt-2 text-xs leading-5 text-neutral-300">{entry.open_question}</p></div>
        <div className="rounded-2xl border border-white/5 bg-black/25 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Lumi noticed</p><p className="mt-2 text-xs leading-5 text-neutral-300">{entry.lumi_noticed}</p></div>
      </div>
      {entry.conflicts.length > 0 && <div className="mt-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Tensions left at the table</p>{entry.conflicts.map((conflict) => <p key={conflict} className="mt-2 text-xs text-amber-100/70">{conflict}</p>)}</div>}
      {entry.dedication && <p className="mt-5 border-l-2 border-violet-400/40 pl-4 text-sm italic text-violet-200">{entry.dedication}</p>}
      {entry.full_table_achieved && <p className="mt-5 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm font-semibold text-violet-100">The full table has now been met. Every age-range has had a genuine place here.</p>}
    </article>
  );
}

export function LongTableSession({ session, username, isConnected, isHostTyping, error, onBack, onCompass, onOccasion, onIntake, onConfirmSparse, onResponse, onPass, onPause, onResume, onClose }: Props) {
  const [text, setText] = useState('');
  const [councilTarget, setCouncilTarget] = useState('all');
  const [saved, setSaved] = useState<boolean | null>(null);
  const gs = session.game_state;
  const phase = gs?.phase || 'COMPASS';
  const mode = (gs?.mode || 'conversation') as keyof typeof MODE_LABELS;
  const ages = gs?.selected_ages || [];
  const isPaused = Boolean(gs?.paused);
  const lastVoice = useMemo(() => [...session.messages].reverse().find((message) => message.role === 'assistant')?.content || 'The table is ready.', [session.messages]);

  useEffect(() => {
    if (phase === 'COMPLETED' && gs?.table_log) setSaved(saveLongTableEntry(username, gs.table_log));
  }, [phase, gs?.table_log, username]);

  const submit = (event: FormEvent, action: (value: string) => void) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    action(value);
    setText('');
  };

  const submitCouncil = (value: string) => {
    if (councilTarget === 'vote') onResponse(value, 'vote');
    else if (councilTarget.startsWith('specific:')) onResponse(value, 'specific', councilTarget.slice(9));
    else onResponse(value, 'all');
  };

  const copyResult = async () => {
    const content = gs?.assembled_letter || (gs?.table_log ? JSON.stringify(gs.table_log, null, 2) : '');
    if (content) await navigator.clipboard.writeText(content);
  };

  const requestClose = () => {
    if (window.confirm('Close the table and write the session record now?')) onClose();
  };

  return (
    <div className="min-h-screen bg-[#08070b] px-4 pb-10 pt-3 text-white md:px-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[12%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-violet-600/[0.04] blur-[150px]" />
        <div className="absolute bottom-[8%] right-[10%] h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.025] blur-[150px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/30 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-neutral-400 hover:text-white"><ArrowLeft size={16} /></button>
          <div><h1 className="text-sm font-black">The Letters at the Long Table</h1><p className="text-[9px] font-bold uppercase tracking-widest text-violet-400">{MODE_LABELS[mode]} · private table</p></div>
        </div>
        <div className="flex items-center gap-2">
          <GameHelpButton gameSlug={session.game_slug} compact accentClassName="border-violet-500/20 bg-violet-500/10 text-violet-200 hover:bg-violet-500/15" />
          {phase !== 'COMPLETED' && <button onClick={isPaused ? onResume : onPause} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white">{isPaused ? <Play size={12} /> : <Pause size={12} />}{isPaused ? 'Resume' : 'Pause'}</button>}
          {!['ENTERING_SELF', 'SEATING', 'TABLE_LOG', 'COMPLETED'].includes(phase) && <button onClick={requestClose} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:border-violet-500/30 hover:text-violet-200"><X size={12} /> Close</button>}
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-violet-200">{PHASE_LABELS[phase] || phase}</span>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="order-2 space-y-5 rounded-3xl border border-white/5 bg-white/[0.025] p-5 lg:order-1">
          <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><UsersRound size={13} className="text-violet-400" /> At the table</p><div className="mt-3 space-y-2">{ages.map((age) => <div key={age.age} className="rounded-xl border border-violet-500/15 bg-violet-500/[0.06] px-3 py-2.5"><p className="text-xs font-semibold text-violet-100">{age.label}</p><p className="mt-0.5 text-[9px] uppercase tracking-widest text-neutral-600">{age.anchor.replace('_', ' ')}</p></div>)}</div></div>
          {gs?.return_match && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">The Return</p><p className="mt-2 text-xs leading-5 text-amber-100/70">This question has met the table before. Lumi will trace it only against the matched saved entry.</p></div>}
          <div><p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Table transcript</p><div className="mt-3 max-h-[28rem] space-y-3 overflow-y-auto pr-1">{session.messages.slice(-12).map((message, index) => <div key={`${message.sender}-${index}`}><p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">{message.sender}</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-neutral-400">{message.content}</p></div>)}</div></div>
        </aside>

        <section className="order-1 space-y-5 lg:order-2">
          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">{error}</div>}
          {isPaused && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center text-sm text-amber-200">The table is paused. Nothing advances until you return.</div>}

          {phase === 'COMPLETED' && gs?.table_log ? (
            <div className="space-y-5">
              {gs.assembled_letter && <article className="rounded-3xl border border-white/10 bg-[#0d0b11] p-7 md:p-10"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">The assembled letter</p><div className="mt-6 whitespace-pre-wrap font-serif text-base leading-8 text-neutral-200">{gs.assembled_letter}</div></article>}
              <TableLogCard entry={gs.table_log} />
              <div className="flex flex-wrap gap-2">
                <button onClick={copyResult} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-neutral-300 hover:bg-white/10"><Copy size={13} /> Copy result</button>
                <button onClick={() => downloadText(`long-table-${gs.table_log?.entry_id.slice(0, 8)}.txt`, gs.assembled_letter || JSON.stringify(gs.table_log, null, 2))} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-neutral-300 hover:bg-white/10"><Download size={13} /> Download</button>
                <button onClick={() => downloadLongTableHistory(loadLongTableHistory(username))} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 px-4 py-3 text-xs font-bold"><BookOpen size={13} /> Export full Table Log</button>
              </div>
              <p className={`text-xs ${saved ? 'text-green-400' : 'text-amber-400'}`}>{saved ? 'Saved to this browser’s Table Log.' : 'Local save failed. Download this result before leaving.'}</p>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-white/5 bg-white/[0.025] p-8 text-center backdrop-blur-sm md:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/20 bg-gradient-to-tr from-violet-700 via-indigo-600 to-amber-500 shadow-2xl shadow-violet-950/30"><Feather size={24} className={isHostTyping ? 'animate-pulse' : ''} /></div>
                <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.22em] text-violet-400">{isHostTyping ? 'Lumi is listening…' : PHASE_LABELS[phase]}</p>
                <h2 className="mx-auto mt-3 max-w-2xl whitespace-pre-wrap text-lg font-semibold leading-8 text-violet-50">“{phase === 'VOICE_INTAKE' ? gs?.intake_question : lastVoice}”</h2>
                {gs?.compass && <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Session compass</p><p className="mt-2 text-sm leading-6 text-neutral-200">{gs.compass}</p></div>}
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/[0.025] p-6">
                {phase === 'COMPASS' && <form onSubmit={(event) => submit(event, (value) => onCompass(value, getLongTableHistorySnapshot(username)))} className="space-y-3"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} rows={4} placeholder="What are you bringing to the table tonight?" className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm leading-6 outline-none focus:border-violet-500/50" /><button disabled={!text.trim() || isPaused} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 py-3.5 text-xs font-bold disabled:opacity-40"><Send size={13} /> Set the compass</button></form>}
                {phase === 'OCCASION' && <form onSubmit={(event) => submit(event, onOccasion)} className="space-y-3"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} rows={4} placeholder="What made this letter necessary now?" className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm leading-6 outline-none focus:border-violet-500/50" /><button disabled={!text.trim() || isPaused} className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 py-3.5 text-xs font-bold disabled:opacity-40">Begin the letter</button></form>}
                {phase === 'VOICE_INTAKE' && <form onSubmit={(event) => submit(event, onIntake)} className="space-y-3"><div className="mb-4 flex items-center justify-between"><p className="text-xs text-neutral-400">Question {(gs?.intake_index || 0) + 1} of 5</p><div className="flex gap-1">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={`h-1.5 w-8 rounded-full ${index < (gs?.intake_index || 0) ? 'bg-violet-500' : 'bg-white/10'}`} />)}</div></div><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} rows={4} placeholder="Answer only as specifically as feels useful…" className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm leading-6 outline-none focus:border-violet-500/50" /><div className="flex gap-2"><button type="button" disabled={isPaused} onClick={() => onIntake(null)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-xs font-bold text-neutral-400 hover:bg-white/10 disabled:opacity-40">Pass</button><button disabled={!text.trim() || isPaused} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 py-3.5 text-xs font-bold disabled:opacity-40"><Send size={13} /> Continue</button></div></form>}
                {phase === 'INTAKE_CONFIRM' && <div className="text-center"><p className="text-sm leading-6 text-neutral-300">With fewer than two substantive answers, the voice may remain broad. You can still continue without adding more.</p><button onClick={onConfirmSparse} disabled={isPaused} className="mt-5 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 px-6 py-3.5 text-xs font-bold disabled:opacity-40">Continue with what I shared</button></div>}
                {['ENTERING_SELF', 'SEATING', 'TABLE_LOG'].includes(phase) && <div className="py-8 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" /><p className="mt-4 text-xs text-neutral-500">Give this moment a little room.</p></div>}
                {['LETTER_WRITING', 'CONVERSATION', 'COUNCIL'].includes(phase) && <div className="space-y-4">{phase === 'COUNCIL' && <select value={councilTarget} onChange={(event) => setCouncilTarget(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111019] px-4 py-3 text-xs text-neutral-200 outline-none focus:border-violet-500/50"><option value="all">Address the whole table</option>{ages.map((age) => <option key={age.age} value={`specific:${age.label}`}>Ask {age.label}</option>)}<option value="vote">Request a non-binding vote</option></select>}<form onSubmit={(event) => submit(event, phase === 'COUNCIL' ? submitCouncil : onResponse)} className="space-y-3"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={6000} rows={5} placeholder={phase === 'LETTER_WRITING' ? 'Continue the letter in your own words…' : 'Say what you want this version of you to hear…'} className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm leading-6 outline-none focus:border-violet-500/50" /><button disabled={!text.trim() || isPaused} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 py-3.5 text-xs font-bold disabled:opacity-40"><Send size={13} /> {phase === 'LETTER_WRITING' ? 'Add this section' : 'Bring it to the table'}</button></form><div className="flex flex-wrap justify-between gap-2 border-t border-white/5 pt-4"><button onClick={onPass} disabled={isPaused} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-neutral-500 hover:text-white disabled:opacity-40">Pass this moment</button><button onClick={requestClose} disabled={isPaused} className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-200 hover:bg-violet-500/20 disabled:opacity-40"><Check size={13} /> {phase === 'LETTER_WRITING' ? 'Complete letter' : phase === 'COUNCIL' ? 'Close council' : 'Close conversation'}</button></div></div>}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
