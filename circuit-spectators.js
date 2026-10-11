/* Concept spectator landscape, shared by WebGL and the polygon fallback. */
(function(root){
'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout;
const scene=typeof module==='object'?require('./circuit-scene.js'):root.CircuitScene;
const city=typeof module==='object'?require('./city.js'):root.CircuitCity;
const TAU=Math.PI*2,MIN_CLEARANCE=12;
// Relevant Keelung River vertices copied from data/taipei-map.js (OSM/ODbL).
// city.js draws a 235 m green bank around its 178 m water ribbon.
const river=[[1891.1,600.7],[1823.9,710.4],[1733.6,780.5],[1627.6,777.3],[1544.3,719.9],[1218.5,489.5],[1056.1,417.9],[849.2,429.7],[544.6,598.6],[375.5,666.3],[347.3,674.6],[177.9,739.1],[-3.9,757.4],[-429.6,800.3],[-734,828.9],[-1881.5,904.7]];
function pointDistance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
function cross(a,b,c){return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
function segmentDistance(a,b,c,d){
 const ac=cross(a,b,c),ad=cross(a,b,d),ca=cross(c,d,a),cb=cross(c,d,b);
 if(ac*ad<0&&ca*cb<0)return 0;
 return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b));
}
function inside(p,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function polygonDistance(a,b){if(inside(a[0],b)||inside(b[0],a))return 0;let distance=Infinity;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)distance=Math.min(distance,segmentDistance(a[i],a[(i+1)%a.length],b[j],b[(j+1)%b.length]));return distance;}
// Segment-to-footprint distance catches roads crossing between footprint vertices.
// The endpoint/midpoint maximum also covers local start-grid width transitions.
function roadClearance(footprint,layout=L){let distance=Infinity;const bounds=[Math.min(...footprint.map(p=>p[0])),Math.min(...footprint.map(p=>p[1])),Math.max(...footprint.map(p=>p[0])),Math.max(...footprint.map(p=>p[1]))],P=layout.track;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],half=Math.max(layout.widthAt(a),layout.widthAt(b),layout.widthAt(mid))/2;const boxDistance=Math.hypot(Math.max(0,bounds[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-bounds[2]),Math.max(0,bounds[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-bounds[3]));if(boxDistance-half>=distance)continue;let d=inside(a,footprint)||inside(b,footprint)?0:Infinity;for(let j=0;j<footprint.length;j++)d=Math.min(d,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length]));distance=Math.min(distance,d-half);}return distance;}
function riverClearance(footprint,data){let distance=Infinity;for(const line of data?data.rivers:[river])for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(inside(a,footprint)||inside(b,footprint))return -117.5;for(let j=0;j<footprint.length;j++)distance=Math.min(distance,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length])-117.5);}return distance;}
function retainedRoads(data){const segments=[];for(const [id,name,kind,width,y,line] of data?.roads||[])for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];for(const [c,d] of city.roadSegments(data,a,b,width+3))segments.push({a:c,b:d,width,id,name,y});}return segments;}
function streetClearance(footprint,data,segments=retainedRoads(data)){let distance=Infinity;
 const minX=Math.min(...footprint.map(p=>p[0])),maxX=Math.max(...footprint.map(p=>p[0])),minZ=Math.min(...footprint.map(p=>p[1])),maxZ=Math.max(...footprint.map(p=>p[1]));
 for(const {a,b,width} of segments){const boxDistance=Math.hypot(Math.max(0,minX-Math.max(a[0],b[0]),Math.min(a[0],b[0])-maxX),Math.max(0,minZ-Math.max(a[1],b[1]),Math.min(a[1],b[1])-maxZ));if(boxDistance-width/2>=distance)continue;
  if(inside(a,footprint)||inside(b,footprint))distance=Math.min(distance,-width/2);
  for(let j=0;j<footprint.length;j++)distance=Math.min(distance,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length])-width/2);
 }return distance;
}
function rect(x,z,w,d,angle=0){const ca=Math.cos(angle),sa=Math.sin(angle);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*ca-v*sa,z+u*sa+v*ca]);}
// Local -V is the seating front; +V is the rising rear tier and roof support line.
function nearestTrack(x,z){let best={distance:Infinity};for(let i=0;i<L.track.length;i++){const a=L.track[i],b=L.track[(i+1)%L.track.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1))),point=[a[0]+dx*t,a[1]+dz*t],distance=Math.hypot(x-point[0],z-point[1]);if(distance<best.distance)best={point,distance,index:i,tangent:[dx/Math.hypot(dx,dz),dz/Math.hypot(dx,dz)]};}return best;}
function orient(s){const target=nearestTrack(s.x,s.z),dx=target.point[0]-s.x,dz=target.point[1]-s.z;return {...s,angle:Math.atan2(dx,-dz),target:target.point,trackIndex:target.index,facing:[dx/target.distance,dz/target.distance]};}
function pitClearance(footprint){let distance=Infinity;for(let i=1;i<L.pit.length;i++){const a=L.pit[i-1],b=L.pit[i];if(inside(a,footprint)||inside(b,footprint))return -6.5;for(let j=0;j<footprint.length;j++)distance=Math.min(distance,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length])-6.5);}return distance;}
const airportBuildings=[rect(-445,-375,800,87),rect(-210,-345,480,37),rect(-880,-357,120,55),rect(-120,-400,176,74),rect(-710,-410,210,60),rect(970,-377,250,80),rect(590,-290,620,95),rect(-880,-371,64,64)];
const buildingCache=new WeakMap();
function retainedBuildings(data){if(!data)return [];if(!buildingCache.has(data))buildingCache.set(data,data.buildings.filter(([id,ring])=>!city.omitBuilding(data,id,ring,{})).map(([,ring])=>({ring,b:[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))]})));return buildingCache.get(data);}
function buildingClearance(footprint,data){let distance=Math.min(...airportBuildings.map(r=>polygonDistance(footprint,r)));const f=[Math.min(...footprint.map(p=>p[0])),Math.min(...footprint.map(p=>p[1])),Math.max(...footprint.map(p=>p[0])),Math.max(...footprint.map(p=>p[1]))];for(const {ring,b} of retainedBuildings(data)){const dx=Math.max(0,b[0]-f[2],f[0]-b[2]),dz=Math.max(0,b[1]-f[3],f[1]-b[3]);if(Math.hypot(dx,dz)<distance)distance=Math.min(distance,polygonDistance(footprint,ring));}return distance;}

