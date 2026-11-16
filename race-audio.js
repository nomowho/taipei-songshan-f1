/* Lightweight synthesized race audio. No remote sound files or autoplay. */
(function(root){'use strict';
const KEY='taipei-race-sound';
function create(host=root){
 const Audio=host.AudioContext||host.webkitAudioContext;
 let enabled=false,context=null,engine=null,harmonic=null,engineGain=null;
 try{enabled=host.localStorage?.getItem(KEY)==='on';}catch{}
 function ensure(){if(!Audio)return false;if(context)return true;
  context=new Audio();engineGain=context.createGain();engineGain.gain.value=0;
  const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;
  engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=75;
  harmonic=context.createOscillator();harmonic.type='triangle';harmonic.frequency.value=150;
  const hGain=context.createGain();hGain.gain.value=.19;
  engine.connect(filter);harmonic.connect(hGain);hGain.connect(filter);filter.connect(engineGain);engineGain.connect(context.destination);
  engine.start();harmonic.start();return true;
 }
 function unlock(){if(!enabled||!ensure())return false;context.resume().catch(()=>{});return true;}
 function setEnabled(value){enabled=!!value&&!!Audio;try{host.localStorage?.setItem(KEY,enabled?'on':'off');}catch{}if(enabled)unlock();else stop();return enabled;}
 function stop(){if(context)engineGain.gain.setTargetAtTime(0,context.currentTime,.05);}
 function update(state){if(!enabled||!context)return;const t=context.currentTime,playing=state.started&&!state.paused&&!state.suspended&&!host.document?.hidden;
  const speed=Math.max(0,Math.min(100,Number(state.speed)||0));engine.frequency.setTargetAtTime(75+speed*3.4,t,.08);harmonic.frequency.setTargetAtTime(150+speed*6.8,t,.08);
  engineGain.gain.setTargetAtTime(playing?Math.min(.085,.022+speed*.00055):0,t,.09);
 }
 function cue(kind){if(!enabled||!context||context.state!=='running')return;
  const tones={light:[510,.08,.035],go:[760,.27,.075],hit:[110,.2,.07],finish:[880,.42,.07]};const [frequency,duration,volume]=tones[kind]||[];if(!frequency)return;
  const t=context.currentTime,o=context.createOscillator(),g=context.createGain();o.type=kind==='hit'?'sawtooth':'sine';o.frequency.value=frequency;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g);g.connect(context.destination);o.start(t);o.stop(t+duration+.015);
 }
 return {get enabled(){return enabled;},get supported(){return !!Audio;},setEnabled,unlock,update,cue,stop};
}
const api={create};if(typeof module==='object')module.exports=api;else root.CircuitRaceAudio=api;
})(typeof window==='object'?window:globalThis);
