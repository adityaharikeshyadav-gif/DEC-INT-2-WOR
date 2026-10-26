import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clipboard,
  Compass,
  Download,
  Hand,
  Pause,
  Play,
  Send,
  Shield,
  Square,
  Users,
} from 'lucide-react';
import type { GameSession, UnsaidDepth, UnsaidMap, UnsaidPhase } from '../../lib/gamesApi';
import { GameHelpButton } from './GameHelpButton';

const RELEASE_STARTERS = [
  'What I needed to say was...',
  'What I needed to hear was...',
  "What I'm letting go of tonight is...",
  "What I'm taking with me is...",
] as const;

const DEPTHS: UnsaidDepth[] = ['surface', 'current', 'bedrock'];

interface UnsaidSessionProps {
  session: GameSession;
  username: string;
  isConnected: boolean;
  isHostTyping: boolean;
  error: string | null;
  onBack: () => void;
  onSubmitAnswer: (text: string) => void;
  onPass: () => void;
  onDepthChoice: (choice: 'stay' | 'deeper' | 'release') => void;
  onRelease: (starter: string, text: string, share: boolean) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function titleCase(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapAsText(title: string, map: UnsaidMap) {
  return [
    title,
    '',
    map.summary,
    '',
    `Specific moment: ${map.specific_moment}`,
    `What shifted: ${map.shift}`,
    `Words held: “${map.quote}”`,
    `Open question: ${map.open_question}`,
  ].join('\n');
}

function MapCard({ title, map }: { title: string; map: UnsaidMap }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyMap = async () => {
    try {
      await navigator.clipboard.writeText(mapAsText(title, map));
      setCopyFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyFailed(true);
    }
  };

  const downloadMap = () => {
    const blob = new Blob([mapAsText(title, map)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="rounded-3xl border border-purple-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-purple-950/20 backdrop-blur-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-purple-400">The Unsaid Map</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={copyMap} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-neutral-400 transition hover:border-white/20 hover:text-white" title="Copy map">
            {copied ? <Check size={15} className="text-green-400" /> : <Clipboard size={15} />}
          </button>
          <button onClick={downloadMap} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-neutral-400 transition hover:border-white/20 hover:text-white" title="Download map">
            <Download size={15} />
          </button>
        </div>
      </div>
      <p className="text-sm leading-7 text-purple-100">{map.summary}</p>
      <dl className="mt-6 space-y-4 border-t border-white/10 pt-5">
        {[
          ['Specific moment', map.specific_moment],
          ['What shifted', map.shift],
          ['Words held', `“${map.quote}”`],
          ['Still open', map.open_question],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{label}</dt>
            <dd className="mt-1 text-sm leading-6 text-neutral-300">{value}</dd>
          </div>
        ))}
      </dl>
      {copyFailed && <p className="mt-4 text-xs text-amber-300">Copy was blocked by the browser. Download the map instead.</p>}
    </article>
  );
}

export function UnsaidSession({
  session,
  username,
  isConnected,
  isHostTyping,
  error,
  onBack,
  onSubmitAnswer,
  onPass,
  onDepthChoice,
  onRelease,
  onPause,
  onResume,
  onStop,
}: UnsaidSessionProps) {
  const [answer, setAnswer] = useState('');
  const [releaseText, setReleaseText] = useState('');
  const [starter, setStarter] = useState<string>(RELEASE_STARTERS[0]);
  const [share, setShare] = useState(false);
  const gs = session.game_state;
  const phase = (gs?.phase || 'OPENING') as UnsaidPhase;
  const depth = gs?.depth_level || 'surface';
  const activePlayer = session.current_player_id;
  const isMyTurn = activePlayer === username;
  const latestLumiMessage = useMemo(
    () => [...session.messages].reverse().find((message) => message.sender === 'Lumi')?.content || 'The room is ready.',
    [session.messages],
  );
  const isFinished = phase === 'COMPLETED' || phase === 'STOPPED';

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim()) return;
    onSubmitAnswer(answer.trim());
    setAnswer('');
  };

  const submitRelease = (event: FormEvent) => {
    event.preventDefault();
    if (!releaseText.trim()) return;
    onRelease(starter, releaseText.trim(), share);
    setReleaseText('');
  };

  const stop = () => {
    if (window.confirm('Stop guided questioning for the whole room? Nothing else will be required.')) onStop();
  };

  return (
    <div className="min-h-screen bg-[#05050a] px-4 pb-10 pt-3 text-white md:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-purple-500/[0.035] blur-[140px]" />
        <div className="absolute bottom-[5%] right-[10%] h-[28rem] w-[28rem] rounded-full bg-indigo-500/[0.03] blur-[140px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/30 px-4 py-3 backdrop-blur-md md:px-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-neutral-400 transition hover:bg-white/10 hover:text-white" aria-label="Leave session">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight">The Unsaid</h1>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
              {titleCase(gs?.terrain, 'The Hard Thing')} · {titleCase(depth, 'Surface')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GameHelpButton gameSlug={session.game_slug} compact />
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
            {titleCase(phase, 'Opening')}
          </span>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'animate-pulse bg-red-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="order-2 rounded-3xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm lg:order-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><Users size={13} className="text-purple-400" /> The room</p>
            <span className="text-[10px] text-neutral-600">{session.players.length}</span>
          </div>
          <div className="space-y-2">
            {session.players.map((player) => (
              <div key={player.username} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${player.username === activePlayer ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/5 bg-black/20'}`}>
                <span className="text-xs font-semibold text-neutral-300">{player.username}{player.username === username ? ' · you' : ''}</span>
                {player.username === activePlayer && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />}
              </div>
            ))}
          </div>

          <div className="mt-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Depth</p>
            <div className="space-y-2">
              {DEPTHS.map((item, index) => {
                const currentIndex = DEPTHS.indexOf(depth);
                const reached = index <= currentIndex;
                return (
                  <div key={item} className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-purple-400 ring-4 ring-purple-500/10' : reached ? 'bg-purple-700' : 'bg-white/10'}`} />
                    <span className={`text-xs capitalize ${index === currentIndex ? 'font-semibold text-purple-200' : 'text-neutral-600'}`}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {!isFinished && (
            <div className="mt-8 space-y-2 border-t border-white/5 pt-5">
              {gs?.paused ? (
                <button onClick={onResume} disabled={!gs.can_resume} className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                  <Play size={13} /> Resume room
                </button>
              ) : (
                <button onClick={onPause} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20">
                  <Pause size={13} /> Pause room
                </button>
              )}
              <button onClick={stop} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-2.5 text-xs font-semibold text-red-300/80 transition hover:bg-red-500/15">
                <Square size={12} /> Stop session
              </button>
            </div>
          )}
        </aside>

        <section className="order-1 space-y-5 lg:order-2">
          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-300">{error}</div>}

          {gs?.paused && (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
              <Pause className="mx-auto text-amber-300" size={24} />
              <h2 className="mt-3 text-lg font-semibold text-amber-100">The room is paused</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-amber-100/60">Nothing needs to be said or decided. The person who paused or the host can resume when the room is ready.</p>
            </div>
          )}

          {!gs?.paused && isFinished ? (
            phase === 'STOPPED' ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <Shield className="mx-auto text-purple-300" size={26} />
                <h2 className="mt-4 text-xl font-semibold">The room is closed</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-neutral-400">No Release or summary is required. You can leave exactly where you stopped.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {gs?.individual_map && <MapCard title={`${username}'s private map`} map={gs.individual_map} />}
                {gs?.shared_map && <MapCard title="The shared map" map={gs.shared_map} />}
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-6 text-neutral-500">
                  <Shield size={15} className="mt-0.5 shrink-0 text-purple-400" />
                  These maps are not stored automatically. Copy or download anything you want to keep before leaving.
                </div>
              </div>
            )
          ) : !gs?.paused ? (
            <>
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.025] p-8 text-center backdrop-blur-sm md:p-12">
                <motion.div
                  animate={{ scale: isHostTyping ? [1, 1.08, 1] : [1, 1.03, 1] }}
                  transition={{ duration: isHostTyping ? 1.4 : 3.5, repeat: Infinity }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 shadow-2xl shadow-purple-500/20"
                >
                  <Compass size={25} />
                </motion.div>
                <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em] text-purple-400">
                  {isHostTyping ? 'Lumi is listening…' : gs?.last_lumi_move ? `Lumi · ${titleCase(gs.last_lumi_move, 'Witness')}` : 'Lumi · Witness'}
                </p>
                <h2 className="mx-auto mt-3 max-w-2xl text-lg font-medium leading-8 text-purple-100 md:text-xl">“{latestLumiMessage}”</h2>
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/[0.025] p-5 backdrop-blur-sm md:p-6">
                {(phase === 'OPENING' || phase === 'CONVERSATION') && (
                  isMyTurn ? (
                    <form onSubmit={submitAnswer} className="space-y-3">
                      <textarea
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        maxLength={4000}
                        rows={3}
                        autoFocus
                        placeholder="Say only what feels ready…"
                        className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-700 focus:border-purple-500/50"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button type="button" onClick={onPass} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-neutral-400 transition hover:bg-white/10 hover:text-white">
                          <Hand size={13} /> Pass without explanation
                        </button>
                        <button type="submit" disabled={!answer.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/15 transition hover:from-purple-500 hover:to-indigo-500 disabled:pointer-events-none disabled:opacity-40">
                          <Send size={13} /> Put it into the room
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-xs leading-6 text-neutral-500">Holding the room for <span className="font-semibold text-purple-300">{activePlayer}</span>. You never need to prepare an answer.</p>
                  )
                )}

                {phase === 'DEPTH_CHECK' && (
                  gs?.my_depth_choice ? (
                    <div className="text-center">
                      <Check className="mx-auto text-green-400" size={20} />
                      <p className="mt-2 text-sm font-semibold text-neutral-300">Your choice is held privately.</p>
                      <p className="mt-1 text-xs text-neutral-600">{gs.depth_vote_count || 0} of {session.players.length} responses received.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4 text-center text-sm text-neutral-300">Choose what the room can hold next. Individual choices are not shown.</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <button onClick={() => onDepthChoice('stay')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs font-semibold text-neutral-300 transition hover:border-purple-500/30 hover:bg-purple-500/10">Stay here</button>
                        {depth !== 'bedrock' && <button onClick={() => onDepthChoice('deeper')} className="rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-4 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/20">One layer deeper</button>}
                        <button onClick={() => onDepthChoice('release')} className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 px-4 py-4 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20">Begin Release</button>
                      </div>
                    </div>
                  )
                )}

                {phase === 'RELEASE' && (
                  gs?.my_release_submitted ? (
                    <div className="py-3 text-center">
                      <Shield className="mx-auto text-purple-400" size={21} />
                      <p className="mt-3 text-sm font-semibold text-purple-100">Your Release is held privately.</p>
                      <p className="mt-1 text-xs text-neutral-600">Waiting quietly for the rest of the room.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitRelease} className="space-y-4">
                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Choose one beginning</label>
                        <select value={starter} onChange={(event) => setStarter(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111119] px-4 py-3 text-sm text-purple-100 outline-none focus:border-purple-500/50">
                          {RELEASE_STARTERS.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </div>
                      <textarea value={releaseText} onChange={(event) => setReleaseText(event.target.value)} maxLength={2000} rows={4} placeholder="Complete the sentence…" className="w-full resize-none rounded-2xl border border-purple-500/20 bg-black/40 px-5 py-4 text-sm leading-6 outline-none placeholder:text-neutral-700 focus:border-purple-500/50" />
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <input type="checkbox" checked={share} onChange={(event) => setShare(event.target.checked)} className="mt-0.5 accent-purple-500" />
                        <span className="text-xs leading-5 text-neutral-500">Share my completed sentence with the room. Leave unchecked to keep it between me and Lumi.</span>
                      </label>
                      <button type="submit" disabled={!releaseText.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3.5 text-xs font-bold text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:pointer-events-none disabled:opacity-40">
                        <Shield size={13} /> Complete my Release privately
                      </button>
                    </form>
                  )
                )}
              </div>
            </>
          ) : null}

          <div className="max-h-64 overflow-y-auto rounded-3xl border border-white/5 bg-black/20 p-5">
            <p className="mb-4 text-[9px] font-bold uppercase tracking-widest text-neutral-600">What has been shared</p>
            <div className="space-y-3">
              {session.messages.map((message, index) => (
                <div key={`${message.sender}-${index}`} className={`rounded-2xl px-4 py-3 text-xs leading-6 ${message.sender === 'Lumi' ? 'mr-8 border border-purple-500/10 bg-purple-950/15 text-purple-200/80' : message.role === 'system' ? 'mx-8 border border-white/5 bg-white/[0.02] text-center text-neutral-600' : 'ml-8 bg-white/5 text-neutral-400'}`}>
                  <span className="mb-1 block text-[8px] font-bold uppercase tracking-widest text-neutral-600">{message.sender}</span>
                  {message.content}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
