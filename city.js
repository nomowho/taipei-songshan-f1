/* Map-derived streets and footprints. All positions are metres, east +X / north +Z. */
(function(root){
'use strict';
const CORRIDOR={west:-1650,east:1700,south:-520,bankMargin:12};
const corridorCache=new WeakMap();
function riverShore(data,x){
 let shore=Infinity;
 for(const line of data.rivers)for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0])||a[0]===b[0])continue;const z=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);if(z>350)shore=Math.min(shore,z-89);}
 return Number.isFinite(shore)?shore:365;
}
function inConcept(x,z,data){return x>CORRIDOR.west&&x<CORRIDOR.east&&z>CORRIDOR.south&&z<(data?riverShore(data,x)+CORRIDOR.bankMargin:692)}
// Piecewise linear near-bank boundary from the same river centreline as both renderers.
function corridorCells(data){
 if(corridorCache.has(data))return corridorCache.get(data);
 const lines=[],cuts=[CORRIDOR.west,CORRIDOR.east];
 for(const river of data.rivers)for(let i=1;i<river.length;i++){
  const a=river[i-1],b=river[i];if(a[0]===b[0])continue;
  const lo=Math.max(CORRIDOR.west,Math.min(a[0],b[0])),hi=Math.min(CORRIDOR.east,Math.max(a[0],b[0]));if(lo>=hi)continue;
  const m=(b[1]-a[1])/(b[0]-a[0]),c=a[1]-m*a[0];
  if(Math.max(m*lo+c,m*hi+c)<=350)continue;
  lines.push({lo,hi,m,c:c-89+CORRIDOR.bankMargin});cuts.push(lo,hi);
  const threshold=(350-c)/m;if(Number.isFinite(threshold)&&threshold>lo&&threshold<hi)cuts.push(threshold);
 }
 for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){const a=lines[i],b=lines[j],x=(b.c-a.c)/(a.m-b.m);if(x>Math.max(a.lo,b.lo)&&x<Math.min(a.hi,b.hi))cuts.push(x)}
 cuts.sort((a,b)=>a-b);const cells=[];
 for(let i=1;i<cuts.length;i++){const lo=cuts[i-1],hi=cuts[i];if(hi-lo<1e-8)continue;const x=(lo+hi)/2;let top={m:0,c:377};const active=lines.filter(l=>x>=l.lo&&x<=l.hi&&l.m*x+l.c>273);if(active.length)top=active.reduce((a,b)=>a.m*x+a.c<b.m*x+b.c?a:b);cells.push({lo,hi,m:top.m,c:top.c})}
 corridorCache.set(data,cells);return cells;
}
// Returns surviving [start,end] segments, preserving direction. Width includes road
// shoulders; clipping removes the entire ribbon, including long crossing segments.
// Shared by WebGL, fallback, and spectator clearance consumers; never mutate inputs.
function roadSegments(data,a,b,width=0){
 const dx=b[0]-a[0],dz=b[1]-a[1],pad=Math.max(0,width)/2,removed=[];
 for(const cell of corridorCells(data)){
  let lo=0,hi=1;
  for(const [v,d] of [[a[0]-cell.lo+pad,dx],[cell.hi-a[0]+pad,-dx],[a[1]-CORRIDOR.south+pad,dz],[cell.m*a[0]+cell.c-a[1]+pad*Math.hypot(cell.m,1),cell.m*dx-dz]]){
   if(Math.abs(d)<1e-12){if(v<0){lo=1;hi=0;break}}else if(d>0)lo=Math.max(lo,-v/d);else hi=Math.min(hi,-v/d);
  }
  if(lo<=hi&&hi>=0&&lo<=1)removed.push([Math.max(0,lo),Math.min(1,hi)]);
 }
 removed.sort((a,b)=>a[0]-b[0]);const result=[];let t=0;
 const point=t=>[a[0]+dx*t,a[1]+dz*t];
 for(const [lo,hi] of removed){if(lo>t+1e-9)result.push([point(t),point(lo)]);t=Math.max(t,hi)}
 if(t<1-1e-9)result.push([point(t),point(1)]);return result;
}
function omitBuilding(data,id,ring,places){
 if(id===155816458||id===25202548)return true;
 const b=[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))];
 if(ring.some(p=>inConcept(p[0],p[1],data))||ring.some((a,i)=>{const next=ring[(i+1)%ring.length],parts=roadSegments(data,a,next);return parts.reduce((sum,p)=>sum+Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]),0)<Math.hypot(next[0]-a[0],next[1]-a[1])-1e-7}))return true;
 return Object.values(places||{}).some(p=>{const d=p.displayBounds;return d&&b[2]>d[0]&&b[0]<d[2]&&b[3]>d[1]&&b[1]<d[3]});
}
function landmarkPlaces(){return typeof module==='object'?require('./landmarks.js').places:root.CircuitLandmarks.places}
// User-requested concept parkland replaces the near-bank transport corridor.
function eventGround(data,emit){
 // Clip against offset river polygons, not a vertical z subtraction on sloping banks.
 const east=1610,edges=[],cuts=[CORRIDOR.west,east];
 for(const line of data.rivers)for(let i=1;i<line.length;i++){
  const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(!length)continue;
  const nx=-dz/length*109,nz=dx/length*109,ax=a[0]-dx/length*24,az=a[1]-dz/length*24,bx=b[0]+dx/length*24,bz=b[1]+dz/length*24,q=[[ax+nx,az+nz],[bx+nx,bz+nz],[bx-nx,bz-nz],[ax-nx,az-nz]];
  for(let k=0;k<4;k++){edges.push([q[k],q[(k+1)%4]]);if(q[k][0]>CORRIDOR.west&&q[k][0]<east)cuts.push(q[k][0])}
 }
 for(let x=CORRIDOR.west;x<east;x+=40)cuts.push(x);cuts.sort((a,b)=>a-b);
 function shore(x){let z=Infinity;for(const [a,b] of edges){if(x<Math.min(a[0],b[0])-1e-7||x>Math.max(a[0],b[0])+1e-7)continue;const y=Math.abs(b[0]-a[0])<1e-8?Math.min(a[1],b[1]):a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);if(y>-300)z=Math.min(z,y)}return Number.isFinite(z)?z:riverShore(data,x)-30}
 for(let i=1;i<cuts.length;i++){const x=cuts[i-1],right=cuts[i];if(right-x<1e-6)continue;emit([[x,-485],[right,-485],[right,shore(right)],[x,shore(x)]])}
}

