const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../circuit-billboards.js'),L=require('../circuit.js');
test('two remaining billboards use compact 1024px WebP and remain outside the racing surface',()=>{
 assert.deepEqual(B.boards.map(b=>b.id),['green-commute','taipei-speed']);
 let bytes=0;
 for(const b of B.boards){
  const webp=fs.readFileSync(path.join(__dirname,'..',b.src));bytes+=webp.length;
  assert.equal(webp.toString('ascii',0,4),'RIFF');
  assert.equal(webp.toString('ascii',8,12),'WEBP');
  assert.equal(webp.toString('ascii',12,16),'VP8 ');
  const width=webp.readUInt16LE(26)&0x3fff,height=webp.readUInt16LE(28)&0x3fff;
  assert.equal(width,1024);assert.equal(height,576);assert.equal(b.ratio,width/height);
  const f=B.faces(b),points=f.flat();
  for(const p of points){assert.ok(p.every(Number.isFinite));const n=L.nearest([p[0],p[2]]),q=L.track[n];assert.ok(Math.hypot(p[0]-q[0],p[2]-q[1])>L.widthAt(q)/2+10,b.id);}
  assert.ok((b.approach[0]-b.x)*b.n[0]+(b.approach[1]-b.z)*b.n[1]>0);
 }
 assert.ok(bytes<500_000,`billboards total ${bytes} bytes`);
});
test('both sides read left to right in the existing left-handed camera and keep upright UVs',()=>{
 for(const b of B.boards){let calls=[];B.surface({quad:(...args)=>calls.push(args)},b);assert.equal(calls.length,2);
  calls.forEach((q,i)=>{const side=i===0?1:-1,screenRight=[-b.n[1]*side,b.n[0]*side],dx=q[1][0]-q[0][0],dz=q[1][2]-q[0][2];assert.ok(dx*screenRight[0]+dz*screenRight[1]>0);assert.ok(q[2][1]>q[1][1]);assert.deepEqual(q[6],[[0,0],[1,0],[1,1],[0,1]]);});
 }
});

