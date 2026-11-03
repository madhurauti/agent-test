import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(()=>({read:vi.fn(),write:vi.fn(),alert:vi.fn()}));
vi.mock('react-native',()=>({ActivityIndicator:'ActivityIndicator',SafeAreaView:'SafeAreaView',ScrollView:'ScrollView',Text:'Text',TextInput:'TextInput',View:'View',Pressable:'Pressable',Alert:{alert:mocks.alert},StyleSheet:{create:(s:unknown)=>s}}));
vi.mock('expo-status-bar',()=>({StatusBar:()=>null}));
vi.mock('expo-crypto',()=>({randomUUID:()=> 'stable-test-id'}));
vi.mock('../apps/mobile/storage',()=>({openDatabase:async()=>({}),readEntries:mocks.read,writeEntries:mocks.write}));
import App from '../apps/mobile/App';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
let tree: TestRenderer.ReactTestRenderer;
async function press(label:string){
 const button=tree.root.findAllByType('Pressable' as any).find(n=>n.findAllByType('Text' as any).some(t=>t.props.children===label));
 expect(button,`button ${label}`).toBeDefined();await act(async()=>{button!.props.onPress();});
}
async function type(label:string,value:string){await act(async()=>tree.root.findByProps({accessibilityLabel:label}).props.onChangeText(value));}
beforeEach(()=>{vi.clearAllMocks();mocks.read.mockResolvedValue([]);mocks.write.mockResolvedValue(undefined);});
it('captures an idea, searches it, and undo removes it',async()=>{
 await act(async()=>{tree=TestRenderer.create(<App/>);});
 await press('Capture an idea');await type('Capture text','Explore food planning');await press('Save capture');
 expect(mocks.write).toHaveBeenCalledWith(expect.anything(),[expect.objectContaining({kind:'idea',text:'Explore food planning'})]);
 await press('Search');await type('Search captures','FOOD');expect(JSON.stringify(tree.toJSON())).toContain('Explore food planning');
 await press('Undo last change');expect(mocks.write).toHaveBeenLastCalledWith(expect.anything(),[]);
 await act(async()=>tree.unmount());
});
it('logs a run and shows dashboard progress',async()=>{
 await act(async()=>{tree=TestRenderer.create(<App/>);});
 await press('Log a run today');await press('Save capture');await press('Dashboard');
 expect(mocks.write.mock.calls[0][1][0].kind).toBe('run');
 expect(JSON.stringify(tree.toJSON())).toContain('runs this week');
 expect(mocks.write.mock.calls[0][1]).toHaveLength(1);
 await act(async()=>tree.unmount());
});
it('retains input after failed save and allows retry',async()=>{
 await act(async()=>{tree=TestRenderer.create(<App/>);});
 await press('Capture an idea');await type('Capture text','Keep this idea');mocks.write.mockRejectedValueOnce(new Error('disk full'));
 await press('Save capture');expect(tree.root.findByProps({accessibilityLabel:'Capture text'}).props.value).toBe('Keep this idea');
 expect(JSON.stringify(tree.toJSON())).toContain('Could not save');await press('Save capture');expect(mocks.write).toHaveBeenCalledTimes(2);
 await act(async()=>tree.unmount());
});
it('does not overwrite unreadable storage',async()=>{
 mocks.read.mockRejectedValue(new Error('corruption'));await act(async()=>{tree=TestRenderer.create(<App/>);});
 expect(JSON.stringify(tree.toJSON())).toContain('Nothing has been overwritten');expect(mocks.write).not.toHaveBeenCalled();
 await act(async()=>tree.unmount());
});
it('rejects blank capture before persistence',async()=>{
 await act(async()=>{tree=TestRenderer.create(<App/>);});await press('Capture an idea');await press('Save capture');expect(mocks.write).not.toHaveBeenCalled();
 await act(async()=>tree.unmount());
});
it('edits an existing record without duplicating it',async()=>{
 mocks.read.mockResolvedValue([{id:'existing',kind:'idea',text:'Old idea',date:'2026-11-02',timezone:'America/Los_Angeles',createdAt:'2026-11-02T20:00:00.000Z',done:false}]);
 await act(async()=>{tree=TestRenderer.create(<App/>);});await press('Edit');await type('Capture text','Better idea');await press('Save capture');
 expect(mocks.write).toHaveBeenLastCalledWith(expect.anything(),[expect.objectContaining({id:'existing',text:'Better idea'})]);
 await act(async()=>tree.unmount());
});
it('ignores double save taps while the database write is pending',async()=>{
 await act(async()=>{tree=TestRenderer.create(<App/>);});await press('Capture an idea');await type('Capture text','Only once');
 let finish!:()=>void;mocks.write.mockImplementationOnce(()=>new Promise<void>(resolve=>{finish=resolve;}));
 const save=tree.root.findAllByType('Pressable' as any).find(n=>n.findAllByType('Text' as any).some(t=>t.props.children==='Save capture'))!;
 await act(async()=>{save.props.onPress();save.props.onPress();});expect(mocks.write).toHaveBeenCalledTimes(1);
 await act(async()=>{finish();});await act(async()=>tree.unmount());
});
