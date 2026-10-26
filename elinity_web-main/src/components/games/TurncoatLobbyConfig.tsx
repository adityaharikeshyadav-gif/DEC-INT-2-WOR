import { Scale, Swords } from 'lucide-react';
import type { TurncoatMode } from '../../lib/gamesApi';

const TERRITORIES = [
  ['mixed', 'Mixed'], ['life_philosophy', 'Life Philosophy'], ['ethics_morality', 'Ethics & Morality'],
  ['thought_experiments', 'Thought Experiments'], ['personal_choices', 'Personal Choices'],
  ['society_world', 'Society & World'], ['wild_card', 'Wild Card'],
] as const;

interface Props {
  mode: TurncoatMode;
  rounds: number;
  territory: string;
  isHost: boolean;
  onChange: (config: Record<string, string>) => void;
}

export function TurncoatLobbyConfig({ mode, rounds, territory, isHost, onChange }: Props) {
  if (!isHost) {
    return (
      <div className="border-t border-white/10 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Debate format</p>
        <div className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          {mode === 'full_circle' ? 'Full Circle' : 'Classic'} · {rounds} rounds · {TERRITORIES.find(([key]) => key === territory)?.[1] || 'Mixed'}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400"><Swords size={13} className="text-rose-400" /> Mode</p>
        <div className="grid grid-cols-2 gap-2">
          {([['classic', 'Classic'], ['full_circle', 'Full Circle']] as const).map(([value, label]) => (
            <button key={value} onClick={() => onChange({ mode: value })} className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${mode === value ? 'border-rose-500 bg-rose-600 text-white' : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'}`}>{label}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Session length</p>
        <div className="grid grid-cols-2 gap-2">
          {[3, 5].map((value) => <button key={value} onClick={() => onChange({ total_rounds: String(value) })} className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${rounds === value ? 'border-rose-500 bg-rose-600 text-white' : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'}`}>{value} rounds</button>)}
        </div>
      </div>
      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400"><Scale size={13} className="text-rose-400" /> Territory</p>
        <select value={territory} onChange={(event) => onChange({ territory: event.target.value })} className="w-full rounded-xl border border-white/10 bg-[#111119] px-4 py-3 text-xs text-neutral-200 outline-none focus:border-rose-500/50">
          {TERRITORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
    </div>
  );
}
