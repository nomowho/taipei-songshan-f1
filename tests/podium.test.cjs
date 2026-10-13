const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../circuit-podium.js'),S=require('../circuit-spectators.js'),L=require('../circuit.js');
test('awards pavilion fits between paddock and terminal without blocking track or mapped roads',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../data/taipei-map.js'),'utf8'),c);const s=api.plan(),p=S.rect(s.x,s.z,s.w,s.d);
 assert.ok(S.roadClearance(p)>50);assert.ok(S.pitClearance(p)>100);assert.ok(S.buildingClearance(p,c.window.TaipeiMapData)>40);assert.ok(S.streetClearance(p,c.window.TaipeiMapData)>100);
 assert.deepEqual(s.podiums.map(p=>p.rank),[2,1,3]);assert.ok(s.podiums[1].h>s.podiums[0].h&&s.podiums[0].h>s.podiums[2].h);
});
test('shared curved stage and trophy are finite, grounded and inside their mapped free space',()=>{
 const points=[];let triangles=0,lights=0;const mesh={tri:(a,b,c)=>{points.push(a,b,c);triangles++;},quad:(a,b,c,d)=>{points.push(a,b,c,d);triangles+=2;},box:(x,y,z,w,h,d)=>{triangles+=12;for(const u of [-1,1])for(const v of [-1,1])for(const t of [0,1])points.push([x+u*w/2,y+t*h,z+v*d/2]);}};
 const glow={...mesh,quad:(...args)=>{lights++;mesh.quad(...args);},box:(...args)=>{lights++;mesh.box(...args);}};const s=api.build(mesh,mesh,glow);
 assert.ok(triangles<8500);assert.ok(lights>150);
 for(const p of points){assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(p[0]-s.x)<=s.w/2+.001);assert.ok(Math.abs(p[2]-s.z)<=s.d/2+.001);assert.ok(p[1]>=-5-.001);}
 assert.equal(Math.min(...points.map(p=>p[1])),-5);assert.ok(Math.max(...points.map(p=>p[1]))>40);
});
