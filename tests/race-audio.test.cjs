const test=require('node:test'),assert=require('node:assert/strict');
const {create}=require('../race-audio.js');

test('race sound stays silent until opted in and falls silent on pause',()=>{
 const made=[],ramps=[];
 class Node{constructor(){this.frequency={value:0,setTargetAtTime:(v)=>ramps.push(['frequency',v])};this.gain={value:0,setTargetAtTime:(v)=>ramps.push(['gain',v]),setValueAtTime(){},exponentialRampToValueAtTime(){}};}connect(){}start(){made.push('start');}stop(){}}
 class Context{constructor(){made.push('context');this.currentTime=0;this.destination=new Node();this.state='running';}createGain(){return new Node();}createBiquadFilter(){return new Node();}createOscillator(){return new Node();}resume(){return Promise.resolve();}}
 const values=new Map(),host={AudioContext:Context,document:{hidden:false},localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)}};
 const audio=create(host);assert.equal(audio.enabled,false);audio.update({started:true,speed:70});assert.deepEqual(made,[]);
 assert.equal(audio.setEnabled(true),true);assert.ok(made.includes('context'));audio.update({started:true,speed:70,paused:false,suspended:false});assert.ok(ramps.some(([kind,value])=>kind==='gain'&&value>0));
 audio.update({started:true,speed:70,paused:true,suspended:false});assert.deepEqual(ramps.at(-1),['gain',0]);audio.setEnabled(false);assert.equal(values.get('taipei-race-sound'),'off');
});

test('unsupported audio device keeps the sound toggle off',()=>{
 const audio=create({localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false}});
 assert.equal(audio.supported,false);assert.equal(audio.setEnabled(true),false);audio.cue('go');audio.update({started:true,speed:50});
});
