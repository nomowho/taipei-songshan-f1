/* Single-player arcade driving. Pure fixed-step simulation, shared-ready for a server. */
(function(root){
'use strict';
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function create(layout){
 const segments=layout.track.map((a,i)=>{const b=layout.track[(i+1)%layout.track.length],dx=b[0]-a[0],dz=b[1]-a[1];return {a,dx,dz,len:Math.hypot(dx,dz),d:layout.distances[i]};});
 function road(x,z){let best=null,dist=Infinity;for(const s of segments){const u=clamp(((x-s.a[0])*s.dx+(z-s.a[1])*s.dz)/(s.len*s.len),0,1),px=s.a[0]+u*s.dx,pz=s.a[1]+u*s.dz,ds=(x-px)**2+(z-pz)**2;if(ds<dist){dist=ds;best={x:px,z:pz,d:s.d+u*s.len,angle:Math.atan2(s.dz,s.dx)};}}return {...best,offset:Math.sqrt(dist),half:layout.widthAt([best.x,best.z])/2};}
 const start=layout.locate(0),state={x:start[0],z:start[1],angle:start[2],speed:0,steer:0,time:0,lastLap:null,bestLap:null,lap:1,completed:0,nextGate:1,valid:true,started:false,paused:false,offroad:false,wrongWay:false,hit:0,d:0};let accumulator=0;
 function restart(){Object.assign(state,{x:start[0],z:start[1],angle:start[2],speed:0,steer:0,time:0,lastLap:null,lap:1,completed:0,nextGate:1,valid:true,started:false,paused:false,offroad:false,wrongWay:false,hit:0,d:0});accumulator=0;}
 function recover(){const r=road(state.x,state.z);Object.assign(state,{x:r.x,z:r.z,angle:r.angle,speed:0,steer:0,d:r.d,valid:false,hit:0,wrongWay:false,offroad:false});accumulator=0;}
 function pause(value=true){state.paused=value;accumulator=0;if(value&&state.started)state.valid=false;}
 function progress(before,after){let delta=after-before;if(delta<-layout.length/2)delta+=layout.length;if(delta>layout.length/2)delta-=layout.length;if(Math.abs(delta)>10){state.valid=false;return;}if(delta<=0)return;
  const end=before+delta,gate=state.nextGate*layout.length/24;
  if(before<gate&&end>=gate)state.nextGate++;
  if(end>=layout.length){if(state.nextGate===25&&state.valid&&state.time>5){state.lastLap=state.time;state.bestLap=state.bestLap===null?state.time:Math.min(state.bestLap,state.time);state.completed++;}else state.lastLap=null;state.lap++;state.time=0;state.nextGate=1;state.valid=true;}
 }
 function step(input){if(state.paused)return;const throttle=clamp(Number(input.throttle)||0,0,1),brake=clamp(Number(input.brake)||0,0,1),steer=clamp(Number(input.steer)||0,-1,1);
  if(throttle&&!state.started)state.started=true;if(state.started)state.time+=STEP;
  state.hit=Math.max(0,state.hit-STEP);state.steer+=(steer-state.steer)*Math.min(1,STEP*9);
  const r0=road(state.x,state.z),drag=.5+.0015*state.speed**2+(state.offroad?state.speed*.65:0);
  state.speed=clamp(state.speed+(throttle*12-brake*32-drag)*STEP,0,83.3);
  const yaw=state.steer*Math.min(.95/(1+state.speed/35),18/Math.max(state.speed,1))*Math.min(1,state.speed/7);
  state.angle=wrap(state.angle+yaw*STEP);state.x+=Math.cos(state.angle)*state.speed*STEP;state.z+=Math.sin(state.angle)*state.speed*STEP;
  const r=road(state.x,state.z),limit=r.half+.2;state.offroad=r.offset>r.half-1.4;
  if(r.offset>limit){const nx=(state.x-r.x)/r.offset,nz=(state.z-r.z)/r.offset;state.x=r.x+nx*limit;state.z=r.z+nz*limit;if(state.hit<=0){state.speed*=.35;state.hit=.7;}state.valid=false;}
  state.wrongWay=state.speed>2&&Math.cos(state.angle-r.angle)<-.25;
  if(state.started)progress(r0.d,r.d);state.d=r.d;
 }
 function update(seconds,input={}){if(state.paused||!Number.isFinite(seconds))return;accumulator+=clamp(seconds,0,.25);while(accumulator+1e-10>=STEP){step(input);accumulator-=STEP;}}
 return {state,update,recover,restart,pause,road};
}
const api={create,STEP};if(typeof module==='object')module.exports=api;else root.CircuitDriving=api;
})(typeof window==='object'?window:globalThis);
