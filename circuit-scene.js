/* Shared A1 physical layout. Used by both WebGL and the polygon fallback. */
(function(root){
'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout;
const runoffs=[{kind:'asphalt',points:[[1640,-10],[1780,-10],[1780,190],[1640,190]]},{kind:'gravel',points:[[-1650,330],[-1510,330],[-1510,490],[-1650,490]]},{kind:'gravel',points:[[1240,-485],[1510,-485],[1510,-410],[1240,-410]]}];
function build(base,objects,emissive){
 const P=L.track,N=P.length,normal=P.map((p,i)=>{const a=P[(i-1+N)%N],b=P[(i+1)%N],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[-(b[1]-a[1])/d,(b[0]-a[0])/d]});
 function point(i,offset,y){i=(i+N)%N;return[P[i][0]+normal[i][0]*offset,y,P[i][1]+normal[i][1]*offset]}
 function ribbon(left,right,y,color,type){for(let i=0;i<N;i++){const j=(i+1)%N,lo=k=>Math.min(left(k),right(k)),hi=k=>Math.max(left(k),right(k));base.quad(point(i,lo(i),y),point(j,lo(j),y),point(j,hi(j),y),point(i,hi(i),y),typeof color==='function'?color(i):color,type)}}
 const half=i=>L.widthAt(P[i])/2;
 for(const r of runoffs){const p=r.points.map(([x,z])=>[x,1.1,z]);base.quad(...p,r.kind==='gravel'?'#b3a583':'#666e73',r.kind==='gravel'?0:4);
  if(r.kind==='gravel')for(let x=Math.min(...r.points.map(p=>p[0]))+3;x<Math.max(...r.points.map(p=>p[0]));x+=11)for(let z=Math.min(...r.points.map(p=>p[1]))+3;z<Math.max(...r.points.map(p=>p[1]));z+=13)base.flatrect(x,z,2,3,1.13,'#948875',0);
 }
 ribbon(i=>-half(i)-2,i=>half(i)+2,1.2,'#9b9f94',6);
 ribbon(i=>-half(i),half,1.65,'#353a3e',4);
 for(const s of [-1,1]){
  ribbon(i=>s*(half(i)-.35),i=>s*half(i),1.86,'#e4e9de',0);
  ribbon(i=>s*(half(i)+.1),i=>s*(half(i)+1.5),1.88,i=>Math.floor(L.distances[i]/4)%2?'#e8ebdf':'#db3a49',0);
  ribbon(i=>s*(half(i)+1.6),i=>s*(half(i)+1.9),1.9,'#4ec8d8',12);
 }
 // Posts intentionally omit the pit connections and the forward escape routes.
 let nextPost=0;
 for(let i=0;i<N;i++)if(L.distances[i]>=nextPost){nextPost+=21;for(const s of [-1,1]){
  const p=point(i,s*(half(i)+7),0),x=p[0],z=p[2];
  if(x>1600||x<-1480||z<-380)continue;
  if(P[i][1]<-170&&P[i][1]>-190&&x>340&&x<850&&s<0)continue;
  objects.box(x,1.2,z,1.5,2.2,1.5,'#9caeb4',8);emissive.box(x,3.4,z,1.65,.35,1.65,'#59d5df',12);
 }}
 // Outer boundaries of escape areas, with the track-facing side left open.
 function wall(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz),nx=-dz/d*.6,nz=dx/d*.6;
  objects.quad([a[0],1,a[1]],[b[0],1,b[1]],[b[0],3,b[1]],[a[0],3,a[1]],'#bcc5c9',0);
  objects.quad([a[0]+nx,3,a[1]+nz],[b[0]+nx,3,b[1]+nz],[b[0]-nx,3,b[1]-nz],[a[0]-nx,3,a[1]-nz],'#e9e7dc',0);
 }
 wall([1785,-10],[1785,195]);wall([-1655,325],[-1655,495]);wall([1235,-490],[1515,-490]);
 const dx=L.paddockOffset.x,dz=L.paddockOffset.z;
 base.path(L.pit,13,2.04,'#454c50',4);base.path([[-280+dx,38+dz],[60+dx,38+dz]],.45,2.18,'#ece9d9',0);base.path([[-280+dx,51.5+dz],[60+dx,51.5+dz]],.45,2.18,'#e2b24c',0);
 for(let x=-268;x<=55;x+=14)objects.box(x+dx,1.9,65+dz,.45,3.3,.5,'#b7c6d1',8);
 for(const y of [2.2,3.7,5.1])objects.box(-106.5+dx,y,65+dz,327,.18,.2,'#a7b9c2',8);
 for(let r=0;r<2;r++)for(let c=0;c<14;c++)base.flatrect(L.start[0]+r*1.6,L.start[1]-20+c*3,1.6,3,2.1,(r+c)%2?'#edf1ea':'#272c31');
 for(const slot of L.grid){for(const dz of [-4.4,4.4])base.flatrect(slot.x,slot.z+dz,22,.22,2.12,'#ebe4d2');base.flatrect(slot.x+11,slot.z,.22,8.8,2.12,'#ebe4d2')}
 for(let x=-120;x<1050;x+=36)base.flatrect(x,-180,13,.30,1.9,'#899d84',0);
 objects.box(1050,0,-145,.7,7,.7,'#a4b5c1',8);emissive.box(1050,7,-145,2,1,1,'#80d9ed',12);

}
const api={build,runoffs};if(typeof module==='object')module.exports=api;else root.CircuitScene=api;
})(typeof window==='object'?window:globalThis);
