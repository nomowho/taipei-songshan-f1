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

test('road clipping removes long crossings with shoulders and preserves opposite-bank and south roads',()=>{
 const city=require('../city.js'),data={rivers:[[[-2500,800],[2500,800]]]};
 assert.deepEqual(city.roadSegments(data,[-2500,0],[2500,0],20),[[[-2500,0],[-1660,0]],[[1710,0],[2500,0]]]);
 assert.deepEqual(city.roadSegments(data,[0,-1000],[0,1200],20),[[[0,-1000],[0,-530]],[[0,733],[0,1200]]]);
 assert.deepEqual(city.roadSegments(data,[-2500,1000],[2500,1000],20),[[[-2500,1000],[2500,1000]]]);
 assert.deepEqual(city.roadSegments(data,[-2500,-700],[2500,-700],20),[[[-2500,-700],[2500,-700]]]);
 assert.deepEqual(city.roadSegments(data,[0,450],[0,650],25),[]);
 assert.deepEqual(city.roadSegments(data,[2500,0],[-2500,0],20),[[[2500,0],[1710,0]],[[-1660,0],[-2500,0]]]);
});

test('both road renderers share exact segment clipping even for elevated bridges',()=>{
 const city=require('../city.js'),data={rivers:[[[-2500,800],[2500,800]]],parks:[],buildings:[],roads:[[1,'bridge','motorway',24,80,[[0,-1000],[0,1200]]],[2,'bank','primary',12,0,[[-2500,400],[2500,400]]]]};
 const web=[],fallback=[];
 city.build(data,{tri(){},quad(){},path(segment,width,y,color){if(color==='#454c50')web.push(segment)}},{tri(){},quad(){}});
 city.fallback(data,()=>{},(segment,width,y,color)=>{if(color==='#454c50')fallback.push(segment)});
 assert.deepEqual(web,fallback);assert.equal(web.length,4);
 for(const segment of web){const mid=segment[0].map((v,i)=>(v+segment[1][i])/2);assert.equal(city.inConcept(mid[0],mid[1],data),false)}
});

test('clearance follows a sloping river bank and includes newly extended airport edges',()=>{
 const city=require('../city.js'),data={rivers:[[[-2500,1000],[2500,500]]]};
 const parts=city.roadSegments(data,[0,-1000],[0,1200],0);
 assert.ok(Math.abs(parts[1][0][1]-673)<1e-7);
 const ring=(x,z)=>[[x-5,z-5],[x+5,z-5],[x+5,z+5],[x-5,z+5]];
 assert.equal(city.omitBuilding(map,1,ring(1570,-350),{}),true);
 assert.equal(city.omitBuilding(map,1,ring(-1550,-350),{}),true);
 assert.equal(city.omitBuilding(map,1,ring(0,450),{}),true);
 assert.equal(city.omitBuilding(map,1,ring(0,900),{}),false);
});

test('new event parkland leaves the visible river ribbon unobstructed',()=>{
 const city=require('../city.js'),S=require('../circuit-spectators.js'),ground=[];
 const mesh={tri(){},quad(a,b,c,d,color){if(color==='#647d50')ground.push([a,b,c,d].map(p=>[p[0],p[2]]))},path(){}};city.build(map,mesh,mesh);assert.ok(ground.length>50);
 for(const polygon of ground)for(const line of map.rivers)for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!len)continue;const nx=-(b[1]-a[1])/len*89,nz=(b[0]-a[0])/len*89,water=[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]];assert.ok(S.polygonDistance(polygon,water)>0,`parkland overlaps river at ${polygon[0]}`)}
});
