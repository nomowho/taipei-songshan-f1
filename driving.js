/* Single-player arcade driving. Pure fixed-step simulation, shared-ready for a server. */
(function(root){
'use strict';
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function sectorColor(value,personal,record){return record===null||value<record-.0005?'purple':personal===null||value<personal-.0005?'green':'yellow';}
function create(layout,options={}){
 const segments=layout.track.map((a,i)=>{const b=layout.track[(i+1)%layout.track.length],dx=b[0]-a[0],dz=b[1]-a[1];return {a,dx,dz,len:Math.hypot(dx,dz),d:layout.distances[i]};});
 function road(x,z){let best=null,dist=Infinity;for(const s of segments){const u=clamp(((x-s.a[0])*s.dx+(z-s.a[1])*s.dz)/(s.len*s.len),0,1),px=s.a[0]+u*s.dx,pz=s.a[1]+u*s.dz,ds=(x-px)**2+(z-pz)**2;if(ds<dist){dist=ds;best={x:px,z:pz,d:s.d+u*s.len,angle:Math.atan2(s.dz,s.dx)};}}return {...best,offset:Math.sqrt(dist),half:layout.widthAt([best.x,best.z])/2};}
 const sectorEnds=layout.splits?layout.splits.map(i=>layout.distances[i]).concat(layout.length):[layout.length/3,layout.length*2/3,layout.length];
 const reference=Array.from({length:3},(_,i)=>{const v=options.referenceSectors?.[i];return Number.isFinite(v)&&v>0&&v<3600?v:null;});
 const start=layout.locate(0),state={x:start[0],z:start[1],angle:start[2],speed:0,steer:0,time:0,lastLap:null,bestLap:null,lap:1,completed:0,nextGate:1,valid:true,started:false,paused:false,offroad:false,wrongWay:false,hit:0,d:0,currentSectors:[null,null,null],lastSectors:[null,null,null],personalSectors:[null,null,null],recordSectors:reference,sectorIndex:0,sectorStart:0};let accumulator=0,previous={x:state.x,z:state.z,angle:state.angle,speed:0};
 function snap(){previous={x:state.x,z:state.z,angle:state.angle,speed:state.speed};accumulator=0;}
 function renderState(){const a=clamp(accumulator/STEP,0,1);return {x:previous.x+(state.x-previous.x)*a,z:previous.z+(state.z-previous.z)*a,angle:previous.angle+wrap(state.angle-previous.angle)*a,speed:previous.speed+(state.speed-previous.speed)*a};}
 function invalidate(){state.valid=false;for(const s of state.currentSectors)if(s)s.color='invalid';}
 function restart(){Object.assign(state,{x:start[0],z:start[1],angle:start[2],speed:0,steer:0,time:0,lastLap:null,lap:1,completed:0,nextGate:1,valid:true,started:false,paused:false,offroad:false,wrongWay:false,hit:0,d:0,currentSectors:[null,null,null],lastSectors:[null,null,null],sectorIndex:0,sectorStart:0});snap();}
 function recover(){const r=road(state.x,state.z);Object.assign(state,{x:r.x,z:r.z,angle:r.angle,speed:0,steer:0,d:r.d,valid:false,hit:0,wrongWay:false,offroad:false});invalidate();snap();}
 function pause(value=true){state.paused=value;snap();if(value&&state.started)invalidate();}
 function progress(before,after){let delta=after-before;if(delta<-layout.length/2)delta+=layout.length;if(delta>layout.length/2)delta-=layout.length;if(Math.abs(delta)>10){invalidate();return;}if(delta<=0)return;
  const end=before+delta;
  while(state.nextGate<=24&&before<state.nextGate*layout.length/24&&end>=state.nextGate*layout.length/24)state.nextGate++;
  const boundary=sectorEnds[state.sectorIndex];
  if(before<boundary&&end>=boundary){
   const crossing=state.time-STEP+STEP*(boundary-before)/delta,elapsed=crossing-state.sectorStart,i=state.sectorIndex;
   const valid=state.valid&&state.nextGate>Math.floor(boundary/layout.length*24)&&elapsed>0;
   state.currentSectors[i]={time:elapsed,color:valid?sectorColor(elapsed,state.personalSectors[i],state.recordSectors[i]):'invalid'};
   state.sectorStart=crossing;state.sectorIndex++;
  }
  if(end>=layout.length){
   const crossing=state.time-STEP+STEP*(layout.length-before)/delta;
   const valid=state.nextGate===25&&state.valid&&crossing>5&&state.currentSectors.every(s=>s&&s.color!=='invalid');
   if(valid){state.lastLap=crossing;state.bestLap=state.bestLap===null?crossing:Math.min(state.bestLap,crossing);state.completed++;for(let i=0;i<3;i++){const value=state.currentSectors[i].time;state.personalSectors[i]=Math.min(state.personalSectors[i]??Infinity,value);state.recordSectors[i]=Math.min(state.recordSectors[i]??Infinity,value);}}
   else {state.lastLap=null;invalidate();}
   state.lastSectors=state.currentSectors.map(s=>s?{...s}:null);state.currentSectors=[null,null,null];state.sectorIndex=0;state.sectorStart=0;state.lap++;state.time=Math.max(0,state.time-crossing);state.nextGate=1;state.valid=true;
  }
 }
 function step(input){if(state.paused)return;const throttle=clamp(Number(input.throttle)||0,0,1),brake=clamp(Number(input.brake)||0,0,1),steer=clamp(Number(input.steer)||0,-1,1);
  if(throttle&&!state.started)state.started=true;if(state.started)state.time+=STEP;
  state.hit=Math.max(0,state.hit-STEP);state.steer+=(steer-state.steer)*Math.min(1,STEP*9);
  const r0=road(state.x,state.z),drag=.5+.0015*state.speed**2+(state.offroad?state.speed*.65:0);
  state.speed=clamp(state.speed+(throttle*18-brake*44-drag)*STEP,0,100);
  const yaw=state.steer*Math.min(.95/(1+state.speed/35),18/Math.max(state.speed,1))*Math.min(1,state.speed/7);
  state.angle=wrap(state.angle+yaw*STEP);state.x+=Math.cos(state.angle)*state.speed*STEP;state.z+=Math.sin(state.angle)*state.speed*STEP;
  const r=road(state.x,state.z),limit=Math.max(1,r.half-2.7);state.offroad=r.offset>r.half-4;
  if(r.offset>limit){const nx=(state.x-r.x)/r.offset,nz=(state.z-r.z)/r.offset;state.x=r.x+nx*limit;state.z=r.z+nz*limit;if(state.hit<=0){state.speed*=.35;state.hit=.7;}invalidate();}
  state.wrongWay=state.speed>2&&Math.cos(state.angle-r.angle)<-.25;
  if(state.started)progress(r0.d,r.d);state.d=r.d;
 }
 function update(seconds,input={}){if(state.paused||!Number.isFinite(seconds))return;accumulator+=clamp(seconds,0,.25);while(accumulator+1e-10>=STEP){previous={x:state.x,z:state.z,angle:state.angle,speed:state.speed};step(input);accumulator-=STEP;}}
 return {state,update,recover,restart,pause,road,renderState,sectorEnds};
}
function chaseCamera(p){const forward=[Math.cos(p.angle),Math.sin(p.angle)];return {eye:[p.x-forward[0]*22,8.5,p.z-forward[1]*22],target:[p.x+forward[0]*12,3.8,p.z+forward[1]*12],fov:1.02+.16*clamp(p.speed/100,0,1)};}
const api={create,STEP,sectorColor,chaseCamera};if(typeof module==='object')module.exports=api;else root.CircuitDriving=api;
})(typeof window==='object'?window:globalThis);
