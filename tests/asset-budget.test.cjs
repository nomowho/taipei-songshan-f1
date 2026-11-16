const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');

test('active billboard and social preview assets meet the transfer budget',()=>{
 const files=['assets/billboards/taipei-speed.webp','assets/billboards/green-commute.webp','share-preview-night-poster-v3.jpg'];
 const sizes=files.map(file=>fs.statSync(path.join(root,file)).size);
 assert.ok(sizes[0]+sizes[1]<500_000,`billboards: ${sizes[0]+sizes[1]} bytes`);
 assert.ok(sizes[2]<300_000,`social preview: ${sizes[2]} bytes`);
 assert.ok(sizes.reduce((a,b)=>a+b,0)<1_500_000);
 const jpeg=fs.readFileSync(path.join(root,files[2]));
 assert.equal(jpeg.readUInt16BE(0),0xffd8);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/og:image[^>]*share-preview-night-poster-v3\.jpg/);
 assert.match(html,/twitter:image[^>]*share-preview-night-poster-v3\.jpg/);
 assert.doesNotMatch(html,/share-preview-night-poster-v2\.png/);
});
