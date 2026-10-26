import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Gavel, Send, Sparkles, Swords, Trophy, Users } from 'lucide-react';
import type { GameSession, TurncoatRoundResult, TurncoatSide } from '../../lib/gamesApi';
import { GameHelpButton } from './GameHelpButton';

interface Props {
  session: GameSession;
  username: string;
  isConnected: boolean;
  isHostTyping: boolean;
  error: string | null;
  onBack: () => void;
  onSetup: (position: string) => void;
  onStance: (side: TurncoatSide) => void;
  onArgument: (text: string) => void;
  onPeerScores: (scores: Record<string, Record<string, number>>) => void;
  onNext: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  SETUP: 'Strong positions', STANCE_CHECK: 'Private stance', OPENING: 'Opening statements',
  REBUTTAL: 'Rebuttals', CURVEBALL_RESPONSE: 'Curveball', CLOSING: 'Closing statements',
  FULL_CIRCLE_OPENING: 'Full Circle · Real position', FULL_CIRCLE_REBUTTAL: 'Full Circle · Rebuttal',
  PEER_SCORING: 'Peer scoring', REVEAL: 'Score reveal', COMPLETED: 'Final declaration',
};

function ScoreReveal({ result }: { result: TurncoatRoundResult }) {
  return (
    <div className="space-y-4">
      {Object.entries(result.scores).map(([player, score]) => (
        <article key={player} className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold text-white">{player}</h3><span className="text-lg font-black text-rose-300">{score.subtotal + score.bonus}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(score.final).map(([dimension, value]) => (
              <div key={dimension} className="rounded-xl border border-white/5 bg-white/[0.03] p-3"><p className="text-[8px] font-bold uppercase tracking-widest text-neutral-500">{dimension}</p><p className="mt-1 text-sm font-bold text-neutral-200">{value}</p><p className="text-[9px] text-neutral-600">Lumi {score.lumi[dimension]} · Peers {score.peer_average[dimension]}</p></div>
            ))}
          </div>
          {score.bonus > 0 && <p className="mt-3 text-xs font-bold text-amber-300">+5 Turncoat Bonus</p>}
          <details className="mt-4 text-xs text-neutral-500"><summary className="cursor-pointer font-semibold text-neutral-400">Attributed peer scorecards</summary><div className="mt-2 space-y-1">{Object.entries(result.peer_scorecards).filter(([scorer]) => scorer !== player).map(([scorer, cards]) => <p key={scorer}>{scorer}: {Object.entries(cards[player] || {}).map(([key, value]) => `${key} ${value}`).join(' · ')}</p>)}</div></details>
        </article>
      ))}
    </div>
  );
}

