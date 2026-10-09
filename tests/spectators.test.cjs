const test=require('node:test'),assert=require('node:assert/strict');
const {readFileSync}=require('node:fs'),{join}=require('node:path'),vm=require('node:vm');
const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const env={Math,cos:Math.cos,sin:Math.sin,PI:Math.PI,RGB:hex=>hex.replace('#','').match(/../g).map(s=>parseInt(s,16)/255)};
vm.runInNewContext(html.slice(html.indexOf('function createMesh()'),html.indexOf('// Catmull-Rom')),env);
const mapContext={window:{}};vm.runInNewContext(readFileSync(join(__dirname,'../data/taipei-map.js'),'utf8'),mapContext);const mapData=mapContext.window.TaipeiMapData;
function build(){const api=require('../circuit-spectators.js'),base=env.createMesh(),objects=env.createMesh(),emissive=env.createMesh();return {api,result:api.build(base,objects,emissive,mapData),base,objects,emissive};}
test('six grandstands and four spectator hills fit beside the actual racing surface',()=>{
 const {api,result}=build();assert.equal(result.sites.filter(s=>s.kind==='grandstand').length,6);assert.equal(result.sites.filter(s=>s.kind==='hill').length,4);
 for(const s of result.sites){assert.ok(s.clearance>=12,`${s.id} road clearance ${s.clearance}`);assert.ok(Math.abs(api.roadClearance(s.footprint)-s.clearance)<1e-8);assert.ok(s.riverClearance>=8);assert.ok(s.mapRoadClearance>=5);assert.ok(s.footprint.every(p=>p[1]<=650&&p[1]>-280));}
});
test('spectator mesh uses finite outward/upward normals, green slopes, roofs and night lighting within budget',()=>{
 const {result,base,objects,emissive}=build(),meshes=[base,objects,emissive];let triangles=0;
 for(const mesh of meshes){triangles+=mesh.arr.length/36;for(let i=0;i<mesh.arr.length;i+=12){const v=mesh.arr.slice(i,i+12);assert.ok(v.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...v.slice(3,6))-1)<1e-6);assert.ok(result.sites.some(s=>Math.abs(v[0]-s.x)<=s.w/2+4.01&&Math.abs(v[2]-s.z)<=s.d/2+4.01),'rendered geometry stays inside validated footprints');}}
 assert.ok(triangles>3000&&triangles<16000);assert.ok(result.crowdCount>=600);assert.ok(emissive.arr.length>200);
 for(let i=0;i<base.arr.length;i+=12)assert.ok(base.arr[i+4]>.1,'hill terrain and site aprons face upward');
 assert.ok(objects.arr.some((v,i)=>i%12===11&&v===8),'metal canopies');
});
test('the same spectator construction works with the polygon fallback adapter',()=>{
 const api=require('../circuit-spectators.js');let faces=0;
 const adapter={tri:(...args)=>{assert.equal(args.length,5);faces++;},quad:(...args)=>{assert.equal(args.length,6);faces++;}};
 const result=api.build(adapter,adapter,adapter,mapData);assert.equal(result.sites.length,10);assert.ok(faces>1800);
});
test('all spectator footprints clear retained OSM roads including elevated expressways',()=>{
 const {api,result}=build(),city=require('../city.js');
 for(const s of result.sites)for(const [id,name,kind,width,y,line] of mapData.roads)for(let i=1;i<line.length;i++){
  const a=line[i-1],b=line[i];if(city.inConcept((a[0]+b[0])/2,(a[1]+b[1])/2))continue;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!length)continue;
  const nx=-(b[1]-a[1])/length*width/2,nz=(b[0]-a[0])/length*width/2;
  const road=[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]];
  assert.ok(api.polygonDistance(s.footprint,road)>=4.99999,`${s.id} intersects ${name} (${id}), elevation ${y}`);
 }
});
test('road clearance includes long segment crossings and endpoint road width',()=>{
 const api=require('../circuit-spectators.js'),footprint=[[-2,-2],[2,-2],[2,2],[-2,2]];
 const layout={track:[[-20,0],[20,0],[20,30],[-20,30]],widthAt:()=>24};assert.equal(api.roadClearance(footprint,layout),-12);
 const beside=[[-2,18],[2,18],[2,21],[-2,21]];assert.equal(api.roadClearance(beside,layout),-3);
});
test('spectator footprints avoid real OSM riverbanks and every existing runoff polygon',()=>{
 const {api,result}=build(),data={window:{}};vm.runInNewContext(readFileSync(join(__dirname,'../data/taipei-map.js'),'utf8'),data);
 for(const s of result.sites){for(const runoff of require('../circuit-scene.js').runoffs)assert.ok(api.polygonDistance(s.footprint,runoff.points)>=8);
  for(const line of data.window.TaipeiMapData.rivers)for(let i=1;i<line.length;i++){
   const a=line[i-1],b=line[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length*117.5,nz=(b[0]-a[0])/length*117.5;
   assert.ok(api.polygonDistance(s.footprint,[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]])>=8,`${s.id} clears the actual riverbank`);
  }
 }
});
