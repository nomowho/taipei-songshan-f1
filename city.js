/* Map-derived streets and footprints. All positions are metres, east +X / north +Z. */
(function(root){
'use strict';
function inConcept(x,z){return Math.abs(x)<1490&&z>-520&&z<355}
function riverShore(data,x){
 let shore=Infinity;
 for(const line of data.rivers)for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0])||a[0]===b[0])continue;const z=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);if(z>350)shore=Math.min(shore,z-89);}
 return Number.isFinite(shore)?shore:365;
}
function omitBuilding(data,id,ring,places){
 if(id===155816458||id===25202548)return true;
 const b=[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))];
 if(b[2]>-1490&&b[0]<1490&&b[3]>315){const x=Math.max(-1490,Math.min(1490,(b[0]+b[2])/2));if(b[1]<riverShore(data,x))return true;}
 return Object.values(places||{}).some(p=>{const d=p.displayBounds;return d&&b[2]>d[0]&&b[0]<d[2]&&b[3]>d[1]&&b[1]<d[3]});
}
function landmarkPlaces(){return typeof module==='object'?require('./landmarks.js').places:root.CircuitLandmarks.places}
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
 for(const [,name,kind,width,y,line] of data.roads){
  for(let i=1;i<line.length;i++){
   const a=line[i-1],b=line[i];if(inConcept((a[0]+b[0])/2,(a[1]+b[1])/2))continue;
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
 for(const [,name,kind,width,y,line] of data.roads){for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(!inConcept((a[0]+b[0])/2,(a[1]+b[1])/2))strip([a,b],width,y,'#454c50')}}
 for(const [id,ring,h,source,tri] of data.buildings){
  if(omitBuilding(data,id,ring,places))continue;
  for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];poly([[a[0],-8,a[1]],[b[0],-8,b[1]],[b[0],h-8,b[1]],[a[0],h-8,a[1]]],i%2?'#657782':'#829194','city')}
  for(let i=0;i<tri.length;i+=3)poly(tri.slice(i,i+3).map(k=>[ring[k][0],h-8,ring[k][1]]),'#a5b1b1','city');
 }
}
const api={build,fallback,inConcept,riverShore,omitBuilding};if(typeof module==='object')module.exports=api;else root.CircuitCity=api;
})(typeof window==='object'?window:this);
