import { describe, expect, it } from 'vitest';
import { createEntry, localDate, search, SnapshotSchema, suggestKind, upsert, weeklyRuns } from '../packages/domain';
const zone = 'America/Los_Angeles';
const now = new Date('2026-11-02T20:00:00Z');
const make = (id: string, text = 'Did a run today', kind: 'run' | 'idea' | 'task' = 'run', date = '2026-11-02') => createEntry(id, text, kind, date, zone, now);
describe('capture validation', () => {
 it('rejects blank, oversized, impossible dates and future runs', () => {
  expect(() => make('a', '   ')).toThrow();
  expect(() => make('a', 'a'.repeat(2001))).toThrow();
  expect(() => make('a', 'run', 'run', '2026-02-30')).toThrow();
  expect(() => make('a', 'run', 'run', '2026-11-03')).toThrow('future');
 });
 it('preserves ideas without inventing commitments', () => {
  expect(suggestKind('Explore running apps')).toBe('idea');
  expect(suggestKind('I did not run today')).toBe('idea');
  expect(suggestKind('Did a run today')).toBe('run');
  expect(suggestKind('Did a run today and buy milk')).toBe('idea');
 });
 it('makes retries idempotent without merging distinct runs', () => {
  const a = make('a'); expect(upsert([a], a)).toHaveLength(1);
  expect(upsert([a], make('b'))).toHaveLength(2);
 });
 it('rejects corrupt saved data and unsupported versions', () => {
  expect(SnapshotSchema.safeParse({version:2,entries:[]}).success).toBe(false);
  expect(SnapshotSchema.safeParse({version:1,entries:[{text:'bad'}]}).success).toBe(false);
 });
});
describe('week attribution and search', () => {
 it('uses Monday boundaries in saved local dates across DST', () => {
  const items = [make('sun', 'run', 'run', '2026-11-01'), make('mon')];
  expect(weeklyRuns(items, now, zone).map(e => e.id)).toEqual(['mon']);
  expect(weeklyRuns(items, new Date('2026-11-02T07:30:00Z'), zone).map(e => e.id)).toEqual(['sun']);
 });
 it('converts instants to the correct local date', () => {
  expect(localDate(new Date('2026-11-02T07:30:00Z'), zone)).toBe('2026-11-01');
 });
 it('matches all words case insensitively and filters type', () => {
  const items = [make('a','Explore food planning','idea'), make('b')];
  expect(search(items,'FOOD explore','idea').map(e=>e.id)).toEqual(['a']);
  expect(search(items,'food','run')).toEqual([]);
  expect(search(items,'2026-11-02')).toHaveLength(2);
 });
 it('removing a log updates progress', () => {
  const items = [make('a')];
  expect(weeklyRuns(items,now,zone)).toHaveLength(1);
  expect(weeklyRuns(items.filter(e=>e.id!=='a'),now,zone)).toHaveLength(0);
 });
});
