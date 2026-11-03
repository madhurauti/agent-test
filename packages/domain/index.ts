import { DateTime } from 'luxon';
import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => DateTime.fromISO(v).isValid, 'Use a valid date');
export const EntrySchema = z.object({
  id: z.string().min(1), kind: z.enum(['idea', 'task', 'run']),
  text: z.string().trim().min(1, 'Write something first').max(2000, 'Keep captures under 2,000 characters'),
  date, timezone: z.string().refine(v => DateTime.now().setZone(v).isValid, 'Invalid timezone'),
  createdAt: z.string().datetime(), done: z.boolean().default(false),
});
export type Entry = z.infer<typeof EntrySchema>;
export type Kind = Entry['kind'];
export const SnapshotSchema = z.object({ version: z.literal(1), entries: z.array(EntrySchema) });
export function localDate(now: Date, zone: string) {
  const value = DateTime.fromJSDate(now).setZone(zone);
  if (!value.isValid) throw new Error('Invalid timezone');
  return value.toISODate()!;
}
export function suggestKind(text: string): Kind {
  return /^(?:i )?(?:did a run|went (?:for a )?run|ran)(?: today)?[.!]?$/i.test(text.trim()) ? 'run' : 'idea';
}
export function createEntry(id: string, text: string, kind: Kind, day: string, timezone: string, now = new Date()): Entry {
  const entry = EntrySchema.parse({ id, text, kind, date: day, timezone, createdAt: now.toISOString(), done: false });
  if (kind === 'run' && day > localDate(now, timezone)) throw new Error('A completed run cannot be dated in the future');
  return entry;
}
export function upsert(entries: Entry[], entry: Entry): Entry[] {
  return [entry, ...entries.filter(e => e.id !== entry.id)];
}
export function weeklyRuns(entries: Entry[], now: Date, timezone: string): Entry[] {
  const today = DateTime.fromJSDate(now).setZone(timezone);
  const start = today.startOf('week').toISODate()!;
  const end = today.endOf('week').toISODate()!;
  return entries.filter(e => e.kind === 'run' && e.date >= start && e.date <= end);
}
export function search(entries: Entry[], query: string, kind?: Kind): Entry[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(e => (!kind || e.kind === kind) && words.every(w => `${e.text} ${e.kind} ${e.date}`.toLocaleLowerCase().includes(w)));
}
