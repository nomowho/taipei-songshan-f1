const {readFileSync}=require('node:fs'),{join}=require('node:path'),vm=require('node:vm');
const test=require('node:test'),assert=require('node:assert/strict');
// Exercise the renderer's real mesh, so adapter mistakes cannot hide behind a stub.
const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const env={Math,cos:Math.cos,sin:Math.sin,PI:Math.PI,RGB:hex=>hex.replace('#','').match(/../g).map(s=>parseInt(s,16)/255)};
vm.runInNewContext(html.slice(html.indexOf('function createMesh()'),html.indexOf('// Catmull-Rom')),env);
function build(){const file=join(__dirname,'../landmarks.js');assert.ok(require('node:fs').existsSync(file),'landmark builder must exist');const landmarks=require(file),mesh=env.createMesh();landmarks.build(mesh);const rendered=Array.from({length:mesh.arr.length/12},(_,i)=>mesh.arr.slice(i*12,i*12+12));
 // Existing architectural checks use native dimensions; the separate scale test
 // verifies every rendered vertex, including the mall, terraces and side roofs.
 const vertices=rendered.map(v=>{const p=v[0]>=0?landmarks.places.miramar:landmarks.places.grandHotel,s=p.displayScale||1;return [p.x+(v[0]-p.x)/s,-8+(v[1]+8)/s,p.z+(v[2]-p.z)/s,...v.slice(3)];});return {landmarks,vertices,rendered};}