function build(data,base,city){
 const places=landmarkPlaces();
 const colors=['#a9a596','#bdb9ac','#949f9c','#b3a999','#899b9d','#c1bcae'];
 function surface(ring,tri,y,color,type){for(let i=0;i<tri.length;i+=3){const p=tri.slice(i,i+3).map(k=>[ring[k][0],y,ring[k][1]]);base.tri(...p,color,type)}}
 for(const [ring,tri] of data.parks)surface(ring,tri,-7.7,'#546b4c',5);
 function ribbon(line,width,y,color,type){
 const edge=line.map((p,i)=>{const a=line[Math.max(0,i-1)],b=line[Math.min(line.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz)||1;return [[p[0]-dz/length*width/2,y,p[1]+dx/length*width/2],[p[0]+dz/length*width/2,y,p[1]-dx/length*width/2]]});
 for(let i=1;i<edge.length;i++)base.quad(edge[i-1][0],edge[i-1][1],edge[i][1],edge[i][0],color,type);
 }
 for(const line of data.rivers){ribbon(line,235,-8.2,'#697958',5);ribbon(line,178,-7.3,'#27444d',3)}
 eventGround(data,p=>base.quad(...p.map(([x,z])=>[x,-5.4,z]),'#647d50',5));
 for(const [,name,kind,width,y,line] of data.roads){
  for(let i=1;i<line.length;i++)for(const [a,b] of roadSegments(data,line[i-1],line[i],width+3)){
   base.path([a,b],width+3,y-.5,'#818982',6);base.path([a,b],width,y,'#454c50',4);
   if(width>13)base.path([a,b],.35,y+.04,'#b4b0a0',0);
  }
 }
 for(const [id,ring,height,source,tri] of data.buildings){
  if(omitBuilding(data,id,ring,places))continue;
  const floor=-8,top=floor+height,color=height>65?'#69868e':colors[id%colors.length],type=height>65?10:11;
  for(let i=0;i<ring.length;i++){
   const a=ring[i],b=ring[(i+1)%ring.length],w=Math.hypot(b[0]-a[0],b[1]-a[1]);
   city.quad([a[0],floor,a[1]],[b[0],floor,b[1]],[b[0],top,b[1]],[a[0],top,a[1]],color,type,[[0,0],[w/3.4,0],[w/3.4,height/3.5],[0,height/3.5]]);
  }
  for(let i=0;i<tri.length;i+=3)city.tri(...tri.slice(i,i+3).map(k=>[ring[k][0],top,ring[k][1]]),'#9da9a7',0);
 }
}
function fallback(data,poly,strip){
 const places=landmarkPlaces();
 for(const line of data.rivers)for(let i=1;i<line.length;i++)strip([line[i-1],line[i]],178,-7,'#27444d');
 eventGround(data,p=>poly(p.map(([x,z])=>[x,-5.4,z]),'#526f4f','surface',5));
 for(const [,name,kind,width,y,line] of data.roads){for(let i=1;i<line.length;i++)for(const segment of roadSegments(data,line[i-1],line[i],width+3))strip(segment,width,y,'#454c50')}
 for(const [id,ring,h,source,tri] of data.buildings){
  if(omitBuilding(data,id,ring,places))continue;
  for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];poly([[a[0],-8,a[1]],[b[0],-8,b[1]],[b[0],h-8,b[1]],[a[0],h-8,a[1]]],i%2?'#657782':'#829194','city')}
  for(let i=0;i<tri.length;i+=3)poly(tri.slice(i,i+3).map(k=>[ring[k][0],h-8,ring[k][1]]),'#a5b1b1','city');
 }
}
const api={build,fallback,inConcept,riverShore,omitBuilding,roadSegments,CORRIDOR};if(typeof module==='object')module.exports=api;else root.CircuitCity=api;
})(typeof window==='object'?window:this);
