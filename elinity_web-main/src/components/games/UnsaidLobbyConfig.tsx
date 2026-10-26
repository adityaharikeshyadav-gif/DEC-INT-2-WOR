import { Compass, Users } from 'lucide-react';
import type { UnsaidMode, UnsaidTerrain } from '../../lib/gamesApi';

const MODES: Array<{ value: UnsaidMode; label: string; players: string; description: string }> = [
  { value: 'solo', label: 'The Release', players: '1 player', description: 'A private space with Lumi as witness.' },
  { value: 'face_to_face', label: 'Face to Face', players: '2 players', description: 'A careful exchange between two people.' },
  { value: 'group', label: 'The Room', players: '3–6 players', description: 'A shared room for truth and witness.' },
];

const TERRAINS: Array<{ value: UnsaidTerrain; label: string }> = [
  { value: 'appreciation', label: 'Appreciation' },
  { value: 'regret', label: 'Regret' },
  { value: 'apology', label: 'Apology' },
  { value: 'admission', label: 'Admission' },
  { value: 'hard_thing', label: 'The Hard Thing' },
  { value: 'wander', label: 'Wander' },
];

interface UnsaidLobbyConfigProps {
  mode: UnsaidMode;
  terrain: UnsaidTerrain;
  isHost: boolean;
  onChange: (config: Record<string, string>) => void;
}

export function UnsaidLobbyConfig({ mode, terrain, isHost, onChange }: UnsaidLobbyConfigProps) {
  const selectedMode = MODES.find((item) => item.value === mode) ?? MODES[0];
  const selectedTerrain = TERRAINS.find((item) => item.value === terrain) ?? TERRAINS[4];

  if (!isHost) {
    return (
      <div className="border-t border-white/10 pt-6 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Session shape</p>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
          <p className="text-sm font-semibold text-purple-100">{selectedMode.label}</p>
          <p className="mt-1 text-xs text-neutral-400">{selectedTerrain.label} · {selectedMode.players}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Users size={13} className="text-purple-400" /> Choose the room
        </p>
        <div className="space-y-2">
          {MODES.map((item) => {
            const selected = mode === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange({ mode: item.value })}
                aria-pressed={selected}
                className={`w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                  selected
                    ? 'border-purple-500/40 bg-purple-500/15 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className={selected ? 'text-sm font-semibold text-purple-100' : 'text-sm font-semibold text-neutral-300'}>
                    {item.label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{item.players}</span>
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-neutral-500">{item.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Compass size={13} className="text-purple-400" /> Choose the terrain
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TERRAINS.map((item) => {
            const selected = terrain === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange({ terrain: item.value })}
                aria-pressed={selected}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                  selected
                    ? 'border-purple-500 bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
