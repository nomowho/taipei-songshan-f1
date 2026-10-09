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
function roadClearance(footprint,layout=L){let distance=Infinity;const P=layout.track;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],half=Math.max(layout.widthAt(a),layout.widthAt(b),layout.widthAt(mid))/2;let d=inside(a,footprint)||inside(b,footprint)?0:Infinity;for(let j=0;j<footprint.length;j++)d=Math.min(d,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length]));distance=Math.min(distance,d-half);}return distance;}
function riverClearance(footprint,data){let distance=Infinity;for(const line of data?data.rivers:[river])for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(inside(a,footprint)||inside(b,footprint))return -117.5;for(let j=0;j<footprint.length;j++)distance=Math.min(distance,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length])-117.5);}return distance;}
function retainedRoads(data){const segments=[];for(const [id,name,kind,width,y,line] of data?.roads||[])for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(city.inConcept((a[0]+b[0])/2,(a[1]+b[1])/2))continue;segments.push({a,b,width,id,name,y});}return segments;}
function streetClearance(footprint,data,segments=retainedRoads(data)){let distance=Infinity;
 const minX=Math.min(...footprint.map(p=>p[0])),maxX=Math.max(...footprint.map(p=>p[0])),minZ=Math.min(...footprint.map(p=>p[1])),maxZ=Math.max(...footprint.map(p=>p[1]));
 for(const {a,b,width} of segments){const boxDistance=Math.hypot(Math.max(0,minX-Math.max(a[0],b[0]),Math.min(a[0],b[0])-maxX),Math.max(0,minZ-Math.max(a[1],b[1]),Math.min(a[1],b[1])-maxZ));if(boxDistance-width/2>=distance)continue;
  if(inside(a,footprint)||inside(b,footprint))distance=Math.min(distance,-width/2);
  for(let j=0;j<footprint.length;j++)distance=Math.min(distance,segmentDistance(a,b,footprint[j],footprint[(j+1)%footprint.length])-width/2);
 }return distance;
}
function rect(x,z,w,d){return[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];}
const proposals=[
 {id:'west-technical',kind:'grandstand',x:-1155,z:-105,w:154,d:34,angle:Math.PI},
 {id:'west-return',kind:'grandstand',x:-1120,z:200,w:172,d:38,angle:Math.PI},
 {id:'river-west',kind:'grandstand',x:-645,z:610,w:170,d:38,angle:0},
 {id:'river-central',kind:'grandstand',x:-105,z:600,w:182,d:38,angle:0},
 {id:'river-east',kind:'grandstand',x:425,z:320,w:172,d:38,angle:0},
 {id:'east-approach',kind:'grandstand',x:850,z:25,w:150,d:36,angle:Math.PI},
 {id:'west-lawn',kind:'hill',x:-915,z:180,w:134,d:54,h:16,angle:0},
 {id:'esses-lawn-west',kind:'hill',x:-280,z:195,w:142,d:54,h:18,angle:0},
 {id:'esses-lawn-centre',kind:'hill',x:225,z:195,w:138,d:52,h:17,angle:0},
 {id:'esses-lawn-east',kind:'hill',x:715,z:180,w:126,d:48,h:14,angle:0}
];
function plan(data){const sites=[],unplaced=[],streets=retainedRoads(data);for(const proposal of proposals){let placed=null;
 // Preferred sites are composed deliberately; nearby alternatives handle route edits.
 const offsets=[[0,0]];for(const dz of [20,-20,40,-40,60,-60,80,100,140,180,220])for(const dx of [0,-30,30,-60,60,-100,100])offsets.push([dx,dz]);
 for(const [dx,dz] of offsets){const s={...proposal,x:proposal.x+dx,z:proposal.z+dz},footprint=rect(s.x,s.z,s.w+8,s.d+8);
  if(footprint.some(p=>p[1]>650||p[1]<-195||p[0]<-1280||p[0]>1000))continue;
  if(scene.runoffs.some(r=>polygonDistance(footprint,r.points)<8)||sites.some(other=>polygonDistance(footprint,other.footprint)<10))continue;
  const shoreClearance=riverClearance(footprint,data);if(shoreClearance<8)continue;
  const mapRoadClearance=streetClearance(footprint,data,streets);if(mapRoadClearance<5)continue;
  const clearance=roadClearance(footprint);if(clearance<MIN_CLEARANCE)continue;
  placed={...s,footprint,clearance,riverClearance:shoreClearance,mapRoadClearance};break;
 }
 if(placed)sites.push(placed);else unplaced.push(proposal.id);
 }return {sites,unplaced};}
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
   // A shallow segmented metal canopy keeps the established airport roof language.
   for(let i=0;i<6;i++){const a=-s.w/2+i*s.w/6,b=a+s.w/6,ya=roofY+2*Math.sin(i/6*Math.PI),yb=roofY+2*Math.sin((i+1)/6*Math.PI);
    quad(objects,[a,ya,-s.d/2],[b,yb,-s.d/2],[b,yb,s.d/2],[a,ya,s.d/2],'#9eafb9',8);
    quad(objects,[a,ya-.8,-s.d/2],[b,yb-.8,-s.d/2],[b,yb,-s.d/2],[a,ya,-s.d/2],'#596f80',8);
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
 return {...result,crowdCount};
}
const api={build,plan,roadClearance,riverClearance,streetClearance,polygonDistance,MIN_CLEARANCE};if(typeof module==='object')module.exports=api;else root.CircuitSpectators=api;
})(typeof window==='object'?window:globalThis);
