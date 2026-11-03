import { afterEach, describe, expect, it, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
vi.mock('expo-sqlite', () => ({ openDatabaseAsync: vi.fn() }));
import { readEntries, writeEntries, type Database } from '../apps/mobile/storage';
import { createEntry } from '../packages/domain';
function adapter(raw: DatabaseSync): Database {
 return {execAsync:async sql=>{raw.exec(sql);},getFirstAsync:async <T>(sql:string)=>(raw.prepare(sql).get() as T)??null,runAsync:async (sql,...params)=>raw.prepare(sql).run(...params)};
}
const dirs: string[]=[];
afterEach(()=>{dirs.splice(0).forEach(p=>rmSync(p,{recursive:true,force:true}));});
describe('real SQLite persistence',()=>{
 it('survives closing and reopening and safely stores SQL-like text',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'pocket-'));dirs.push(dir);const path=join(dir,'data.db');
  let raw=new DatabaseSync(path);let db=adapter(raw);
  expect(await readEntries(db)).toEqual([]);
  const entry=createEntry('a',"Explore food'); DROP TABLE pocket_state; --",'idea','2026-11-02','America/Los_Angeles',new Date('2026-11-02T20:00:00Z'));
  await writeEntries(db,[entry]);raw.close();
  raw=new DatabaseSync(path);db=adapter(raw);expect(await readEntries(db)).toEqual([entry]);
  await writeEntries(db,[]);expect(await readEntries(db)).toEqual([]);raw.close();
 });
 it('refuses invalid writes without overwriting and surfaces corrupt data',async()=>{
  const raw=new DatabaseSync(':memory:');const db=adapter(raw);await readEntries(db);
  await writeEntries(db,[]);
  await expect(writeEntries(db,[{id:'bad'} as any])).rejects.toThrow();expect(await readEntries(db)).toEqual([]);
  raw.exec("UPDATE pocket_state SET body = 'not json'");await expect(readEntries(db)).rejects.toThrow();raw.close();
 });
 it('propagates disk failure instead of claiming a save',async()=>{
  const db: Database={execAsync:async()=>{},getFirstAsync:async()=>null,runAsync:async()=>{throw new Error('disk full');}};
  await expect(writeEntries(db,[])).rejects.toThrow('disk full');
 });
});
