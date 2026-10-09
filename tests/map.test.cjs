const {readFileSync}=require('node:fs');const vm=require('node:vm');const test=require('node:test');const assert=require('node:assert/strict');
const context={window:{}};vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../data/taipei-map.js'),'utf8'),context);const map=context.window.TaipeiMapData;
test('mapped road network includes real Taipei streets rather than a generated grid',()=>{
 const names=map.roads.map(r=>r[1]);for(const name of ['民生東路','敦化北路','南京東路','復興北路','濱江街'])assert.ok(names.some(n=>n.includes(name)),name);
 assert.ok(map.roads.length>1000);assert.ok(map.rivers.length>0);
});
test('map roof triangles cover each actual footprint and heights retain their provenance',()=>{
 const area=(a,b,c)=>((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
 for(const [id,p,h,source,tri] of map.buildings){
  assert.ok(h>=4&&h<=350);assert.ok(['height','levels','estimated'].includes(source));
  const polygon=p.reduce((s,a,i)=>s+(a[0]*p[(i+1)%p.length][1]-p[(i+1)%p.length][0]*a[1])/2,0);
  let roof=0;for(let i=0;i<tri.length;i+=3)roof+=area(p[tri[i]],p[tri[i+1]],p[tri[i+2]]);
  assert.ok(Math.abs(roof-polygon)<.01,`roof ${id} covers footprint without crossed fan triangles`);
 }
 assert.ok(new Set(map.buildings.map(b=>b[2])).size>100);
});
test('map projection keeps north/east orientation and reference runway centre',()=>{
 assert.ok(map.projection.xMetersPerDegree>100000&&map.projection.xMetersPerDegree<102000);
 assert.equal(map.projection.zMetersPerDegree,111320);assert.equal(map.projection.runwayZ,100);
 assert.ok(map.origin[0]>121.55&&map.origin[0]<121.56);
});

test('cleared spectator corridor follows the near riverbank and preserves opposite-bank buildings',()=>{
 const city=require('../city.js'),ring=(x,z)=>[[x-5,z-5],[x+5,z-5],[x+5,z+5],[x-5,z+5]];
 assert.ok(city.riverShore(map,0)>650&&city.riverShore(map,0)<700);
 assert.equal(city.omitBuilding(map,1,ring(0,450),{}),true);
 assert.equal(city.omitBuilding(map,1,ring(0,900),{}),false);
 assert.equal(city.omitBuilding(map,1,ring(0,-700),{}),false);
 assert.equal(city.omitBuilding(map,1,ring(850,480),{}),false,'north of near bank must not be cleared as the airport corridor');
 const places=require('../landmarks.js').places;
 for(const p of Object.values(places))assert.equal(city.omitBuilding(map,1,ring(p.x,p.z),places),true);
});