const proposals=[
 {id:'principal-straight',kind:'grandstand',x:590,z:-108,w:520,d:44,canopy:'ribbon'},
 {id:'west-technical',kind:'grandstand',x:-1155,z:-105,w:154,d:34,canopy:'folded'},
 {id:'west-return',kind:'grandstand',x:-1120,z:200,w:172,d:38,canopy:'sail'},
 {id:'river-west',kind:'grandstand',x:-645,z:610,w:170,d:38,canopy:'folded'},
 {id:'river-central',kind:'grandstand',x:-105,z:600,w:182,d:38,canopy:'ribbon'},
 {id:'river-east',kind:'grandstand',x:425,z:320,w:172,d:38,canopy:'sail'},
 {id:'east-approach',kind:'grandstand',x:850,z:25,w:150,d:36,canopy:'folded'},
 {id:'west-lawn',kind:'hill',x:-915,z:180,w:134,d:54,h:16,angle:0},
 {id:'esses-lawn-west',kind:'hill',x:-280,z:195,w:142,d:54,h:18,angle:0},
 {id:'esses-lawn-centre',kind:'hill',x:225,z:195,w:138,d:52,h:17,angle:0},
 {id:'esses-lawn-east',kind:'hill',x:715,z:180,w:126,d:48,h:14,angle:0},
 {id:'infield-grove-west',kind:'hill',x:-730,z:330,w:100,d:72,h:9,angle:.2},
 {id:'infield-grove-east',kind:'hill',x:1075,z:75,w:90,d:58,h:11,angle:-.3}
];
const planCache=new WeakMap();let defaultPlan;
function plan(data){if(data&&planCache.has(data))return planCache.get(data);if(!data&&defaultPlan)return defaultPlan;const sites=[],unplaced=[],streets=retainedRoads(data);for(const proposal of proposals){let placed=null;
 // Preferred sites are composed deliberately; nearby alternatives handle route edits.
 const offsets=[[0,0]];for(const dz of [20,-20,40,-40,60,-60,80,100,140,180,220])for(const dx of [0,-30,30,-60,60,-100,100])offsets.push([dx,dz]);
 for(const [dx,dz] of offsets){const candidate={...proposal,x:proposal.x+dx,z:proposal.z+dz},s=proposal.kind==='grandstand'?orient(candidate):candidate,footprint=rect(s.x,s.z,s.w+8,s.d+8,s.angle);
  if(footprint.some(p=>p[1]>700||p[1]<-195||p[0]<-1450||p[0]>1380))continue;
  if(scene.runoffs.some(r=>polygonDistance(footprint,r.points)<8)||sites.some(other=>polygonDistance(footprint,other.footprint)<10))continue;
  const shoreClearance=riverClearance(footprint,data);if(shoreClearance<8)continue;
  const mapRoadClearance=streetClearance(footprint,data,streets);if(mapRoadClearance<5)continue;
  const clearance=roadClearance(footprint);if(clearance<MIN_CLEARANCE)continue;
  const pitDistance=pitClearance(footprint),buildingsDistance=buildingClearance(footprint,data);if(pitDistance<12||buildingsDistance<12)continue;
  placed={...s,footprint,clearance,riverClearance:shoreClearance,mapRoadClearance,pitClearance:pitDistance,buildingClearance:buildingsDistance};break;
 }
 if(placed)sites.push(placed);else unplaced.push(proposal.id);
 }
 // Deterministic grove islands fill infield voids without placing foliage on access roads.
 const trees=[];for(let row=0;row<6;row++)for(let col=0;col<17;col++){
 const x=-870+col*112+17*Math.sin(row*7+col*3),z=15+row*66+14*Math.cos(col*5+row),r=4.5+(col*3+row)%4,h=12+(col*7+row*3)%13,footprint=rect(x,z,r*2+4,r*2+4);
 if(roadClearance(footprint)<18||pitClearance(footprint)<18||buildingClearance(footprint,data)<18||riverClearance(footprint,data)<12||streetClearance(footprint,data,streets)<8)continue;
 if(sites.some(s=>polygonDistance(footprint,s.footprint)<9)||scene.runoffs.some(s=>polygonDistance(footprint,s.points)<12))continue;
 trees.push({id:'tree-'+row+'-'+col,x,z,r,h,kind:(row+col)%3,footprint});
 }const result={sites,unplaced,trees};if(data)planCache.set(data,result);else defaultPlan=result;return result;}
