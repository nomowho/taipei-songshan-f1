const test=require('node:test'),assert=require('node:assert/strict');
const market=require('../circuit-market.js'),L=require('../circuit.js');
test('ten stalls include six snacks and four bakeries, with open garage access',()=>{
 const stalls=market.plan();assert.equal(stalls.length,10);assert.equal(new Set(stalls.map(s=>s.id)).size,10);
 assert.equal(stalls.filter(s=>s.kind==='snack').length,6);assert.equal(stalls.filter(s=>s.kind==='bakery').length,4);
 for(const s of stalls)assert.ok(s.x+9<420||s.x-9>790,'keep garage and pit-box frontage open');
});
test('all market geometry clears the race road, pit lane and paddock facade',()=>{
 const points=[];let triangles=0,lit=0;
 const mesh={tri:(...args)=>{points.push(...args.slice(0,3));triangles++;},quad:(...args)=>{points.push(...args.slice(0,4));triangles+=2;},box:(x,y,z,w,h,d)=>{triangles+=12;for(const a of [-1,1])for(const b of [-1,1])for(const c of [0,1])points.push([x+a*w/2,y+c*h,z+b*d/2]);},flatrect:(x,z,w,d,y)=>{triangles+=2;for(const a of [-1,1])for(const b of [-1,1])points.push([x+a*w/2,y,z+b*d/2]);}};
 const glow={...mesh,quad:(...a)=>{lit++;mesh.quad(...a);},box:(...a)=>{lit++;mesh.box(...a);}};
 market.build(mesh,mesh,glow);
 assert.ok(triangles<16000,'bounded geometry cost');assert.ok(lit>100,'illuminated service counters and signs');
 for(const p of points){assert.ok(p.every(Number.isFinite));assert.ok(L.roadClearance([p[0],p[2]])>20,'race clearance');assert.ok(L.pitClearance([p[0],p[2]])>12,'pit clearance');assert.ok(p[2]>-269||p[2]<-347,'paddock facade clearance');assert.ok(p[1]>=(p[0]<500?-5:-4),'no buried geometry');}
});

test('souvenir buildings clear mapped streets, airport buildings and each other',()=>{
 const fs=require('fs'),vm=require('vm'),S=require('../circuit-spectators.js'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../data/taipei-map.js'),'utf8'),ctx);
 const {store,booths}=market.merchPlan();assert.equal(booths.length,6);
 const footprints=[S.rect(store.x,store.z,116,48),...booths.map(b=>S.rect(b.x,b.z,20,20))];
 for(const p of footprints){assert.ok(S.buildingClearance(p,ctx.window.TaipeiMapData)>=8);assert.ok(S.streetClearance(p,ctx.window.TaipeiMapData)>15);}
 for(let i=0;i<footprints.length;i++)for(let j=i+1;j<footprints.length;j++)assert.ok(S.polygonDistance(footprints[i],footprints[j])>8);
});
