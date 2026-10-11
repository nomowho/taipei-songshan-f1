const test=require('node:test'),assert=require('node:assert/strict');
let layout;try{layout=require('../circuit.js')}catch{}
test('C1 reference shape has measured length, 22 turns and a compact pit lane',()=>{
 assert.ok(layout,'shared A1 circuit module must exist');
 assert.ok(Math.abs(layout.length-7411.184)<.1);assert.equal(layout.turns.length,22);
 assert.ok(layout.pitLength>=400&&layout.pitLength<=500);assert.equal(layout.grid.length,22);
 assert.equal(layout.laps,42);assert.ok(layout.laps*layout.length>305000);
});
test('route closes, extends to terminal and riverbank and avoids terminal footprint including road width',()=>{
 assert.ok(layout,'shared A1 circuit module must exist');
 for(const p of layout.track){assert.ok(p.every(Number.isFinite));assert.ok(p[0]>-1600&&p[0]<1650&&p[1]>-450&&p[1]<700);
   // Main terminal roof spans x -845..-45, z -418.5..-331.5.
   const d=Math.hypot(Math.max(Math.abs(p[0]+445)-400,0),Math.max(Math.abs(p[1]+375)-43.5,0));assert.ok(d>layout.widthAt(p)/2+8);
 }
 const a=layout.locate(0),b=layout.locate(1),c=layout.locate(-.25),d=layout.locate(.75);
 assert.deepEqual(a,b);assert.deepEqual(c,d);assert.ok(Math.abs(a[0]-550)<.01&&Math.abs(a[1]+180)<.01);
});
test('distance and time traversal stay continuous at lap boundary and slow at hairpin',()=>{
 assert.ok(layout,'shared A1 circuit module must exist');
 const a=layout.atTime(0),b=layout.atTime(layout.lapSeconds);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<.01);
 const slow=Math.min(...layout.speeds)*3.6;
 assert.ok(slow>40&&slow<140,`hairpin speed ${slow}`);assert.ok(layout.lapSeconds>130&&layout.lapSeconds<160);
});
test('same physical layout has no non-adjacent centerline crossings',()=>{
 assert.ok(layout,'shared A1 circuit module must exist');const p=layout.track;
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++){
  if(i===0&&j===p.length-1)continue;const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];
  if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;
  assert.ok(!(cross(a,b,c)*cross(a,b,d)<-1e-9&&cross(c,d,a)*cross(c,d,b)<-1e-9),`crossing segments ${i}/${j}`);
 }
});

// Verify the actual surface winding consumed by createMesh (negative cross).
test('road, runoff and both curbs face upward for lighting',()=>{
 const scene=require('../circuit-scene.js'),triangles=[];
 const mesh={quad(a,b,c,d){triangles.push([a,b,c],[a,c,d])},box(){},path(){},flatrect(){}};
 scene.build(mesh, {quad(){},box(){}},{box(){}});
 for(const [a,b,c] of triangles){
  const normalY=(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
  assert.ok(normalY>0,'ground top normal must point upward');
 }
});

test('fallback road remains above nearby runoff and grid stays above road',()=>{
 const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const source=html.match(/draw\.sort\((.*?)\);let lim/)[1];
 const compare=require('node:vm').runInNewContext(source);
 const polygons=[{id:'grid',layer:1,groundY:2.12,z:600},{id:'road',layer:1,groundY:1.65,z:500},{id:'runoff',layer:1,groundY:1.1,z:200},{id:'ground',layer:0,groundY:-13,z:10}];
 polygons.sort(compare);assert.deepEqual(polygons.map(p=>p.id),['ground','runoff','road','grid']);
});

test('road width varies smoothly between technical bends, straights and starting grid',()=>{
 const widths=layout.track.map(layout.widthAt);assert.ok(Math.min(...widths)>=16&&Math.min(...widths)<20);assert.ok(Math.max(...widths)>39&&Math.max(...widths)<42);
 for(let i=1;i<widths.length;i++)assert.ok(Math.abs(widths[i]-widths[i-1])<1,'no abrupt edge steps');
 assert.ok(Math.max(...layout.track.map(p=>p[1]))>630);assert.ok(Math.min(...layout.track.map(p=>p[1]))<-300);
});
test('expanded track stays on the near river bank and leaves room around terminal jetways',()=>{
 const fs=require('fs'),vm=require('vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../data/taipei-map.js'),'utf8'),ctx);
 const distance=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)};
 for(const p of layout.track){const half=layout.widthAt(p)/2;for(const line of ctx.window.TaipeiMapData.rivers)for(let i=1;i<line.length;i++)assert.ok(distance(p,line[i-1],line[i])-89>half+4,`water overlap ${p}`);
 for(let x=-795;x<=-140;x+=88){const d=Math.hypot(Math.max(0,Math.abs(p[0]-x)-22),Math.max(0,Math.abs(p[1]+300)-8));assert.ok(d>half+8,'jetway clearance')}
 }
});
