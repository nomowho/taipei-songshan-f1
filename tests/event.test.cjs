const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../circuit-event.js'),L=require('../circuit.js'),T=require('../teams.js');
test('event furniture stays clear of circuit and pit lane, with readable staff density',()=>{
 const p=E.plan();assert.ok(p.staff.length>=100);assert.ok(p.panels.length>=18);assert.equal(p.unofficial,true);
 for(const s of [...p.staff,...p.panels,...p.supports])assert.ok(E.clearance(s.x,s.z)>4,`${s.role||'furniture'} at ${s.x}, ${s.z}`);
 for(const s of p.staff.filter(s=>s.role==='pit')){const t=T.teams[s.team];assert.equal(Math.abs(s.x-L.paddockOffset.x-t.x),9);assert.ok(Math.abs(s.z-L.paddockOffset.z-24)<=8);}
 assert.equal(p.gantry.underside,22);assert.equal(p.supports.length,2);
 for(const s of p.supports)assert.ok(Math.abs(s.z-L.start[1])>=28);
});
test('five pairs of red lights face west toward approaching cars',()=>{
 const p=E.plan();assert.equal(p.lights.length,10);
 for(let i=0;i<5;i++){const pair=p.lights.filter(l=>l.cluster===i);assert.equal(pair.length,2);assert.equal(pair[0].z,pair[1].z);assert.ok(pair.every(l=>l.x<p.gantry.x&&l.lit));assert.ok(pair[1].y>pair[0].y);}
});
test('both render adapters receive finite geometry within event triangle budget',()=>{
 let triangles=0,red=0;
 const mesh={box(...args){assert.ok(args.slice(0,6).every(Number.isFinite));assert.ok(args.slice(3,6).every(v=>v>0));triangles+=10;},flatrect(...args){assert.ok(args.slice(0,5).every(Number.isFinite));triangles+=2;},quad(...args){assert.ok(args.slice(0,4).flat().every(Number.isFinite));triangles+=2;},tri(...args){assert.ok(args.slice(0,3).flat().every(Number.isFinite));triangles++;if(args[3]==='#ff202b')red++;}};
 const p=E.build(mesh,mesh,mesh);assert.equal(p.staff.length,E.plan().staff.length);assert.equal(red,100);assert.ok(triangles<10000,`${triangles} triangles`);
});
