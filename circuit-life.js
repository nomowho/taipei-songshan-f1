/* Decorative aircraft and river craft; conceptual silhouettes, not exact models. */
(function(root){
'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout;
const WATER_Y=-7,APRON_Y=-3;
function distance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
function footprint(s){const c=Math.cos(s.angle),n=Math.sin(s.angle);return [[-s.w/2,-s.d/2],[s.w/2,-s.d/2],[s.w/2,s.d/2],[-s.w/2,s.d/2]].map(([u,v])=>[s.x+u*c-v*n,s.z+u*n+v*c]);}
function raceClearance(s){const radius=Math.hypot(s.w,s.d)/2;return Math.min(...L.track.map((a,i)=>distance([s.x,s.z],a,L.track[(i+1)%L.track.length])-Math.max(L.widthAt(a),L.widthAt(L.track[(i+1)%L.track.length]))/2))-radius;}
function plan(data){
 const aircraft=[-740,-610,-480].map((x,i)=>({id:'passenger-'+(i+1),kind:'passenger',x,z:-255,w:60,d:62,angle:0,y:APRON_Y,color:['#365c7f','#367369','#9d5867'][i]}));
 aircraft.push(...[-355,-295].map((x,i)=>({id:'fighter-'+(i+1),kind:'fighter',x,z:-257,w:16,d:24,angle:i?.15:-.15,y:APRON_Y,color:'#879397'})));
 const vessels=[];
 // Position along real map river segments; keep the entire bounding circle inside
 // the 178 m ribbon, away from bridge roads and from the race surface.
 for(const [i,target] of [-1200,-600,200,1100,1450].entries()){
  let selected=null;
  for(const shift of [0,30,-30,60,-60,100,-100,150,-150]){const x=target+shift;
   for(const line of data?.rivers||[])for(let j=1;j<line.length;j++){const a=line[j-1],b=line[j];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0])||a[0]===b[0])continue;
    const t=(x-a[0])/(b[0]-a[0]),z=a[1]+t*(b[1]-a[1]);if(z<350)continue;
    const s={id:'vessel-'+(i+1),kind:['yacht','sailboat','launch','yacht','riverboat'][i],x,z,w:i===4?12:8,d:i===4?34:24,angle:Math.atan2(b[1]-a[1],b[0]-a[0])-Math.PI/2,y:WATER_Y,riverSegment:[a,b]};
    const radius=Math.hypot(s.w,s.d)/2;
    if((data.roads||[]).some(r=>r[5].slice(1).some((q,k)=>distance([x,z],r[5][k],q)<radius+r[3]/2+12)))continue;
    if(raceClearance(s)<15)continue;selected=s;break;
   }if(selected)break;
  }if(selected)vessels.push(selected);
 }
 for(const s of [...aircraft,...vessels]){s.footprint=footprint(s);s.raceClearance=raceClearance(s);}
 return {aircraft,vessels};
}
function build(base,objects,emissive,data){const result=plan(data);
 for(const s of [...result.aircraft,...result.vessels]){const ca=Math.cos(s.angle),sa=Math.sin(s.angle),p=(u,y,v)=>[s.x+u*ca-v*sa,s.y+y,s.z+u*sa+v*ca];
  const tri=(a,b,c,color,mesh=objects)=>mesh.tri(p(...a),p(...b),p(...c),color,0);
  const quad=(a,b,c,d,color,mesh=objects)=>mesh.quad(p(...a),p(...b),p(...c),p(...d),color,0);
  function box(u,y,v,w,h,d,color,mesh=objects){const a=u-w/2,b=u+w/2,c=v-d/2,e=v+d/2;quad([a,y,c],[b,y,c],[b,y+h,c],[a,y+h,c],color,mesh);quad([b,y,e],[a,y,e],[a,y+h,e],[b,y+h,e],color,mesh);quad([a,y,e],[a,y,c],[a,y+h,c],[a,y+h,e],color,mesh);quad([b,y,c],[b,y,e],[b,y+h,e],[b,y+h,c],color,mesh);quad([a,y+h,c],[b,y+h,c],[b,y+h,e],[a,y+h,e],color,mesh);}
  function tube(stations,color,n=10){for(let k=1;k<stations.length;k++){const a=stations[k-1],b=stations[k];for(let j=0;j<n;j++){const q=j/n*Math.PI*2,r=(j+1)/n*Math.PI*2;quad([Math.cos(q)*a[2],a[1]+Math.sin(q)*a[2],a[0]],[Math.cos(q)*b[2],b[1]+Math.sin(q)*b[2],b[0]],[Math.cos(r)*b[2],b[1]+Math.sin(r)*b[2],b[0]],[Math.cos(r)*a[2],a[1]+Math.sin(r)*a[2],a[0]],color);}}}
  if(s.kind==='passenger'||s.kind==='fighter'){
   const jet=s.kind==='passenger',len=jet?58:22,r=jet?3.1:1.05,cy=jet?6:2.9;
   tube([[-len/2,cy,.18],[-len*.34,cy,r*.8],[-len*.23,cy,r],[len*.30,cy,r],[len*.43,cy,r*.7],[len/2,cy,.12]],jet?'#d8e0df':'#929fa5');
   for(const sign of [-1,1]){
    const span=jet?28:7,root=jet?3:1;
    quad([sign*root,cy,8],[sign*span,cy+.9,-6],[sign*span,cy+.9,-10],[sign*root,cy,-6],s.color);
    quad([sign*root,cy,-19*(jet?1:.38)],[sign*(jet?11:4),cy+.5,-25*(jet?1:.38)],[sign*(jet?11:4),cy+.5,-27*(jet?1:.38)],[sign*root,cy,-26*(jet?1:.38)],s.color);
    if(jet){box(sign*28,cy+.9,-8,.45,2.5,4,s.color);const ex=sign*11;for(let j=0;j<10;j++){const a=j/10*Math.PI*2,b=(j+1)/10*Math.PI*2;quad([ex+Math.cos(a)*1.8,3.7+Math.sin(a)*1.8,2],[ex+Math.cos(a)*1.8,3.7+Math.sin(a)*1.8,-6],[ex+Math.cos(b)*1.8,3.7+Math.sin(b)*1.8,-6],[ex+Math.cos(b)*1.8,3.7+Math.sin(b)*1.8,2],'#bcc7cc');tri([ex,3.7,2.05],[ex+Math.cos(b)*1.6,3.7+Math.sin(b)*1.6,2.05],[ex+Math.cos(a)*1.6,3.7+Math.sin(a)*1.6,2.05],'#253643');}
     for(let v=-14;v<18;v+=2.6)quad([sign*3.13,6.2,v-.45],[sign*3.13,6.75,v-.45],[sign*3.13,6.75,v+.45],[sign*3.13,6.2,v+.45],'#334a58');
    }else{tri([sign*1,2,3],[sign*2.2,1.8,-2],[sign*.8,1.7,-5],'#40555e');}
    box(sign*(jet?3:1),0,-(jet?5:3),jet?.6:.35,jet?3:1.5,.7,'#66717a');box(sign*(jet?3:1),.1,-(jet?5:3),jet?1.5:.8,jet?.9:.6,jet?2:1,'#202d34');
    box(sign*(jet?28:7),cy+1,-(jet?8:7),.5,.4,.5,sign<0?'#e95359':'#80dca1',emissive);
   }
   const tail=jet?-25:-9;tri([0,cy,tail+6],[0,cy+(jet?11:5),tail-1],[0,cy,tail-3],s.color);tri([.12,cy,tail-3],[.12,cy+(jet?11:5),tail-1],[.12,cy,tail+6],s.color);
   quad([-r*.65,cy+r*.65,len*.38],[r*.65,cy+r*.65,len*.38],[r*.5,cy+r*.9,len*.29],[-r*.5,cy+r*.9,len*.29],'#34596a');
   if(!jet){tube([[-11,cy,.65],[-9,cy,.8]],'#35434d',8);tube([[2,cy+1,.1],[3,cy+1,.8],[6,cy+1,.6],[7,cy+1,.1]],'#3e6577',8);box(0,cy+4.1,-9,.16,.7,1,'#c7d5df');
    // Small blue/white tail roundels suggest the Taiwan concept fleet without
    // claiming a precise operational aircraft, serial number or squadron.
    for(const sign of [-1,1])for(let j=0;j<12;j++){const a=j/12*Math.PI*2,b=(j+1)/12*Math.PI*2;tri([sign*.16,cy+2.1,-9.5],[sign*.16,cy+2.1+Math.cos(a)*.65,-9.5+Math.sin(a)*.65],[sign*.16,cy+2.1+Math.cos(b)*.65,-9.5+Math.sin(b)*.65],'#254b85');tri([sign*.17,cy+2.1,-9.5],[sign*.17,cy+2.1+Math.cos(a)*.46,-9.5+Math.sin(a)*.46],[sign*.17,cy+2.1+Math.cos(b)*.2,-9.5+Math.sin(b)*.2],'#e9eeee');}
   }
   box(0,0,len*.32,.5,jet?3:1.5,.5,'#728089');box(0,.1,len*.32,.8,.7,1,'#202d34');
  }else{
   const half=s.d/2,b=s.w/2;
   quad([-b,1,-half],[b,1,-half],[b,1,half-5],[0,1,half],'#e0e4db');tri([-b,1,-half],[0,1,half],[ -b,1,half-5],'#e0e4db');
   for(const sign of [-1,1])quad([sign*b,1,-half],[sign*b,1,half-5],[0,-.45,half-2],[sign*(b-1),-.45,-half],'#4b6877');quad([-b,1,-half],[-b+1,-.45,-half],[b-1,-.45,-half],[b,1,-half],'#52707d');
   box(0,1,-2,s.w*.68,s.kind==='riverboat'?3.5:2,s.d*.43,'#c9d5d5');box(0,2.4,-.7,s.w*.7,.8,s.d*.27,'#38586b');box(0,s.kind==='riverboat'?4.6:3.5,-2,s.w*.8,.3,s.d*.46,'#e0e7de');
   if(s.kind==='sailboat'){box(0,1,-1,.22,17,.22,'#b8c8d0');tri([.15,17,-1],[.15,3,9],[.15,3,-1],'#d6dac9');tri([-.15,16,-1],[-.15,3,-1],[-.15,3,-10],'#a3bfc9');}
   if(s.kind==='riverboat')box(0,5,-3,s.w*.65,1.8,s.d*.3,'#a9b9bf');
   for(const sign of [-1,1])box(sign*(b-.4),1.3,half-6,.35,.35,.5,sign<0?'#f57a6b':'#96e3bd',emissive);
  }
 }
 return result;
}
const api={build,plan,footprint,raceClearance,WATER_Y,APRON_Y};if(typeof module==='object')module.exports=api;else root.CircuitLife=api;
})(typeof window==='object'?window:globalThis);
