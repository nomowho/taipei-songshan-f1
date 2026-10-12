const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../paddock.js'),B=require('../circuit-broadcast.js'),L=require('../circuit.js');
test('upper display ribbon is outside its backing and no front glass covers its height',()=>{
 const screens=[],glass=[];P.buildScreens({quad:(...a)=>screens.push(a)});P.buildRoof({arr:[],quad:(...a)=>{if(a[5]===13)glass.push(a)}});
 for(const f of screens.filter(f=>f[0][1]>12)){assert.ok(f.slice(0,4).every(p=>p[2]>7.5));assert.ok(f.slice(0,4).every(p=>p[1]<26));for(const g of glass){const ps=g.slice(0,4);if(ps.every(p=>p[2]>7.8))assert.ok(Math.min(...ps.map(p=>p[1]))>=26);}}
});
test('route display renders measured route information and never presents invented driver standings',()=>{
 const text=[],c=new Proxy({},{get:(_,k)=>k==='fillText'?(s)=>text.push(s):()=>{}});B.create(()=>({getContext:()=>c}));assert.ok(text.includes((L.length/1000).toFixed(3)+' KM'));assert.ok(text.includes('22 TURNS'));assert.ok(text.some(s=>s.includes('SIMULATED')));
});
test('thick billboards show outward, non-mirrored advertisements on both faces',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),faces=[];
 const src=html.slice(html.indexOf('function brandPanel('),html.indexOf('for(const [i,x,z]',html.indexOf('function brandPanel(')));
 const e={CircuitTeams:{signRows:16},objects:{quad:(...a)=>faces.push(a)}};vm.runInNewContext(src+';brandPanel(1100,28,-298.9,108,24,2,false,2.2)',e);
 assert.equal(faces.length,2);assert.ok(faces[0][0][2]>-299);assert.ok(faces[1][0][2]<-301);
 for(const [i,f] of faces.entries()){const sign=i?1:-1;assert.ok((f[1][0]-f[0][0])*sign*(f[6][1][0]-f[6][0][0])>0);}
 assert.ok(!html.includes('[2,730,-337]'));assert.ok(html.includes('[2,1100,-300]'));
 // The moved sign is east of the complete relocated curved roof, not embedded in its rear facade.
 const roofEast=90+(550-90)*.35+L.paddockOffset.x;assert.ok(1100-111/2-roofEast>80);
});
