import type { LongTableEntry, LongTableHistorySnapshot } from './gamesApi';

const STORAGE_KEY = 'elinity_long_table_history_v1';
const MAX_ENTRIES = 50;
const MAX_SERIALIZED_LENGTH = 3_500_000;

function isEntry(value: unknown): value is LongTableEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<LongTableEntry>;
  return typeof entry.entry_id === 'string'
    && typeof entry.compass === 'string'
    && typeof entry.summary === 'string'
    && Array.isArray(entry.ages)
    && Array.isArray(entry.anchors);
}

function storageKey(owner: string): string {
  return `${STORAGE_KEY}_${encodeURIComponent(owner.trim().toLowerCase() || 'anonymous')}`;
}

export function loadLongTableHistory(owner: string): LongTableEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(owner)) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isEntry).slice(-MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function saveLongTableEntry(owner: string, entry: LongTableEntry): boolean {
  try {
    const current = loadLongTableHistory(owner).filter((item) => item.entry_id !== entry.entry_id);
    const next = [...current, entry].slice(-MAX_ENTRIES);
    while (next.length > 1 && JSON.stringify(next).length > MAX_SERIALIZED_LENGTH) next.shift();
    localStorage.setItem(storageKey(owner), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function getLongTableHistorySnapshot(owner: string): LongTableHistorySnapshot[] {
  return loadLongTableHistory(owner).slice(-12).map((entry) => ({
    entry_id: entry.entry_id,
    completed_at: entry.completed_at,
    mode: entry.mode,
    ages: entry.ages,
    anchors: entry.anchors,
    compass: entry.compass,
    summary: entry.summary,
    shift: entry.shift,
    open_question: entry.open_question,
  }));
}

export function clearLongTableHistory(owner: string): boolean {
  try {
    localStorage.removeItem(storageKey(owner));
    return true;
  } catch {
    return false;
  }
}

export function downloadLongTableHistory(entries: LongTableEntry[]): void {
  const blob = new Blob([JSON.stringify({ version: 1, entries }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `elinity-long-table-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
