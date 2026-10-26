import { Brain, Layers, Timer } from 'lucide-react';
import type { GameOfGamesMode, GameOfGamesPack } from '../../lib/gamesApi';

const PACKS: Array<{ key: GameOfGamesPack; label: string; description: string }> = [
  { key: 'foundations', label: 'Foundations', description: 'Trust, coordination, brinkmanship' },
  { key: 'commons_bargains', label: 'Commons & Bargains', description: 'Resources, fairness, generosity' },
  { key: 'deep_strategy', label: 'Deep Strategy', description: 'Sequences, sacrifice, repeated play' },
  { key: 'paradoxes', label: 'Paradoxes', description: 'Prediction, pirates, focal points' },
  { key: 'mixed', label: 'Mixed Canon', description: 'A balanced 3-scenario set' },
];

interface Props {
  mode: GameOfGamesMode;
  scenarioPack: GameOfGamesPack;
  scenarioCount: number;
  isHost: boolean;
  onChange: (config: Record<string, string>) => void;
}

export function GameOfGamesLobbyConfig({ mode, scenarioPack, scenarioCount, isHost, onChange }: Props) {
  if (!isHost) {
    const pack = PACKS.find((item) => item.key === scenarioPack) || PACKS[0];
    return (
      <div className="border-t border-white/10 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Strategic format</p>
        <div className="mt-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          {mode === 'academy' ? 'Academy' : 'Discovery'} · {pack.label} · {scenarioCount} scenarios
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Brain size={13} className="text-cyan-400" /> Mode
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['discovery', 'Discovery'],
            ['academy', 'Academy'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ mode: value })}
              className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
                mode === value
                  ? 'border-cyan-500 bg-cyan-600 text-white'
                  : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Layers size={13} className="text-cyan-400" /> Scenario Pack
        </p>
        <div className="space-y-2">
          {PACKS.map((pack) => (
            <button
              key={pack.key}
              type="button"
              onClick={() => onChange({ scenario_pack: pack.key })}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                scenarioPack === pack.key
                  ? 'border-cyan-500/70 bg-cyan-600/20 text-white'
                  : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'
              }`}
            >
              <span className="block text-xs font-bold">{pack.label}</span>
              <span className="mt-1 block text-[10px] text-neutral-500">{pack.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Timer size={13} className="text-cyan-400" /> Session Length
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[3, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ scenario_count: String(value) })}
              className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
                scenarioCount === value
                  ? 'border-cyan-500 bg-cyan-600 text-white'
                  : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'
              }`}
            >
              {value} scenarios
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
