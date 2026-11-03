import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Crypto from 'expo-crypto';
import { createEntry, Entry, Kind, localDate, search, suggestKind, upsert, weeklyRuns } from '@pocket/domain';
import { Database, openDatabase, readEntries, writeEntries } from './storage';

type Screen = 'Today' | 'Capture' | 'Search' | 'Dashboard';
export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [screen, setScreen] = useState<Screen>('Today');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [kind, setKind] = useState<Kind>('idea');
  const [editing, setEditing] = useState<Entry | null>(null);
  const timezone = useRef(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles').current;
  const [day, setDay] = useState(localDate(new Date(), timezone));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Kind | undefined>();
  const [undo, setUndo] = useState<Entry[] | null>(null);
  const db = useRef<Database | null>(null);
  const lock = useRef(false);
  async function load() {
    setError('');
    try { const opened = await openDatabase(); db.current = opened; setEntries(await readEntries(opened)); setReady(true); }
    catch { setError('Your saved data could not be opened. Nothing has been overwritten. Retry opening the app.'); }
  }
  useEffect(() => { void load(); }, []);
  async function persist(next: Entry[], allowUndo = true) {
    if (lock.current || !db.current || !ready) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      await writeEntries(db.current, next);
      if (allowUndo) setUndo(entries);
      setEntries(next); return true;
    } catch { setError('Could not save. Your previous data and current input are still here. Please retry.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  async function capture() {
    try {
      const entry = createEntry(editing?.id ?? Crypto.randomUUID(), text, kind, day, editing?.timezone ?? timezone);
      if (editing) { entry.createdAt = editing.createdAt; entry.done = editing.done; }
      if (await persist(upsert(entries, entry))) { setText(''); setEditing(null); setScreen('Today'); }
    } catch (e) { setError(e instanceof Error && e.message.includes('future') ? e.message : 'Enter 1–2,000 characters and a valid date (YYYY-MM-DD).'); }
  }
  const now = new Date();
  const runs = weeklyRuns(entries, now, timezone);
  const button = (label: string, action: () => void, selected = false) => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected, disabled: busy }} disabled={busy} onPress={action} style={[styles.button, selected && styles.selected]}><Text style={selected ? styles.selectedText : styles.buttonText}>{label}</Text></Pressable>;
  const cards = (items: Entry[]) => items.length ? items.map(e => <View key={e.id} style={styles.card}>
    <Text style={styles.label}>{e.kind.toUpperCase()} · {e.date}{e.done ? ' · COMPLETE' : ''}</Text>
    <Text style={styles.body}>{e.text}</Text>
    <View style={styles.row}>
      {button('Edit', () => { setEditing(e); setText(e.text); setKind(e.kind); setDay(e.date); setScreen('Capture'); })}
      {e.kind === 'task' && button(e.done ? 'Reopen' : 'Complete', () => void persist(entries.map(x => x.id === e.id ? { ...x, done: !x.done } : x)))}
      {button('Delete', () => Alert.alert('Delete this entry?', 'You can undo after deleting.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void persist(entries.filter(x => x.id !== e.id)) }]))}
    </View>
  </View>) : <Text style={styles.muted}>Nothing here yet. Capture a thought to get started.</Text>;
  return <SafeAreaView style={styles.root}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.brand}>POCKET MEMORY</Text><Text style={styles.title}>{screen === 'Today' ? 'Room for your thoughts.' : screen}</Text>
    <Text style={styles.muted}>Saved on this iPhone · Local-only · No reminders yet</Text>
    <View style={styles.row}>{(['Today', 'Capture', 'Search', 'Dashboard'] as Screen[]).map(s => button(s, () => { setScreen(s); setError(''); if (s === 'Capture') { setEditing(null); setText(''); setKind('idea'); setDay(localDate(new Date(), timezone)); } }, screen === s))}</View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!ready ? <View><ActivityIndicator />{button('Retry loading', () => void load())}</View> : <>
      {undo && button('Undo last change', () => { void persist(undo, false).then(ok => { if (ok) setUndo(null); }); })}
      {screen === 'Capture' && <View style={styles.card}>
        <Text style={styles.heading}>What would you like to remember?</Text>
        <TextInput accessibilityLabel="Capture text" value={text} onChangeText={v => { setText(v); setKind(suggestKind(v)); }} multiline maxLength={2000} placeholder="An idea, something to do, or did a run today…" style={[styles.input, { minHeight: 110 }]} />
        <Text style={styles.muted}>Choose the type before saving. No dates or reminders are inferred.</Text>
        <View style={styles.row}>{(['idea', 'task', 'run'] as Kind[]).map(k => button(k, () => setKind(k), kind === k))}</View>
        <Text style={styles.label}>{kind === 'run' ? 'Activity date' : 'Capture date'} · {timezone}</Text>
        <TextInput accessibilityLabel="Entry date" value={day} onChangeText={setDay} placeholder="YYYY-MM-DD" autoCapitalize="none" style={styles.input} />
        {button(busy ? 'Saving…' : 'Save capture', () => void capture(), true)}
      </View>}
      {screen === 'Today' && <>
        <View style={styles.card}><Text style={styles.heading}>{runs.length} / 1 runs logged this week</Text><Text style={styles.muted}>{runs.length ? 'Weekly goal reached. Every extra run counts too.' : 'One run a week. Start whenever you are ready.'}</Text>
          {button('Log a run today', () => { setEditing(null); setText('Did a run today'); setKind('run'); setDay(localDate(new Date(), timezone)); setScreen('Capture'); })}
          {button('Capture an idea', () => { setEditing(null); setText(''); setKind('idea'); setDay(localDate(new Date(), timezone)); setScreen('Capture'); })}</View>
        <Text style={styles.heading}>Pending tasks</Text>{cards(entries.filter(e => e.kind === 'task' && !e.done))}
        <Text style={styles.heading}>Recent captures</Text>{cards(entries.slice(0, 8))}
      </>}
      {screen === 'Search' && <><TextInput accessibilityLabel="Search captures" placeholder="Search words or YYYY-MM-DD" value={query} onChangeText={setQuery} style={styles.input} /><View style={styles.row}>{button('All', () => setFilter(undefined), !filter)}{(['idea', 'task', 'run'] as Kind[]).map(k => button(k, () => setFilter(k), filter === k))}</View><Text style={styles.muted}>{search(entries, query, filter).length} results · keyword search</Text>{cards(search(entries, query, filter))}</>}
      {screen === 'Dashboard' && <><View style={styles.card}><Text style={styles.heading}>Your memory, at a glance</Text><Text style={styles.body}>{entries.filter(e => e.kind === 'idea').length} ideas saved</Text><Text style={styles.body}>{entries.filter(e => e.kind === 'task' && !e.done).length} tasks pending</Text><Text style={styles.body}>{runs.length} runs this week · target 1</Text><Text style={styles.body}>{entries.filter(e => e.kind === 'run').length} runs logged overall</Text><Text style={styles.muted}>Weeks start Monday in {timezone}. Unlogged activities are not assumed missed.</Text></View><Text style={styles.heading}>This week's runs</Text>{cards(runs)}<Text style={styles.heading}>Idea collection</Text>{cards(entries.filter(e => e.kind === 'idea'))}</>}
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f3ec' }, container: { padding: 22, gap: 16, paddingBottom: 60 },
  brand: { color: '#316459', fontWeight: '800', letterSpacing: 3, fontSize: 12 }, title: { fontSize: 32, color: '#183b34', fontWeight: '700' },
  heading: { fontSize: 20, color: '#183b34', fontWeight: '700' }, body: { fontSize: 17, color: '#253d36', lineHeight: 25 },
  muted: { color: '#596960', fontSize: 14, lineHeight: 21 }, label: { color: '#596960', fontSize: 12, fontWeight: '600' },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#e0e5dc' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, button: { borderRadius: 12, paddingHorizontal: 15, minHeight: 46, justifyContent: 'center', backgroundColor: '#e4eae0' },
  selected: { backgroundColor: '#245c4f' }, selectedText: { color: 'white', fontWeight: '600' }, buttonText: { color: '#234c40', fontWeight: '600' },
  input: { backgroundColor: '#fafbf7', padding: 14, borderWidth: 1, borderColor: '#aab9ac', borderRadius: 12, fontSize: 17, color: '#253d36' }, error: { color: '#a52424', padding: 12, backgroundColor: '#ffe9e4', borderRadius: 10 },
});
