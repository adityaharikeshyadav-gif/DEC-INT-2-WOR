import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Brain, Check, Eye, Lock, Send, Sparkles, Timer, Trophy, Users } from 'lucide-react';
import type { GameOfGamesDecisionProfile, GameSession } from '../../lib/gamesApi';
import { loadGameOfGamesProfile, saveGameOfGamesProfile, type StoredGameOfGamesProfile } from '../../lib/gameOfGamesProfile';
import { GameHelpButton } from './GameHelpButton';

interface Props {
  session: GameSession;
  username: string;
  isConnected: boolean;
  error: string | null;
  onBack: () => void;
  onChoose: (choice: string) => void;
  onNext: () => void;
}

const FORMAT_LABELS: Record<string, string> = {
  simultaneous_choice: 'Simultaneous',
  sequential_choice: 'Sequential',
  multi_round: 'Multi-round',
  negotiation: 'Negotiation',
  solo_decision: 'Solo decision',
};

const METRICS: Array<[keyof GameOfGamesDecisionProfile, string]> = [
  ['cooperation_tendency', 'Cooperation'],
  ['risk_tolerance', 'Risk'],
  ['reciprocity', 'Reciprocity'],
  ['strategic_sophistication', 'Strategy'],
  ['consistency', 'Consistency'],
];

function choiceLabel(session: GameSession, choiceKey: string): string {
  const choices = session.game_state?.current_scenario?.choices || [];
  return choices.find((choice) => choice.key === choiceKey)?.label || choiceKey.replace(/_/g, ' ');
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        <span>{label}</span>
        <span className="text-cyan-200">{pct}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-300" style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}

function ProfilePanel({ profile }: { profile?: GameOfGamesDecisionProfile | StoredGameOfGamesProfile | null }) {
  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-neutral-500">
        Decision Profile will appear after choices resolve.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-300">Archetype</p>
        <p className="mt-1 text-lg font-black text-white">{profile.archetype}</p>
        {profile.strategic_architect_unlocked && (
          <p className="mt-2 text-xs font-semibold text-amber-200">Strategic Architect unlocked</p>
        )}
      </div>
      {METRICS.map(([key, label]) => (
        <MetricBar key={key} label={label} value={Number(profile[key] || 0)} />
      ))}
    </div>
  );
}

