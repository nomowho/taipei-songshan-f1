/* Original event furniture: unofficial concept, no licensed event logo. */
(function(root){
'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout;
const T=typeof module==='object'?require('./teams.js'):root.CircuitTeams;
function distance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
function clearance(x,z){let d=L.roadClearance([x,z]);for(let i=1;i<L.pit.length;i++)d=Math.min(d,distance([x,z],L.pit[i-1],L.pit[i])-6.5);return d;}
const river=[[1891,601],[1824,710],[1734,781],[1628,777],[1544,720],[1219,490],[1056,418],[849,430],[545,599],[376,666],[178,739],[-4,757],[-430,800],[-734,829],[-1882,905]];
function safe(x,z,r=2){if(clearance(x,z)<r+4)return false;if(x>-1050&&x<170&&z<-280)return false;for(let i=1;i<river.length;i++)if(distance([x,z],river[i-1],river[i])<125+r)return false;return true;}
let cachedPlan;
function plan(){if(cachedPlan)return cachedPlan;
 const staff=[],panels=[],supports=[],lights=[];
 const x=L.start[0]+18,z=L.start[1],span=Math.max(...L.track.filter(p=>Math.abs(p[0]-x)<40&&Math.abs(p[1]-z)<30).map(p=>L.widthAt(p)),40)/2+8;
 for(const side of [-1,1])supports.push({x,z:z+side*span,y:1,width:2,depth:2,height:25});
 for(let i=0;i<5;i++)for(let row=0;row<2;row++)lights.push({x:x-2.05,y:21.8+row*2.4,z:z+(i-2)*3.8,cluster:i,lit:true});
 for(const [teamIndex,t] of T.teams.entries())for(const dx of [-9,9])for(const dz of [-8,-4,0,4,8]){const sx=L.paddockOffset.x+t.x+dx,sz=L.paddockOffset.z+24+dz;if(safe(sx,sz,.8))staff.push({x:sx,z:sz,y:2.3,role:'pit',team:teamIndex,color:t.color});}
 let next=0;
 for(let i=0;i<L.track.length;i++){if(L.distances[i]<next)continue;next+=85;const p=L.track[i],q=L.track[(i+1)%L.track.length],len=Math.hypot(q[0]-p[0],q[1]-p[1]),nx=-(q[1]-p[1])/len,nz=(q[0]-p[0])/len;
  for(const side of [-1,1]){const off=L.widthAt(p)/2+12,sx=p[0]+side*nx*off,sz=p[1]+side*nz*off;if(!safe(sx,sz,2))continue;
   // Keep new trackside furniture outside spectator footprints (all are west of x=1000).
   if(sx<1000&&sz>-195&&sz<650)continue;
   staff.push({x:sx,z:sz,y:1,role:'marshal',color:'#ff681f'});
   if(panels.length<26&&safe(sx+nx*8,sz+nz*8,10))panels.push({x:sx+nx*8,z:sz+nz*8,y:1,color:T.teams[panels.length%T.teams.length].color,label:'TAIPEI'});
  }
 }
 return cachedPlan={staff,panels,supports,lights,gantry:{x,z,span,underside:22},unofficial:true};
}
const font={F:['11111','10000','10000','11110','10000','10000','10000'],'1':['00100','01100','00100','00100','00100','00100','01110'],T:['11111','00100','00100','00100','00100','00100','00100'],A:['01110','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],P:['11110','10001','10001','11110','10000','10000','10000'],E:['11111','10000','10000','11110','10000','10000','11111'],G:['01111','10000','10000','10111','10001','10001','01111']};
function lettering(m,text,x,y,z,scale,west=false,reverse=false){const total=text.length*6*scale;for(let c=0;c<text.length;c++)for(let row=0;row<7;row++){const bits=font[text[c]];if(!bits)continue;for(let k=0;k<5;){if(bits[row][k]!=='1'){k++;continue;}const first=k;while(k<5&&bits[row][k]==='1')k++;const a=(c*6+first)*scale-total/2,b=(c*6+k)*scale-total/2,top=y+(7-row)*scale,bottom=top-scale*.82;if(west)m.quad([x,bottom,z+(reverse?-a:a)],[x,bottom,z+(reverse?-b:b)],[x,top,z+(reverse?-b:b)],[x,top,z+(reverse?-a:a)],'#f4f4eb',0);else m.quad([x+a,bottom,z],[x+b,bottom,z],[x+b,top,z],[x+a,top,z],'#f4f4eb',0);}}}
function build(base,objects,emissive){const p=plan(),g=p.gantry;
 for(const s of p.supports){base.flatrect(s.x,s.z,5,5,1,'#8b9092',0);objects.box(s.x,1,s.z,2,25,2,'#a1aab0',8);objects.box(s.x-1.3,4,s.z,.4,19,.4,'#58666d',8);}
 for(const y of [22,25])objects.box(g.x,y,g.z,3,.7,g.span*2+2,'#a6b1b7',8);
 for(let z=g.z-g.span;z<g.z+g.span;z+=5)objects.quad([g.x-1.5,22.7,z],[g.x-1.5,25,z+4],[g.x-1.5,25,z+4.6],[g.x-1.5,22.7,z+.6],'#84949c',8);
 objects.box(g.x,26,g.z,2,8,g.span*2+4,'#17212b',8);lettering(objects,'TAIPEI',g.x-1.03,26.5,g.z,1,true,true);lettering(objects,'TAIPEI',g.x+1.03,26.5,g.z,1,true);
 for(let i=0;i<5;i++)objects.box(g.x-1,20.5,g.z+(i-2)*3.8,2,5.2,3.3,'#11191f',8);
 for(const l of p.lights){const points=[];for(let i=0;i<10;i++){const a=i*Math.PI/5;points.push([l.x,l.y+Math.sin(a)*1.05,l.z+Math.cos(a)*1.05]);}for(let i=0;i<10;i++)emissive.tri([l.x,l.y,l.z],points[i],points[(i+1)%10],'#ff202b',12);}
 for(const s of p.staff){const {x,z,y,color}=s;base.flatrect(x,z,1.6,1.6,y-.05,'#91938b',0);objects.box(x,y,z,.8,1.05,.6,'#172530',8);objects.box(x,y+1,z,1.25,1.25,.75,color,8);objects.box(x,y+2.25,z,.8,.65,.8,s.role==='marshal'?'#f3f0e6':color,8);objects.quad([x-.3,y+2.4,z-.42],[x+.3,y+2.4,z-.42],[x+.3,y+2.6,z-.42],[x-.3,y+2.6,z-.42],'#17212b',8);objects.box(x+.68,y+1.2,z,.25,1,.35,color,8);if(s.role==='marshal')objects.quad([x-.5,y+1.55,z-.39],[x+.5,y+1.55,z-.39],[x+.5,y+1.75,z-.39],[x-.5,y+1.75,z-.39],'#fff1ad',0);}
 for(const s of p.panels){for(const dx of [-8,8])objects.box(s.x+dx,1,s.z,.5,7,.5,'#939ea1',8);objects.box(s.x,4,s.z,20,6,.65,'#15212a',8);objects.quad([s.x-10,4,s.z-.34],[s.x+10,4,s.z-.34],[s.x+10,5,s.z-.34],[s.x-10,5,s.z-.34],s.color,0);lettering(objects,s.label,s.x,5.2,s.z-.35,.48);for(let r=0;r<2;r++)for(let c=0;c<4;c++)objects.quad([s.x+6+c*.8,8+r*.8,s.z-.35],[s.x+6.8+c*.8,8+r*.8,s.z-.35],[s.x+6.8+c*.8,8.8+r*.8,s.z-.35],[s.x+6+c*.8,8.8+r*.8,s.z-.35],(r+c)%2?'#11191f':'#ecefe9',0);}
 return p;
}
const api={build,plan,clearance};if(typeof module==='object')module.exports=api;else root.CircuitEvent=api;
})(typeof window==='object'?window:globalThis);