function bounds(vertices){return [0,1,2].map(i=>[Math.min(...vertices.map(p=>p[i])),Math.max(...vertices.map(p=>p[i]))]);}
test('both complete landmarks render at exactly five times native size about their geographic ground anchors',()=>{
 const {landmarks,rendered}=build();
 for(const p of Object.values(landmarks.places))assert.equal(p.displayScale,5);
 assert.ok(Math.abs(landmarks.places.miramar.x-525.1834315760998)<1e-8);assert.ok(Math.abs(landmarks.places.miramar.z-1570.297862000064)<1e-8);
 assert.ok(Math.abs(landmarks.places.grandHotel.x+2633.640962633572)<1e-8);assert.ok(Math.abs(landmarks.places.grandHotel.z-1115.9118860002839)<1e-8);
 const native=env.createMesh();try{for(const p of Object.values(landmarks.places))p.displayScale=1;landmarks.build(native);}finally{for(const p of Object.values(landmarks.places))p.displayScale=5;}
 assert.equal(native.arr.length,rendered.length*12,'scaling adds no geometry');
 for(let i=0;i<rendered.length;i++){
  const original=native.arr.slice(i*12,i*12+12),p=original[0]>=0?landmarks.places.miramar:landmarks.places.grandHotel;
  const want=[p.x+5*(original[0]-p.x),-8+5*(original[1]+8),p.z+5*(original[2]-p.z)];
  for(let axis=0;axis<3;axis++)assert.ok(Math.abs(rendered[i][axis]-want[axis])<1e-8,'uniform size and fixed geographic centre');
  for(let axis=3;axis<12;axis++)assert.ok(Math.abs(rendered[i][axis]-original[axis])<1e-8,'normals, UVs and materials are preserved');
 }
 for(const p of Object.values(landmarks.places)){
  const b=bounds(rendered.filter(v=>p===landmarks.places.miramar?v[0]>=0:v[0]<0)),flat=[b[0][0],b[2][0],b[0][1],b[2][1]];
  flat.forEach((n,i)=>assert.ok(Math.abs(n-p.displayBounds[i])<1e-8,'bounds cover the actual rendered mesh'));
  assert.deepEqual(p.verticalBounds,b[1]);assert.ok(p.labelY>b[1][1]+20,'labels clear the enlarged silhouette');
 }
});
test('landmark mesh remains finite, correctly normalized and affordable',()=>{
 const {vertices}=build();assert.ok(vertices.length>12000);assert.ok(vertices.length<100000,'static landmarks must not dominate the city mesh');
 for(const v of vertices){assert.ok(v.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...v.slice(3,6))-1)<1e-6,'no zero-area triangles');}
});
test('wheel is northeast and hotel northwest at their mapped Taipei locations',()=>{
 const {landmarks,vertices}=build(),wheel=vertices.filter(v=>v[0]>0),hotel=vertices.filter(v=>v[0]<0);
 const wb=bounds(wheel),hb=bounds(hotel);
 assert.ok(wb[0][0]>380&&wb[0][1]<620);assert.ok(wb[2][0]>1490&&wb[2][1]<1710);
 assert.ok(wb[1][1]>91&&wb[1][1]<96,'100 m wheel above scene ground -8');
 assert.ok(hb[0][0]>-2820&&hb[0][1]<-2450);assert.ok(hb[2][0]>930&&hb[2][1]<1300);assert.ok(hb[1][1]>100&&hb[1][1]<135);
 for(const place of Object.values(landmarks.places)){
  assert.ok(Number.isFinite(place.x)&&Number.isFinite(place.z));assert.ok(place.exclude.osmIds.length);
  assert.ok(place.exclude.bounds.every(Number.isFinite));
 }
});
test('48 upright glazed gondolas surround both sides of the wheel with structural and night materials',()=>{
 const {vertices}=build(),wheel=vertices.filter(v=>v[0]>0),glass=wheel.filter(v=>v[11]===10);
 // Each separate gondola has a unique level x/y centre. Detect actual glass faces,
 // rather than trusting a metadata count that could diverge from the model.
 const cabinCenters=new Set();
 for(let i=0;i<glass.length;i+=30){const cabin=glass.slice(i,i+30);assert.equal(cabin.length,30);const b=bounds(cabin);assert.ok(b[1][1]-b[1][0]<2.8);cabinCenters.add(((b[0][0]+b[0][1])/2).toFixed(3)+':'+((b[1][0]+b[1][1])/2).toFixed(3));}
 assert.equal(cabinCenters.size,48);
 assert.ok(bounds(glass)[1][0]>20.3,'lowest cabin clears the rooftop boarding deck');
 assert.ok(wheel.some(v=>v[11]===8));assert.ok(wheel.some(v=>v[11]===12));
 const leds=wheel.filter(v=>v[11]===12);assert.ok(new Set(leds.map(v=>v.slice(6,9).join(','))).size>=4);
 const b=bounds(leds);assert.ok(b[0][1]-b[0][0]>60&&b[1][1]-b[1][0]>65,'lighting follows the wheel perimeter');
});
test('hotel retains fourteen balcony levels and red columns with a swept gold hip roof',()=>{
 const {vertices}=build(),hotel=vertices.filter(v=>v[0]<0),red=hotel.filter(v=>v[6]>.45&&v[7]<.22&&v[8]<.20),gold=hotel.filter(v=>v[6]>.65&&v[7]>.4&&v[8]<.4&&v[1]>90);
 assert.ok(red.length>1000);assert.ok(bounds(red)[1][1]-bounds(red)[1][0]>55);
 assert.ok(gold.length>3000,'roof has curved surfaces rather than one flat pyramid');
 const ledLevels=new Set(hotel.filter(v=>v[11]===12).map(v=>v[1].toFixed(2)));assert.ok(ledLevels.size>=14,'all balcony levels carry warm light details');
 const b=bounds(gold);assert.ok(b[0][1]-b[0][0]>125&&b[2][1]-b[2][0]>65);
 const roof=gold.filter(v=>v[1]>100&&Math.abs(v[4])>.2);assert.ok(roof.filter(v=>v[4]>0).length/roof.length>.8,'main roof lighting normals point toward the sky');
});

test('entrance and side-wing roofs sit over their own podiums',()=>{
 const {vertices,landmarks}=build(),h=landmarks.places.grandHotel,a=22*Math.PI/180;
 const roofs=vertices.filter(v=>v[0]<0&&v[1]>37&&v[1]<47&&v[6]>.65&&v[7]>.4&&v[8]<.4).map(v=>{
  const x=v[0]-h.x,z=v[2]-h.z;return [Math.cos(a)*x-Math.sin(a)*z,Math.sin(a)*x+Math.cos(a)*z];
 });
 assert.ok(roofs.filter(v=>v[1]<-40&&Math.abs(v[0])<28).length>500,'entrance canopy is south of tower');
 for(const x of [-77,77])assert.ok(roofs.filter(v=>Math.abs(v[0]-x)<15).length>500,'wing roof aligns with wing');
});