export function GameOfGamesSession({ session, username, isConnected, error, onBack, onChoose, onNext }: Props) {
  const gs = session.game_state;
  const scenario = gs?.current_scenario;
  const payoff = gs?.payoff_result;
  const isHost = session.players[0]?.username === username;
  const myChoice = gs?.my_choice || null;
  const isRequired = Boolean(gs?.required_players?.includes(username));
  const canChoose = gs?.phase === 'CHOOSING' && isRequired && !myChoice;
  const [storedProfile, setStoredProfile] = useState<StoredGameOfGamesProfile | null>(() => loadGameOfGamesProfile(username));
  const savedSessionRef = useRef<string | null>(null);
  const activeProfile = gs?.decision_profile?.[username] || storedProfile;
  const latestLumi = useMemo(() => [...session.messages].reverse().find((message) => message.sender === 'Lumi')?.content || '', [session.messages]);
  const roundNumber = (gs?.round_tracker?.length || 0) + 1;
  const totalScenarios = gs?.scenario_order?.length || gs?.scenario_count || 3;

  useEffect(() => {
    if (session.status !== 'COMPLETED' || !gs?.decision_profile?.[username] || savedSessionRef.current === session.session_id) return;
    const saved = saveGameOfGamesProfile(username, gs.decision_profile[username], gs.scores?.[username] || 0);
    if (saved) setStoredProfile(saved);
    savedSessionRef.current = session.session_id;
  }, [gs?.decision_profile, gs?.scores, session.session_id, session.status, username]);

  return (
    <div className="min-h-screen bg-[#050708] px-4 pb-10 pt-3 text-white md:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.08),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.06),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,0.05),transparent_34%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-neutral-400 transition hover:text-white">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-black">The Game of Games</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-300">
              Scenario {(gs?.scenario_index || 0) + 1} of {totalScenarios} · {gs?.mode === 'academy' ? 'Academy' : 'Discovery'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GameHelpButton gameSlug={session.game_slug} compact accentClassName="border-cyan-500/20 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15" />
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-100">
            <Timer size={11} className="mr-1 inline" /> 3:00
          </span>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="order-2 space-y-5 lg:order-1">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <Trophy size={13} className="text-amber-300" /> Payoff Tally
            </p>
            <div className="mt-4 space-y-2">
              {[...session.players].sort((a, b) => (gs?.scores?.[b.username] || 0) - (gs?.scores?.[a.username] || 0)).map((player) => (
                <div key={player.username} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                  <span className="text-xs font-semibold text-neutral-300">{player.username}{player.username === username ? ' · you' : ''}</span>
                  <span className="text-xs font-black text-amber-200">{gs?.scores?.[player.username] || 0}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <ProfilePanel profile={activeProfile} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <Users size={13} className="text-cyan-300" /> Choice Status
            </p>
            <div className="mt-4 space-y-2">
              {session.players.map((player) => {
                const submitted = Boolean(gs?.submitted_players?.includes(player.username) || gs?.choices?.[player.username]);
                return (
                  <div key={player.username} className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-xs">
                    <span className="text-neutral-300">{player.username}</span>
                    <span className={`flex items-center gap-1 font-bold ${submitted ? 'text-green-300' : 'text-neutral-600'}`}>
                      {submitted ? <Check size={12} /> : <Lock size={12} />} {submitted ? 'Sealed' : 'Open'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="order-1 space-y-5 lg:order-2">
          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">{error}</div>}

          {scenario && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                    <Brain size={13} /> {FORMAT_LABELS[scenario.format] || scenario.format}
                    {scenario.format === 'multi_round' ? ` · Round ${roundNumber} of ${scenario.rounds || 5}` : ''}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">{scenario.name}</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                  {gs?.phase}
                </span>
              </div>

              <p className="mt-6 text-base leading-8 text-neutral-200">
                {gs?.mode === 'academy' ? scenario.academy_prompt : scenario.discovery_prompt}
              </p>
              {gs?.mode === 'academy' && (
                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-300">Equilibrium</p>
                  <p className="mt-2 text-sm leading-6 text-amber-50/85">{scenario.nash_equilibrium}</p>
                </div>
              )}
              {latestLumi && <p className="mt-5 text-sm leading-7 text-cyan-100/80">"{latestLumi}"</p>}
            </section>
          )}

          {gs?.phase === 'CHOOSING' && scenario && (
            <section className="rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
              {canChoose ? (
                <>
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                    {gs.current_decision_label || 'Choose your move'}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(gs.active_choices || scenario.choices).map((choice) => (
                      <button
                        key={choice.key}
                        type="button"
                        onClick={() => onChoose(choice.key)}
                        className="min-h-[116px] rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-500/10 active:scale-[0.99]"
                      >
                        <span className="block text-sm font-black text-white">{choice.label}</span>
                        <span className="mt-2 block text-xs leading-5 text-neutral-400">{choice.description}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div>
                    <p className="text-sm font-bold text-neutral-200">
                      {myChoice ? `Your move is sealed: ${choiceLabel(session, myChoice)}` : `Waiting for ${gs.required_players?.join(', ') || 'the room'}`}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">Simultaneous choices stay hidden until the reveal.</p>
                  </div>
                  <Lock className="text-cyan-300" size={18} />
                </div>
              )}
            </section>
          )}

          {(gs?.phase === 'REVEAL' || gs?.phase === 'COMPLETED') && payoff && (
            <section className="space-y-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    <Eye size={13} /> Payoff Reveal
                  </p>
                  <h2 className="mt-2 text-xl font-black text-white">{payoff.scenario}</h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${payoff.nash_observed ? 'bg-green-500/15 text-green-200' : 'bg-white/10 text-neutral-300'}`}>
                  {payoff.nash_observed ? 'Nash observed' : 'Theory tested'}
                </span>
              </div>
              <p className="text-sm leading-7 text-amber-50/90">{payoff.outcome}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(payoff.choices).map(([player, choice]) => (
                  <div key={player} className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{player}</p>
                    <p className="mt-1 text-sm font-bold text-white">{choiceLabel(session, choice)}</p>
                    <p className="mt-2 text-xs text-amber-200">Payoff {payoff.scores_delta[player] ?? 0}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Theory</p>
                <p className="mt-2 text-sm leading-7 text-neutral-200">{payoff.theory}</p>
                <p className="mt-3 text-sm leading-7 text-neutral-300">{payoff.optimal_alternative}</p>
              </div>
              {gs.phase === 'REVEAL' && (
                isHost ? (
                  <button onClick={onNext} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white">
                    <Send size={13} /> Next Scenario
                  </button>
                ) : (
                  <p className="text-center text-xs font-semibold text-neutral-500">Waiting for the host to advance.</p>
                )
              )}
            </section>
          )}

          {gs?.phase === 'COMPLETED' && (
            <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-8 text-center">
              <Sparkles className="mx-auto text-cyan-200" size={30} />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Session complete</p>
              <h2 className="mt-2 text-2xl font-black text-white">{activeProfile?.archetype || 'Profile recorded'}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-cyan-50/80">
                Your Decision Profile has been saved in this browser for future Game of Games sessions.
              </p>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
