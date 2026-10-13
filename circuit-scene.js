/* Shared A1 physical layout. Used by both WebGL and the polygon fallback. */
(function(root){
'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout;
// Removed the two obsolete rectangular gravel pads at the owner's request.
const runoffs=[{kind:'asphalt',points:[[1640,-10],[1780,-10],[1780,190],[1640,190]]}];
// Baked opening indices for the fixed E1 route; scoped tests validate actual clearance.
const barrierOpenings=new Set([146,148,150,152,154,156,158,160,162,164,3744,3746,3748,3750,3752,3754,3756,3758,3760,3762,3764,3766,3768,3770,3772,3774,3776,3778,3780,3782,3784,3786,3788,3790,3792,3794,3796,3798,3800,3802,3804,3806,3808,3810,3812,3814,3816,3818,3820,3822,3824,3826,5408,5410,5412,5414,5416,5418,5420,5422,5424]);
let barriers;
function barrierPlan(){if(barriers)return barriers;barriers=[];const P=L.track,N=P.length;
 const normal=P.map((p,i)=>{const a=P[(i-1+N)%N],b=P[(i+1)%N],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[-(b[1]-a[1])/d,(b[0]-a[0])/d]});
 const pt=(i,s)=>[P[i][0]+normal[i][0]*s*(L.widthAt(P[i])/2+6),P[i][1]+normal[i][1]*s*(L.widthAt(P[i])/2+6)];
 for(let i=0;i<N;i++)for(const side of [-1,1]){const a=pt(i,side),b=pt((i+1)%N,side),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(!barrierOpenings.has(i*2+(side===1?1:0)))barriers.push({points:[a,b],side,index:i,post:i%4===0});}return barriers;
}
function build(base,objects,emissive){
 const P=L.track,N=P.length,normal=P.map((p,i)=>{const a=P[(i-1+N)%N],b=P[(i+1)%N],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[-(b[1]-a[1])/d,(b[0]-a[0])/d]});
 function point(i,offset,y){i=(i+N)%N;return[P[i][0]+normal[i][0]*offset,y,P[i][1]+normal[i][1]*offset]}
 function ribbon(left,right,y,color,type,open=false){for(let i=0;i<N;i++){const j=(i+1)%N; if(open){const a=point(i,(left(i)+right(i))/2,y),b=point(j,(left(j)+right(j))/2,y);if([a,b,[(a[0]+b[0])/2,y,(a[2]+b[2])/2]].some(p=>L.pitClearance([p[0],p[2]])<2))continue;}const lo=k=>Math.min(left(k),right(k)),hi=k=>Math.max(left(k),right(k));base.quad(point(i,lo(i),y),point(j,lo(j),y),point(j,hi(j),y),point(i,hi(i),y),typeof color==='function'?color(i):color,type)}}
 const widths=P.map(p=>L.widthAt(p)/2),half=i=>widths[i];
 for(const r of runoffs){const p=r.points.map(([x,z])=>[x,1.1,z]);base.quad(...p,r.kind==='gravel'?'#b3a583':'#666e73',r.kind==='gravel'?0:4);
  if(r.kind==='gravel')for(let x=Math.min(...r.points.map(p=>p[0]))+3;x<Math.max(...r.points.map(p=>p[0]));x+=11)for(let z=Math.min(...r.points.map(p=>p[1]))+3;z<Math.max(...r.points.map(p=>p[1]));z+=13)base.flatrect(x,z,2,3,1.13,'#948875',0);
 }
 ribbon(i=>-half(i)-2,i=>half(i)+2,1.2,'#9b9f94',6);
 ribbon(i=>-half(i),half,1.65,'#353a3e',4);
 for(const s of [-1,1]){
  ribbon(i=>s*(half(i)-.35),i=>s*half(i),1.86,'#e4e9de',0,true);
  ribbon(i=>s*(half(i)+.1),i=>s*(half(i)+1.5),1.88,i=>Math.floor(L.distances[i]/4)%2?'#e8ebdf':'#db3a49',0,true);
  ribbon(i=>s*(half(i)+1.6),i=>s*(half(i)+1.9),1.9,'#4ec8d8',12,true);
 }
 // Connected rails and catch-fence cables follow both edges and leave escape gaps.
 for(const r of barrierPlan()){const [a,b]=r.points,v=(p,y)=>[p[0],y,p[1]];
  for(const y of [1.8,2.5])objects.quad(v(a,y),v(b,y),v(b,y+.35),v(a,y+.35),'#b2bdc0',8);
  for(const y of [3.3,4.5,5.7])objects.quad(v(a,y),v(b,y),v(b,y+.055),v(a,y+.055),'#7c939b',8);
  if(r.post){objects.box(a[0],1,a[1],.3,5,.3,'#a6b7be',8);objects.quad(v(a,2.9),v(b,5.7),v(b,5.77),v(a,2.97),'#6b838e',8);objects.quad(v(a,5.7),v(b,2.9),v(b,2.97),v(a,5.77),'#6b838e',8);}}
 // Outer boundaries of escape areas, with the track-facing side left open.
 function wall(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz),nx=-dz/d*.6,nz=dx/d*.6;
  objects.quad([a[0],1,a[1]],[b[0],1,b[1]],[b[0],3,b[1]],[a[0],3,a[1]],'#bcc5c9',0);
  objects.quad([a[0]+nx,3,a[1]+nz],[b[0]+nx,3,b[1]+nz],[b[0]-nx,3,b[1]-nz],[a[0]-nx,3,a[1]-nz],'#e9e7dc',0);
 }
 wall([1785,-10],[1785,195]);
 const dx=L.paddockOffset.x,dz=L.paddockOffset.z;
 // Shared continuous ribbon, level with the race road; no raised dark caps.
 const Q=L.pit,edge=Q.map((p,i)=>{const a=Q[Math.max(0,i-1)],b=Q[Math.min(Q.length-1,i+1)],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[-(b[1]-a[1])/d*L.pitWidths[i]/2,(b[0]-a[0])/d*L.pitWidths[i]/2]}),v=(i,s)=>[Q[i][0]+s*edge[i][0],1.65,Q[i][1]+s*edge[i][1]];
 for(let i=0;i<Q.length-1;i++){if(i===0)base.tri(v(i,0),v(i+1,-1),v(i+1,1),'#353a3e',4);else if(i===Q.length-2)base.tri(v(i,-1),v(i+1,0),v(i,1),'#353a3e',4);else base.quad(v(i,-1),v(i+1,-1),v(i+1,1),v(i,1),'#353a3e',4);}
 base.path([[-280+dx,38+dz],[60+dx,38+dz]],.45,2.18,'#ece9d9',0);base.path([[-280+dx,51.5+dz],[60+dx,51.5+dz]],.45,2.18,'#e2b24c',0);
 for(let x=-268;x<=55;x+=14)objects.box(x+dx,1.9,65+dz,.45,3.3,.5,'#b7c6d1',8);
 for(const y of [2.2,3.7,5.1])objects.box(-106.5+dx,y,65+dz,327,.18,.2,'#a7b9c2',8);
 for(let r=0;r<2;r++)for(let c=0;c<14;c++)base.flatrect(L.start[0]+r*1.6,L.start[1]-20+c*3,1.6,3,2.1,(r+c)%2?'#edf1ea':'#272c31');
 for(const slot of L.grid){for(const dz of [-4.4,4.4])base.flatrect(slot.x,slot.z+dz,22,.22,2.12,'#ebe4d2');base.flatrect(slot.x+11,slot.z,.22,8.8,2.12,'#ebe4d2')}
 for(let x=-120;x<1050;x+=36)base.flatrect(x,-180,13,.30,1.9,'#899d84',0);
 objects.box(1050,0,-145,.7,7,.7,'#a4b5c1',8);emissive.box(1050,7,-145,2,1,1,'#80d9ed',12);

}
const api={build,runoffs,barrierPlan};if(typeof module==='object')module.exports=api;else root.CircuitScene=api;
})(typeof window==='object'?window:globalThis);
