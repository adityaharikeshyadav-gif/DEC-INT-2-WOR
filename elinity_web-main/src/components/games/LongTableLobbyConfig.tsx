import { useState } from 'react';
import { Download, History, Plus, Trash2, UsersRound } from 'lucide-react';
import type { LongTableAgeSelf, LongTableMode } from '../../lib/gamesApi';
import { clearLongTableHistory, downloadLongTableHistory, loadLongTableHistory } from '../../lib/longTableHistory';

const MODE_COPY: Record<LongTableMode, { label: string; description: string }> = {
  letter: { label: 'The Letter', description: 'Write to one or two versions of yourself.' },
  conversation: { label: 'The Conversation', description: 'Speak with one carefully constructed age-self.' },
  council: { label: 'The Council', description: 'Seat two to six versions of yourself together.' },
};

const DEFAULT_AGES: Record<LongTableMode, number[]> = {
  letter: [16],
  conversation: [80],
  council: [14, 55, 80],
};

const ANCHOR_MARKERS = [
  ['child', 'Child'], ['young_one', 'Young One'], ['striver', 'Striver'],
  ['maker', 'Maker'], ['elder', 'Elder'], ['ancient', 'Ancient'],
] as const;

interface Props {
  username: string;
  mode: LongTableMode;
  selectedAges: LongTableAgeSelf[];
  isHost: boolean;
  onChange: (config: Record<string, unknown>) => void;
}

export function LongTableLobbyConfig({ username, mode, selectedAges, isHost, onChange }: Props) {
  const [history, setHistory] = useState(() => loadLongTableHistory(username));
  const visited = new Set(history.flatMap((entry) => entry.anchors));
  const limits = mode === 'letter' ? { min: 1, max: 2 } : mode === 'conversation' ? { min: 1, max: 1 } : { min: 2, max: 6 };

  const setMode = (nextMode: LongTableMode) => {
    onChange({ mode: nextMode, selected_ages: DEFAULT_AGES[nextMode] });
  };

  const setAge = (index: number, age: number) => {
    const next = selectedAges.map((item) => item.age);
    next[index] = Math.max(6, Math.min(90, age || 6));
    onChange({ selected_ages: next });
  };

  const addAge = () => {
    const used = new Set(selectedAges.map((item) => item.age));
    const candidate = [12, 16, 25, 40, 60, 80].find((age) => !used.has(age));
    if (candidate) onChange({ selected_ages: [...selectedAges.map((item) => item.age), candidate] });
  };

  const removeAge = (index: number) => {
    if (selectedAges.length <= limits.min) return;
    onChange({ selected_ages: selectedAges.filter((_, itemIndex) => itemIndex !== index).map((item) => item.age) });
  };

  if (!isHost) return null;

  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <UsersRound size={13} className="text-violet-400" /> Choose the table
        </p>
        <div className="space-y-2">
          {(Object.keys(MODE_COPY) as LongTableMode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`w-full rounded-2xl border p-4 text-left transition ${mode === value ? 'border-violet-500/50 bg-violet-500/15 shadow-lg shadow-violet-950/20' : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5'}`}
            >
              <span className={`text-sm font-bold ${mode === value ? 'text-violet-100' : 'text-neutral-300'}`}>{MODE_COPY[value].label}</span>
              <span className="mt-1 block text-xs leading-5 text-neutral-500">{MODE_COPY[value].description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Exact ages invited</p>
          <span className="text-[9px] text-neutral-600">ages 6–90</span>
        </div>
        <div className="space-y-2">
          {selectedAges.map((ageSelf, index) => (
            <div key={`${ageSelf.age}-${index}`} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2">
              <input
                type="number"
                min={6}
                max={90}
                value={ageSelf.age}
                onChange={(event) => setAge(index, Number(event.target.value))}
                className="w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50"
              />
              <span className="min-w-0 flex-1 truncate text-xs text-neutral-400">{ageSelf.label}</span>
              {selectedAges.length > limits.min && (
                <button type="button" onClick={() => removeAge(index)} className="rounded-lg p-2 text-neutral-600 hover:bg-red-500/10 hover:text-red-300" aria-label={`Remove age ${ageSelf.age}`}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {selectedAges.length < limits.max && (
          <button type="button" onClick={addAge} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-xs font-semibold text-neutral-500 hover:border-violet-500/30 hover:text-violet-300">
            <Plus size={13} /> Invite another age-self
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.06] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-300"><History size={13} /> Local Table Log</p>
            <p className="mt-1 text-xs text-neutral-500">{history.length} saved session{history.length === 1 ? '' : 's'} · {visited.size} of 6 voices met</p>
          </div>
          <div className="flex gap-1">
            <button type="button" disabled={!history.length} onClick={() => downloadLongTableHistory(history)} className="rounded-lg border border-white/10 p-2 text-neutral-400 hover:text-white disabled:opacity-30" aria-label="Export Table Log"><Download size={14} /></button>
            <button
              type="button"
              disabled={!history.length}
              onClick={() => {
                if (window.confirm('Clear every locally saved Long Table entry from this browser?')) {
                  clearLongTableHistory(username);
                  setHistory([]);
                }
              }}
              className="rounded-lg border border-white/10 p-2 text-neutral-400 hover:border-red-500/30 hover:text-red-300 disabled:opacity-30"
              aria-label="Clear Table Log"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {ANCHOR_MARKERS.map(([anchor, label]) => (
            <span key={anchor} className={`rounded-lg border px-2 py-1.5 text-center text-[8px] font-bold uppercase tracking-wider ${visited.has(anchor) ? 'border-violet-500/30 bg-violet-500/15 text-violet-200' : 'border-white/5 bg-black/20 text-neutral-700'}`}>{label}</span>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-4 text-neutral-600">History stays in this browser. Export it before clearing browser data or moving devices.</p>
      </div>
    </div>
  );
}