export function TurncoatSession({ session, username, isConnected, isHostTyping, error, onBack, onSetup, onStance, onArgument, onPeerScores, onNext }: Props) {
  const [text, setText] = useState('');
  const gs = session.game_state;
  const phase = gs?.phase || 'SETUP';
  const isHost = session.players[0]?.username === username;
  const isMyTurn = session.current_player_id === username;
  const dimensions = gs?.mode === 'full_circle' ? ['conviction', 'logic', 'originality', 'adaptability', 'delta'] : ['conviction', 'logic', 'originality', 'adaptability'];
  const opponents = session.players.filter((player) => player.username !== username);
  const [peerScores, setPeerScores] = useState<Record<string, Record<string, number>>>(() => Object.fromEntries(opponents.map((player) => [player.username, Object.fromEntries(dimensions.map((dimension) => [dimension, 5]))])));
  const latestLumi = useMemo(() => [...session.messages].reverse().find((message) => message.sender === 'Lumi')?.content || 'Take the other side.', [session.messages]);
  const lastResult = gs?.score_history?.[gs.score_history.length - 1];
  const hasSetup = Boolean(gs?.setup_positions?.[username]);

  const submitText = (event: FormEvent, action: (value: string) => void) => {
    event.preventDefault();
    if (!text.trim()) return;
    action(text.trim());
    setText('');
  };

  return (
    <div className="min-h-screen bg-[#080609] px-4 pb-10 pt-3 text-white md:px-6">
      <div className="pointer-events-none fixed inset-0"><div className="absolute left-[10%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-rose-600/[0.035] blur-[140px]" /><div className="absolute bottom-[5%] right-[8%] h-[28rem] w-[28rem] rounded-full bg-orange-500/[0.025] blur-[140px]" /></div>
      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/30 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3"><button onClick={onBack} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-neutral-400 hover:text-white"><ArrowLeft size={16} /></button><div><h1 className="text-sm font-black">Turncoat: The Other Side</h1><p className="text-[9px] font-bold uppercase tracking-widest text-rose-400">Round {gs?.round || 1} of {gs?.total_rounds || 3} · {gs?.mode === 'full_circle' ? 'Full Circle' : 'Classic'}</p></div></div>
        <div className="flex items-center gap-2"><GameHelpButton gameSlug={session.game_slug} compact accentClassName="border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15" /><span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-rose-200">{PHASE_LABELS[phase] || phase}</span><span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} /></div>
      </header>

      <main className="relative z-10 mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="order-2 rounded-3xl border border-white/5 bg-white/[0.025] p-5 lg:order-1">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><Users size={13} className="text-rose-400" /> Standings</p>
          <div className="mt-4 space-y-2">{[...session.players].sort((a, b) => (gs?.totals?.[b.username] || 0) - (gs?.totals?.[a.username] || 0)).map((player) => <div key={player.username} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${player.username === session.current_player_id ? 'border-rose-500/30 bg-rose-500/10' : 'border-white/5 bg-black/20'}`}><span className="text-xs font-semibold text-neutral-300">{player.username}{player.username === username ? ' · you' : ''}</span><span className="text-xs font-black text-rose-300">{gs?.totals?.[player.username] || 0}</span></div>)}</div>
          {gs?.assigned_positions?.[username] && phase !== 'STANCE_CHECK' && <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Your assigned side</p><p className="mt-1 text-lg font-black uppercase text-amber-100">{gs.assigned_positions[username]}</p></div>}
          {gs?.curveball && <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-rose-400">Curveball</p><p className="mt-2 text-xs leading-6 text-rose-100/80">{gs.curveball}</p></div>}
        </aside>

        <section className="order-1 space-y-5 lg:order-2">
          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">{error}</div>}
          {phase === 'COMPLETED' ? (
            <div className="space-y-6"><div className="rounded-3xl border border-amber-500/20 bg-white/[0.035] p-8 text-center shadow-2xl"><Trophy className="mx-auto text-amber-300" size={32} /><p className="mt-5 text-[10px] font-bold uppercase tracking-widest text-amber-400">Final declaration</p><h2 className="mt-2 text-2xl font-black">{gs?.final_declarations?.winners.join(' & ')} {gs?.final_declarations?.winners.length === 1 ? 'wins' : 'share the win'}</h2><div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/5 p-4"><p className="text-[9px] uppercase tracking-widest text-neutral-500">Turncoat Award</p><p className="mt-1 font-bold text-rose-200">{gs?.final_declarations?.turncoat_award}</p></div>{gs?.final_declarations?.most_changed_mind && <div className="rounded-2xl bg-white/5 p-4"><p className="text-[9px] uppercase tracking-widest text-neutral-500">Most Changed Mind</p><p className="mt-1 font-bold text-purple-200">{gs.final_declarations.most_changed_mind}</p></div>}</div></div>{gs?.score_history?.map((result) => <div key={result.round}><h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">Round {result.round} · {result.motion}</h3><ScoreReveal result={result} /></div>)}</div>
          ) : (
            <>
              <div className="rounded-3xl border border-white/5 bg-white/[0.025] p-8 text-center backdrop-blur-sm md:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/20 bg-gradient-to-tr from-rose-700 via-red-600 to-orange-500 shadow-2xl shadow-rose-950/30"><Gavel size={25} className={isHostTyping ? 'animate-pulse' : ''} /></div><p className="mt-5 text-[9px] font-bold uppercase tracking-[0.22em] text-rose-400">{isHostTyping ? 'Lumi is judging…' : PHASE_LABELS[phase]}</p><h2 className="mx-auto mt-3 max-w-2xl text-lg font-semibold leading-8 text-rose-50">“{latestLumi}”</h2>{gs?.motion && <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{gs.motion_territory}</p><p className="mt-1 text-sm font-bold text-white">{gs.motion}</p></div>}</div>
              <div className="rounded-3xl border border-white/5 bg-white/[0.025] p-6">
                {phase === 'SETUP' && (hasSetup ? <p className="text-center text-sm text-neutral-400"><Check className="mx-auto mb-2 text-green-400" size={20} />Position recorded. Waiting for the room.</p> : <form onSubmit={(event) => submitText(event, onSetup)} className="space-y-3"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={500} rows={3} placeholder="A position I strongly hold is…" className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm outline-none focus:border-rose-500/50" /><button disabled={!text.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-orange-600 py-3.5 text-xs font-bold disabled:opacity-40"><Send size={13} /> Lock my position</button></form>)}
                {phase === 'STANCE_CHECK' && (gs?.my_real_side ? <p className="text-center text-sm text-neutral-400"><Check className="mx-auto mb-2 text-green-400" size={20} />Your real side is sealed. {gs.stance_count} of {session.players.length} ready.</p> : <div><p className="mb-4 text-center text-sm text-neutral-300">What do you actually believe? This stays hidden until assignments are locked.</p><div className="grid grid-cols-2 gap-3"><button onClick={() => onStance('agree')} className="rounded-2xl border border-green-500/20 bg-green-500/10 py-4 text-sm font-black text-green-200 hover:bg-green-500/20">I agree</button><button onClick={() => onStance('disagree')} className="rounded-2xl border border-red-500/20 bg-red-500/10 py-4 text-sm font-black text-red-200 hover:bg-red-500/20">I disagree</button></div></div>)}
                {['OPENING', 'REBUTTAL', 'CURVEBALL_RESPONSE', 'CLOSING', 'FULL_CIRCLE_OPENING', 'FULL_CIRCLE_REBUTTAL'].includes(phase) && (isMyTurn ? <form onSubmit={(event) => submitText(event, onArgument)} className="space-y-3"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={6000} rows={5} placeholder="Make the strongest case you can…" className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm leading-6 outline-none focus:border-rose-500/50" /><button disabled={!text.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-orange-600 py-3.5 text-xs font-bold disabled:opacity-40"><Swords size={13} /> Submit argument</button></form> : <p className="text-center text-sm text-neutral-500">The floor belongs to <span className="font-bold text-rose-300">{session.current_player_id}</span>.</p>)}
                {phase === 'PEER_SCORING' && (gs?.my_peer_scores_submitted ? <p className="text-center text-sm text-neutral-400"><Check className="mx-auto mb-2 text-green-400" size={20} />Your scorecards are sealed until everyone submits.</p> : <div className="space-y-5"><p className="text-sm text-neutral-300">Score every opponent. These scorecards will be attributed at reveal.</p>{opponents.map((opponent) => <div key={opponent.username} className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="mb-3 font-bold text-white">{opponent.username}</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{dimensions.map((dimension) => <label key={dimension} className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{dimension}<input type="number" min={1} max={10} value={peerScores[opponent.username]?.[dimension] || 5} onChange={(event) => setPeerScores((current) => ({ ...current, [opponent.username]: { ...current[opponent.username], [dimension]: Number(event.target.value) } }))} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50" /></label>)}</div></div>)}<button onClick={() => onPeerScores(peerScores)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-orange-600 py-3.5 text-xs font-bold"><Sparkles size={13} /> Seal scorecards</button></div>)}
                {phase === 'REVEAL' && lastResult && <div className="space-y-5"><ScoreReveal result={lastResult} />{isHost ? <button onClick={onNext} className="w-full rounded-xl bg-gradient-to-r from-rose-700 to-orange-600 py-3.5 text-xs font-bold">{(gs?.round || 1) >= (gs?.total_rounds || 3) ? 'Final declaration' : 'Next round'}</button> : <p className="text-center text-xs text-neutral-500">Waiting for the host to advance.</p>}</div>}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
