/* Taipei landmarks: measured map positions, interpretive architectural geometry. */
(function(root){
'use strict';
const PI=Math.PI,GROUND=-8;
function projected(lon,lat){return [(lon-121.55250715)*111320*Math.cos(25.06959915*PI/180),(lat-25.06959915)*111320+100];}
function place(name,lon,lat,ids,geoBounds){const [x,z]=projected(lon,lat),a=projected(geoBounds[0],geoBounds[1]),b=projected(geoBounds[2],geoBounds[3]);return {name,lon,lat,x,z,displayScale:5,exclude:{osmIds:ids,bounds:[a[0],a[1],b[0],b[1]]}};}
const places={
 miramar:place('美麗華摩天輪',121.5577156,25.082807,[155816458],[121.5566439,25.082784,121.5582749,25.0837817]),
 grandHotel:place('圓山大飯店',121.5263883,25.0787252,[25202548],[121.5256799,25.0781821,121.5269049,25.0790551])
};
// All primitives pass through quad/tri: identical geometry in WebGL and Canvas2D.
function localMesh(mesh,place,angle=0){
 const c=Math.cos(angle),s=Math.sin(angle),scale=place.displayScale||1;
 // Local nested roof offsets use scale=1; only the geographic place applies
 // the requested uniform display scale, about its x/z anchor and scene ground.
 const point=p=>[place.x+scale*(c*p[0]-s*p[2]),GROUND+scale*(p[1]-GROUND),place.z+scale*(s*p[0]+c*p[2])];
 const m={quad:(a,b,c,d,color,type=0)=>mesh.quad(point(a),point(b),point(c),point(d),color,type),tri:(a,b,c,color,type=0)=>mesh.tri(point(a),point(b),point(c),color,type)};
 m.box=function(x,y,z,w,h,d,color,type=0){const a=x-w/2,b=x+w/2,l=z-d/2,r=z+d/2,t=y+h;
  m.quad([a,y,l],[b,y,l],[b,t,l],[a,t,l],color,type);m.quad([b,y,r],[a,y,r],[a,t,r],[b,t,r],color,type);
  m.quad([b,y,l],[b,y,r],[b,t,r],[b,t,l],color,type);m.quad([a,y,r],[a,y,l],[a,t,l],[a,t,r],color,type);
  m.quad([a,t,l],[b,t,l],[b,t,r],[a,t,r],color,type);
 };
 return m;
}
function tube(m,a,b,r,color,type=8,sides=6){
 let dir=b.map((v,i)=>v-a[i]),length=Math.hypot(...dir);dir=dir.map(v=>v/length);
 let u=Math.abs(dir[1])<.9?[dir[2],0,-dir[0]]:[1,0,0],ul=Math.hypot(...u);u=u.map(v=>v/ul);
 const v=[dir[1]*u[2]-dir[2]*u[1],dir[2]*u[0]-dir[0]*u[2],dir[0]*u[1]-dir[1]*u[0]];
 function p(t,k){const th=k/sides*PI*2;return a.map((n,i)=>n+dir[i]*length*t+r*(u[i]*Math.cos(th)+v[i]*Math.sin(th)));}
 for(let k=0;k<sides;k++){m.quad(p(0,k),p(1,k),p(1,k+1),p(0,k+1),color,type);m.tri(a,p(0,k),p(0,k+1),color,type);m.tri(b,p(1,k+1),p(1,k),color,type);}
}
function miramar(mesh){
 const m=localMesh(mesh,places.miramar),cy=58.4,radius=34.6,metal='#d4d8d5';
 // Wheel is on the southern rooftop. The block to its north represents the mall.
 m.box(-25,GROUND,52,158,26,109,'#b0afa5');m.box(-25,18,52,160,1.2,111,'#d2cbb4',8);
 for(let floor=0;floor<5;floor++){const y=GROUND+3+floor*4.6;m.box(-25,y,-3,150,2.8,.6,'#445965');m.box(-25,y,107,150,2.8,.6,'#445965');}
 m.box(0,18.5,0,78,1.3,30,'#c8bca6');m.box(0,19.8,0,70,.5,24,'#dfd2b8');
 // Two spaced structural rings, cross ties, and twin-plane spokes remain visible
 // when viewed obliquely; the axle and four support legs give the ring depth.
 function rim(th,z,r=radius){return [Math.cos(th)*r,cy+Math.sin(th)*r,z];}
 const colors=['#ec6682','#9b78e6','#50bdcf','#63c99a','#e9b95e','#e582bc'];
 for(let k=0;k<96;k++)for(const z of [-2.0,2.0]){
  const a=k/96*PI*2,b=(k+1)/96*PI*2;
  tube(m,rim(a,z),rim(b,z),.48,metal,8);
  tube(m,rim(a,z<0?-2.72:2.72,radius+.15),rim(b,z<0?-2.72:2.72,radius+.15),.48,colors[Math.floor(k/16)],12,4);
 }
 for(let k=0;k<24;k++){
  const th=k/24*PI*2;for(const z of [-2,2])tube(m,[0,cy,z],rim(th,z),.16,metal,8,4);
  tube(m,rim(th,-2),rim(th,2),.22,metal,8,4);
 }
 tube(m,[0,cy,-8],[0,cy,8],1.7,'#7c8b93',8,12);
 for(const z of [-7,7])for(const x of [-22,22]){m.box(x,20.5,z,5,2.2,5,'#7d827d');tube(m,[x,22.7,z],[0,cy,z],1.05,metal,8,8);}
 for(const z of [-7,7])tube(m,[-22,28,z],[22,28,z],.45,metal,8);
 // Fixed upright cabins, suspended from the rim. Their flat glass and metal
 // sills remain legible at aerial scale without pretending to be animated.
 for(let k=0;k<48;k++){
  const th=k/48*PI*2,p=rim(th,0,radius),x=p[0],top=p[1]-.65;
  tube(m,[x,p[1],-2.2],[x,p[1],2.2],.18,metal,8,4);
  tube(m,[x,p[1],0],[x,top-.2,0],.13,metal,8,4);
  m.box(x,top-2.4,0,2.25,2.2,2.65,k===12||k===36?'#aed8e2':'#79b6c8',10);
  m.box(x,top-2.65,0,2.45,.3,2.85,colors[Math.floor(k/8)],8);m.box(x,top-.2,0,2.5,.35,2.9,'#f0ede2',8);
  for(const dx of [-1.1,1.1])for(const z of [-1.3,1.3])m.box(x+dx,top-2.4,z,.12,2.2,.12,metal,8);
 }
}
function hipRoof(m,width,depth,eave,height){
 const sides=16,bands=10,halfRidge=width*.29;
 function point(t,k){
  const side=Math.floor((k%(4*sides))/sides),q=(k%sides)/sides;
  let x,z;if(side===0){x=-1+2*q;z=-1;}else if(side===1){x=1;z=-1+2*q;}else if(side===2){x=1-2*q;z=1;}else{x=-1;z=1-2*q;}
  const w=halfRidge+(width/2-halfRidge)*t,d=.45+(depth/2-.45)*t;
  const corner=Math.pow(Math.abs(x*z),4),y=eave+height*Math.pow(1-t,1.5)+3.8*Math.pow(t,8)*corner;
  return [x*w,y,z*d];
 }
 for(let j=0;j<bands;j++)for(let k=0;k<4*sides;k++){
  const a=point(j/bands,k),b=point(j/bands,k+1),c=point((j+1)/bands,k+1),d=point((j+1)/bands,k);
  m.quad(a,d,c,b,j%2?'#d8a24b':'#d2a04a',0);
 }
 m.box(0,eave+height-.35,0,halfRidge*2,.8,1.5,'#e5b65f',0);
 for(let k=0;k<4*sides;k++){
  const a=point(1,k),b=point(1,k+1);tube(m,a,b,.36,'#e2b65f',0,4);
  m.quad([a[0],a[1]-1.2,a[2]],[b[0],b[1]-1.2,b[2]],b,a,'#912d23',0);
 }
}
function grandHotel(mesh){
 const m=localMesh(mesh,places.grandHotel,-22*PI/180),red='#ac3025',stone='#c7b39a',base=32,floorHeight=4.5;
 // Terraced hillside is deliberately schematic; this is not imported terrain.
 for(const [w,d,y,h] of [[260,205,GROUND,14],[222,169,6,12],[186,127,18,10]]){
  const a=[-w/2,y,8-d/2],b=[w/2,y,8-d/2],c=[w/2,y,8+d/2],e=[-w/2,y,8+d/2];
  const aa=[-w/2+11,y+h,18-d/2],bb=[w/2-11,y+h,18-d/2],cc=[w/2-11,y+h,d/2-2],ee=[-w/2+11,y+h,d/2-2];
  m.quad(a,b,bb,aa,'#6b7954');m.quad(b,c,cc,bb,'#64724f');m.quad(c,e,ee,cc,'#60704d');m.quad(e,a,aa,ee,'#71805a');m.quad(aa,bb,cc,ee,'#74815d');
 }
 m.box(0,28,0,158,4,85,stone);m.box(0,base,0,126,63,58,'#543e33');
 for(let f=0;f<14;f++){
  const y=base+f*floorHeight;
  m.box(0,y,0,137,.65,67,'#c5a589');
  for(const z of [-29.2,29.2])m.box(0,y+.7,z,123,2.9,.45,'#687e7f',10);
  for(const x of [-63.2,63.2])m.box(x,y+.7,0,.45,2.9,52,'#687e7f',10);
  // Rails and small repeated balusters give balconies a real facade rhythm.
  for(const z of [-33,33]){
   m.box(0,y+1.65,z,137,.25,.4,stone);m.box(0,y+.77,z,137,.16,.22,'#e3bb73',12);
   for(let x=-65;x<=65;x+=6.5)m.box(x,y+.65,z,.28,1.0,.3,stone);
  }
  for(const x of [-68,68])m.box(x,y+1.65,0,.4,.25,66,stone);
 }
 for(const z of [-31,31])for(let x=-63;x<=63;x+=9)m.box(x,base,z,1.55,63,1.55,red);
 for(const x of [-65.3,65.3])for(let z=-24;z<=24;z+=8)m.box(x,base,z,1.55,63,1.55,red);
 m.box(0,94.2,0,138,1.5,67,red);
 hipRoof(m,154,82,95.7,16.5);
 // Broad entrance canopy, stone stair and smaller gold roofs on podium wings.
 m.box(0,32,-45,44,4.5,18,red);hipRoof(localMesh(m,{x:0,z:-45}),53,23,37,5.5);
 for(const x of [-77,77]){m.box(x,32,0,22,8,70,red);hipRoof(localMesh(m,{x,z:0}),29,78,40,6);}
 for(let j=0;j<10;j++)m.box(0,28+j*.4,-62+j*.9,53,.4,1.1,stone);
}
function build(mesh){miramar(mesh);grandHotel(mesh);return mesh;}
// Measure the generated primitives once so clearance metadata is available
// before the city is constructed. No measurement vertices enter render buffers.
function describe(place,builder){
 const b=[Infinity,Infinity,-Infinity,-Infinity],y=[Infinity,-Infinity];
 function record(points){for(const p of points){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[2]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[2]);y[0]=Math.min(y[0],p[1]);y[1]=Math.max(y[1],p[1]);}}
 builder({quad:(a,b,c,d)=>record([a,b,c,d]),tri:(a,b,c)=>record([a,b,c])});
 place.displayBounds=b;place.verticalBounds=y;place.labelY=y[1]+40;
}
describe(places.miramar,miramar);describe(places.grandHotel,grandHotel);
const api={places,build};if(typeof module==='object'&&module.exports)module.exports=api;else root.CircuitLandmarks=api;
})(typeof window==='object'?window:this);
