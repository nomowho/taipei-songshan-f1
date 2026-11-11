const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../circuit-billboards.js'),L=require('../circuit.js');
test('three original images keep their PNG aspect ratio and remain outside the racing surface',()=>{
 assert.equal(B.boards.length,3);
 for(const b of B.boards){
  const png=fs.readFileSync(path.join(__dirname,'..',b.src));
  assert.equal(b.ratio,png.readUInt32BE(16)/png.readUInt32BE(20));
  const f=B.faces(b),points=f.flat();
  for(const p of points){assert.ok(p.every(Number.isFinite));const n=L.nearest([p[0],p[2]]),q=L.track[n];assert.ok(Math.hypot(p[0]-q[0],p[2]-q[1])>L.widthAt(q)/2+10,b.id);}
  assert.ok((b.approach[0]-b.x)*b.n[0]+(b.approach[1]-b.z)*b.n[1]>0);
 }
});
test('both sides read left to right in the existing left-handed camera and keep upright UVs',()=>{
 for(const b of B.boards){let calls=[];B.surface({quad:(...args)=>calls.push(args)},b);assert.equal(calls.length,2);
  calls.forEach((q,i)=>{const side=i===0?1:-1,screenRight=[-b.n[1]*side,b.n[0]*side],dx=q[1][0]-q[0][0],dz=q[1][2]-q[0][2];assert.ok(dx*screenRight[0]+dz*screenRight[1]>0);assert.ok(q[2][1]>q[1][1]);assert.deepEqual(q[6],[[0,0],[1,0],[1,1],[0,1]]);});
 }
});

