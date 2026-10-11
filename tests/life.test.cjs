const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const api=require('../circuit-life.js'),L=require('../circuit.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/taipei-map.js'),'utf8'),ctx);const data=ctx.window.TaipeiMapData;
function segmentDistance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
test('five aircraft clear curved race and pit surfaces, terminal massing and airbridges',()=>{
 const result=api.plan(data);assert.equal(result.aircraft.filter(s=>s.kind==='passenger').length,3);assert.equal(result.aircraft.filter(s=>s.kind==='fighter').length,2);
 const terminal=[[-845,-418.5,-45,-331.5],[-450,-363.5,30,-326.5],[-940,-384.5,-820,-329.5],[-208,-437,-32,-363],[-815,-440,-605,-380],[845,-414.5,1162.5,-331]];
 for(let x=-795;x<=-140;x+=88)terminal.push([x-4,-346,x+4,-294],[x-22,-307.5,x+22,-292.5]);
 for(const s of result.aircraft){assert.ok(s.raceClearance>15,`${s.id}: ${s.raceClearance}`);for(const p of s.footprint){assert.ok(Math.min(...L.pit.slice(1).map((b,i)=>segmentDistance(p,L.pit[i],b)))>20);}
  const xs=s.footprint.map(p=>p[0]),zs=s.footprint.map(p=>p[1]);for(const [xmin,zmin,xmax,zmax] of terminal)assert.ok(Math.max(...xs)<xmin-5||Math.min(...xs)>xmax+5||Math.max(...zs)<zmin-5||Math.min(...zs)>zmax+5,`${s.id} terminal clearance`);
 }
});
test('five diverse craft fit on water and clear bridge roads and race surfaces',()=>{
 const {vessels}=api.plan(data);assert.equal(vessels.length,5);assert.equal(new Set(vessels.map(s=>s.kind)).size,4);
 for(const s of vessels){assert.equal(s.y,-7);assert.ok(s.raceClearance>15);const radius=Math.hypot(s.w,s.d)/2;assert.ok(radius<30);
  for(const p of s.footprint)assert.ok(segmentDistance(p,...s.riverSegment)<89-10);
  for(const road of data.roads)for(let j=1;j<road[5].length;j++)assert.ok(segmentDistance([s.x,s.z],road[5][j-1],road[5][j])>radius+road[3]/2+12);
 }
});
test('shared geometry is finite, stays inside validated footprints, has lighting and bounded cost',()=>{
 let triangles=0,lights=0;const vertices=[];
 const mesh={tri:(a,b,c,color,type)=>{triangles++;vertices.push(a,b,c);},quad:(a,b,c,d,color,type)=>{triangles+=2;vertices.push(a,b,c,d);}};
 const glow={tri:mesh.tri,quad:(...args)=>{lights++;mesh.quad(...args);}};
 const result=api.build(mesh,mesh,glow,data);assert.ok(triangles>500&&triangles<2500);assert.ok(lights>=20);
 for(const p of vertices){assert.ok(p.every(Number.isFinite));assert.ok([...result.aircraft,...result.vessels].some(s=>{const dx=p[0]-s.x,dz=p[2]-s.z,u=dx*Math.cos(s.angle)+dz*Math.sin(s.angle),v=-dx*Math.sin(s.angle)+dz*Math.cos(s.angle);return Math.abs(u)<=s.w/2+.001&&Math.abs(v)<=s.d/2+.001;}),'vertex outside footprint');}
});
test('each rendered aircraft rests at the WebGL apron elevation, with no buried geometry',()=>{
 const vertices=[],mesh={tri:(a,b,c)=>vertices.push(a,b,c),quad:(a,b,c,d)=>vertices.push(a,b,c,d)};
 const result=api.build(mesh,mesh,mesh,data);assert.equal(api.APRON_Y,-3);
 for(const s of result.aircraft){const own=vertices.filter(p=>{const dx=p[0]-s.x,dz=p[2]-s.z;return Math.abs(dx*Math.cos(s.angle)+dz*Math.sin(s.angle))<=s.w/2+.001&&Math.abs(-dx*Math.sin(s.angle)+dz*Math.cos(s.angle))<=s.d/2+.001;});assert.ok(own.length>100);assert.equal(Math.min(...own.map(p=>p[1])),api.APRON_Y,`${s.id} sits at apron`);assert.ok(own.every(p=>p[1]>=api.APRON_Y),'no buried wheels or intake');}
});
