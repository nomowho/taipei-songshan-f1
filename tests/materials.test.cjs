const {readFileSync}=require('node:fs');const {join}=require('node:path');
const vm=require('node:vm');const test=require('node:test');const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const env={Math,cos:Math.cos,sin:Math.sin,PI:Math.PI,RGB:()=>[1,1,1]};
vm.runInNewContext(html.slice(html.indexOf('function createMesh()'),html.indexOf('// Catmull-Rom')),env);
test('ground and rooftop normals face the sky so overhead light illuminates them',()=>{
 const mesh=env.createMesh();mesh.flatrect(0,0,10,10,0,'#ffffff');
 assert.ok(mesh.arr[4]>.99,'ground points upward');
 const building=env.createMesh();building.box(0,0,0,10,20,10,'#ffffff',true);
 const top=building.arr.filter((_,i)=>i%12===4).slice(-6);assert.ok(top.every(n=>n>.99),'roof points upward');
});
test('building side normals point away from its center',()=>{
 const m=env.createMesh();m.box(0,0,0,10,20,10,'#ffffff',true);
 for(let i=0;i<24*12;i+=12)assert.ok(m.arr[i]*m.arr[i+3]+m.arr[i+2]*m.arr[i+5]>0);
});

test('rounded tree crowns have outward normals',()=>{
 const m=env.createMesh();m.crown(0,0,0,5,5,5,'#ffffff');
 for(let i=0;i<m.arr.length;i+=12){
  const dot=m.arr[i]*m.arr[i+3]+m.arr[i+1]*m.arr[i+4]+m.arr[i+2]*m.arr[i+5];
  assert.ok(dot>=0,'foliage surface must receive outside lighting');
 }
});

test('original material atlas is deterministic, opaque, and varied',()=>{
 const {atlasData}=require('../materials.js');const a=atlasData().data,b=atlasData().data;
 assert.equal(a.length,512*512*4);assert.deepEqual(a,b);
 for(let i=3;i<a.length;i+=4)assert.equal(a[i],255);
 assert.ok(new Set(a.filter((_,i)=>i%4===0)).size>40,'surface grain must have tonal variation');
});
