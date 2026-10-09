const {readFileSync}=require('fs'),{join}=require('path'),vm=require('vm'),test=require('node:test'),assert=require('node:assert/strict');
const design=require('../paddock.js'),{teams,signRows}=require('../teams.js');const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const env={Math,cos:Math.cos,sin:Math.sin,PI:Math.PI,RGB:hex=>hex.replace('#','').match(/../g).map(s=>parseInt(s,16)/255)};vm.runInNewContext(html.slice(html.indexOf('function createMesh()'),html.indexOf('// Catmull-Rom')),env);
test('curved roof remains above garages, with continuous normalized outward lighting normals',()=>{
 let low=Infinity,high=-Infinity;
 for(let i=0;i<=96;i++)for(let j=0;j<=12;j++){const p=design.roofPoint(i/96,j/12),n=design.roofNormal(i/96,j/12);assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...n)-1)<1e-8);assert.ok(n[1]>.8);low=Math.min(low,p[1]);high=Math.max(high,p[1]);}
 assert.ok(low>26);assert.ok(high-low>15);assert.ok(high<59,'raised Taipei sign clears all roof points');
});
test('all 2026 teams have unique atlas slots and non-overlapping pit service boxes',()=>{
 assert.equal(teams.length,11);assert.equal(new Set(teams.map(t=>t.name)).size,11);assert.ok(teams.some(t=>t.name==='AUDI'));assert.ok(teams.some(t=>t.name==='CADILLAC'));
 for(let i=0;i<teams.length;i++){assert.ok(teams[i].sign<signRows);assert.ok(teams[i].z+12<38.5,'pit nameplate stays outside the through lane');if(i)assert.ok(teams[i].x-teams[i-1].x>26);}
});
test('detailed racing model keeps all four exposed wheels grounded after translation, rotation and 3x scaling',()=>{
 const model=design.createRaceCar(env.createMesh,teams[0]),target=env.createMesh();design.appendCar(target,model,50,80,Math.PI/2,3,2.4);
 let bottom=Infinity,top=-Infinity;for(let i=0;i<target.arr.length;i+=12){assert.ok(target.arr.slice(i,i+12).every(Number.isFinite));bottom=Math.min(bottom,target.arr[i+1]);top=Math.max(top,target.arr[i+1]);}
 assert.ok(Math.abs(bottom-2.4)<1e-8);assert.ok(top>6.5);assert.ok(model.arr.length/12>1000,'model includes detailed exposed tires and wings');
 for(const x of [-1.86,1.78])for(const z of [-1.08,1.08]){let near=[];for(let i=0;i<model.arr.length;i+=12)if(Math.abs(model.arr[i]-x)<.01&&Math.abs(model.arr[i+2]-z)<.3)near.push(model.arr[i+1]);assert.ok(near.some(y=>Math.abs(y)<1e-8),'each wheel has a ground-contact vertex');}
});
