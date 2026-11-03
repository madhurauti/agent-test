import * as SQLite from 'expo-sqlite';
import { Entry, SnapshotSchema } from '@pocket/domain';

export interface Database {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
  runAsync(sql: string, ...params: any[]): Promise<unknown>;
}
export async function readEntries(db: Database): Promise<Entry[]> {
  await db.execAsync('CREATE TABLE IF NOT EXISTS pocket_state (id INTEGER PRIMARY KEY CHECK (id = 1), body TEXT NOT NULL)');
  const row = await db.getFirstAsync<{ body: string }>('SELECT body FROM pocket_state WHERE id = 1');
  return row ? SnapshotSchema.parse(JSON.parse(row.body)).entries : [];
}
export async function writeEntries(db: Database, entries: Entry[]): Promise<void> {
  const body = JSON.stringify(SnapshotSchema.parse({ version: 1, entries }));
  await db.runAsync('INSERT INTO pocket_state (id, body) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET body = excluded.body', body);
}
export const openDatabase = () => SQLite.openDatabaseAsync('pocket-memory.db');