function build(base,objects,emissive,data){const result=plan(data);let crowdCount=0;
 const shirts=['#d9e0dc','#d9484d','#6892a8','#e6b864','#36465c','#82a994'];
 for(const s of result.sites){const ca=Math.cos(s.angle),sa=Math.sin(s.angle),p=(u,y,v)=>[s.x+u*ca-v*sa,y,s.z+u*sa+v*ca];
  const quad=(mesh,a,b,c,d,color,type=0)=>mesh.quad(p(...a),p(...b),p(...c),p(...d),color,type);
  function box(mesh,u,y,v,w,h,d,color,type=0){const a=u-w/2,b=u+w/2,c=v-d/2,e=v+d/2,t=y+h;
   quad(mesh,[a,y,c],[b,y,c],[b,t,c],[a,t,c],color,type);quad(mesh,[b,y,e],[a,y,e],[a,t,e],[b,t,e],color,type);
   quad(mesh,[b,y,c],[b,y,e],[b,t,e],[b,t,c],color,type);quad(mesh,[a,y,e],[a,y,c],[a,t,c],[a,t,e],color,type);
   quad(mesh,[a,t,c],[b,t,c],[b,t,e],[a,t,e],color,type);
  }
  function person(u,y,v,index){const color=shirts[index%shirts.length],r=.62;
   // A tiny tapered body with a light head reads as a crowd without costly spheres.
   const tip=p(u,y+1.8,v),a=p(u-r,y,v-r),b=p(u+r,y,v-r),c=p(u+r,y,v+r),d=p(u-r,y,v+r);
   objects.tri(a,b,tip,color,0);objects.tri(b,c,tip,color,0);objects.tri(c,d,tip,color,0);objects.tri(d,a,tip,color,0);
   const head=p(u,y+2.2,v),skin=index%3?'#ba9478':'#dfbea0',ha=p(u-.36,y+1.55,v-.36),hb=p(u+.36,y+1.55,v-.36),hc=p(u+.36,y+1.55,v+.36),hd=p(u-.36,y+1.55,v+.36);
   objects.tri(ha,hb,head,skin,0);objects.tri(hb,hc,head,skin,0);objects.tri(hc,hd,head,skin,0);objects.tri(hd,ha,head,skin,0);crowdCount++;
  }
  if(s.kind==='grandstand'){
   // Foundations extend to both airport grass (-5) and outer city ground (-10).
   box(objects,0,-10,0,s.w+6,10.75,s.d+6,'#697775',6);
   quad(base,[-s.w/2-3,.75,-s.d/2-3],[s.w/2+3,.75,-s.d/2-3],[s.w/2+3,.75,s.d/2+3],[-s.w/2-3,.75,s.d/2+3],'#697775',6);
   const rows=7,step=(s.d-8)/rows;
   for(let row=0;row<rows;row++){const v=-s.d/2+4+(row+.5)*step,y=2+row*2.25;
    box(objects,0,.75,v,s.w-8,y+.25,step+.1,row%2?'#8096a4':'#536b7c',0);
    box(objects,0,y+1.05,v+.3,s.w-10,.35,1.1,row%2?'#a7b8bf':'#c4cdd0',8);
    const cols=Math.floor((s.w-20)/5);for(let col=0;col<cols;col++)if((row*7+col*3)%11!==0){const u=-s.w/2+12+col*5;if(Math.abs(u)<4)continue;person(u,y+1.4,v-.35,row*23+col);}
   }
   const roofY=22;
   for(let u=-s.w/2+10;u<s.w/2;u+=40)box(objects,u,1,s.d/2-3,1.3,roofY,1.3,'#aebfc5',8);
   // Three distinct cantilever families: folded plates, a lifting ribbon, and tensile sails.
   const bays=s.id==='principal-straight'?13:5;
   for(let i=0;i<bays;i++){const a=-s.w/2+i*s.w/bays,b=a+s.w/bays,m=(a+b)/2,front=-s.d/2,rear=s.d/2;
    const lift=s.canopy==='ribbon'?3.5*Math.sin(i/bays*Math.PI):s.canopy==='sail'?(i%2?4:1.5):i%2?3:0;
    const ya=roofY+lift,yb=roofY+(s.canopy==='ribbon'?3.5*Math.sin((i+1)/bays*Math.PI):lift);
    if(s.canopy==='sail'){
     const peak=[m,roofY+8,rear*.2];objects.tri(p(a,ya,front),p(b,yb,front),p(...peak),'#c4d1d6',8);objects.tri(p(b,yb,front),p(b,yb+2,rear),p(...peak),'#8ba7b7',8);objects.tri(p(b,yb+2,rear),p(a,ya+2,rear),p(...peak),'#a7becb',8);objects.tri(p(a,ya+2,rear),p(a,ya,front),p(...peak),'#b7cbd2',8);
    }else{
     const ridge=roofY+(s.canopy==='folded'?6:lift+1.2);
     quad(objects,[a,ya,front],[b,yb,front],[b,ridge,0],[a,ridge,0],'#b6c8d1',8);
     quad(objects,[a,ridge,0],[b,ridge,0],[b,yb+1.5,rear],[a,ya+1.5,rear],'#829cab',8);
    }
    quad(objects,[a,ya-.8,front],[b,yb-.8,front],[b,yb,front],[a,ya,front],'#536b7b',8);
   }
   box(emissive,0,roofY-.9,-s.d/2-.15,s.w,.45,.4,'#7acbd5',12);
   box(objects,0,2,-s.d/2+1,s.w,1.5,.5,'#c3d0d1',8);
  }else{
   const n=20,rings=4,height=r=>-4.9+(s.h+4.9)*(1-r*r),radius=a=>.94+.035*Math.sin(a*3+.5)+.025*Math.cos(a*5);
   const vertex=(ring,j)=>{const r=ring/rings,a=j/n*TAU,f=radius(a);return p(Math.cos(a)*s.w/2*r*f,height(r),Math.sin(a)*s.d/2*r*f);};
   const triangles=[];
   for(let j=0;j<n;j++){const t=[p(0,height(0),0),vertex(1,j),vertex(1,j+1)];triangles.push(t);base.tri(...t,'#6b8756',5);}
   for(let r=1;r<rings;r++)for(let j=0;j<n;j++){const a=vertex(r,j),b=vertex(r+1,j),c=vertex(r+1,j+1),d=vertex(r,j+1);triangles.push([a,b,c],[a,c,d]);base.quad(a,b,c,d,['#718d59','#5e7f50','#78915d'][(j+r)%3],5);}
   function groundHeight(u,v){const q=p(u,0,v);for(const [a,b,c] of triangles){const det=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]),wa=((b[2]-c[2])*(q[0]-c[0])+(c[0]-b[0])*(q[2]-c[2]))/det,wb=((c[2]-a[2])*(q[0]-c[0])+(a[0]-c[0])*(q[2]-c[2]))/det,wc=1-wa-wb;if(Math.min(wa,wb,wc)>=-1e-8)return wa*a[1]+wb*b[1]+wc*c[1];}return -4.9;}
   for(let i=0;i<62;i++){const a=i*2.399963,r=.19+.59*Math.sqrt((i+.5)/62),f=radius(a),u=Math.cos(a)*s.w/2*r*f,v=Math.sin(a)*s.d/2*r*f;person(u,groundHeight(u,v),v,i+3);}
   // Small timber spectator terraces on the crest, contained by the lawn footprint.
   for(const u of [-s.w*.17,s.w*.17])box(objects,u,s.h*.85,0,13,.35,2.2,'#a3977c',0);
  }
 }
 for(const t of result.trees){
  // Rounded broadleaf crowns, tapered conifers and slender layered trees alternate.
  const n=8,ground=-4.8;for(let j=0;j<n;j++){const a=j/n*TAU,b=(j+1)/n*TAU;
   objects.quad([t.x+.65*Math.cos(a),ground,t.z+.65*Math.sin(a)],[t.x+.65*Math.cos(b),ground,t.z+.65*Math.sin(b)],[t.x+.65*Math.cos(b),ground+t.h*.55,t.z+.65*Math.sin(b)],[t.x+.65*Math.cos(a),ground+t.h*.55,t.z+.65*Math.sin(a)],'#746958',0);
  }
  const ring=(r,y,j)=>[t.x+r*Math.cos(j/n*TAU),y,t.z+r*Math.sin(j/n*TAU)];
  const layers=t.kind===1?[[0,t.h],[t.r*.65,t.h*.68],[t.r,t.h*.4],[0,t.h*.27]]:[[0,t.h],[t.r*.7,t.h*.9],[t.r,t.h*.65],[t.r*.75,t.h*.4],[0,t.h*.3]];
  for(let k=1;k<layers.length;k++)for(let j=0;j<n;j++){const [ra,ya]=layers[k-1],[rb,yb]=layers[k];const color=['#476c4b','#64865a','#799666'][t.kind];if(ra===0)objects.tri(ring(ra,ground+ya,j),ring(rb,ground+yb,j+1),ring(rb,ground+yb,j),color,5);else if(rb===0)objects.tri(ring(ra,ground+ya,j),ring(ra,ground+ya,j+1),ring(rb,ground+yb,j),color,5);else objects.quad(ring(ra,ground+ya,j),ring(ra,ground+ya,j+1),ring(rb,ground+yb,j+1),ring(rb,ground+yb,j),color,5);}
 }
 return {...result,crowdCount};
}
const api={build,plan,roadClearance,riverClearance,streetClearance,polygonDistance,pitClearance,buildingClearance,nearestTrack,rect,MIN_CLEARANCE};if(typeof module==='object')module.exports=api;else root.CircuitSpectators=api;
})(typeof window==='object'?window:globalThis);
