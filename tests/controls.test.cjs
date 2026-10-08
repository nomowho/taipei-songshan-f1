// Run real input handlers in an isolated VM; no browser/GPU required.
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8');
function controls(fallback=false){
  const events={};
  const C={setPointerCapture(){},addEventListener(k,f){events[k]=f}};
  const goal={az:0,el:1,dist:1000,tx:0,tz:0};
  const g={az:0,el:1,d:1000,tx:0,tz:0};
  const button={classList:{remove(){},toggle(){}},setAttribute(){}};
  const env={C,goal,g,Map,Math,cos:Math.cos,sin:Math.sin,cw:1000,ch:1000,w:1000,h:1000,
    clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),cl:(x,a,b)=>Math.max(a,Math.min(b,x)),
    autospin:false,auto:false,updateButton(){},applyPreset(){},document:{getElementById:()=>button},$:()=>button,
    window:{addEventListener(k,f){events[k]=f}},};
  const start=fallback?html.indexOf('let pointers=new Map();'):html.indexOf('const pointers=new Map();');
  const end=html.indexOf(fallback?'let proj;function render()':'function carGeom(',start);
  vm.runInNewContext(html.slice(start,end),env);
  return {state:fallback?g:goal,event(k,id,x,y,extra={}){
    const e={pointerId:id,clientX:x,clientY:y,button:0,preventDefault(){},target:C,...extra};
    (events[k]||C['on'+k])(e);
  }};
}
for(const fallback of [false,true]){
 const mode=fallback?'2D fallback':'WebGL';
 test(`${mode}: two moving fingers must not replay the other finger's previous movement`,()=>{
   const c=controls(fallback);c.event('pointerdown',1,0,0);c.event('pointerdown',2,100,0);
   c.event('pointermove',1,10,0);c.event('pointermove',2,110,0);
   assert.ok(Math.abs(c.state[fallback?'d':'dist']-1000)<1e-8,'equal finger translation must preserve zoom');
   const before=JSON.stringify(c.state);c.event('pointermove',2,110,0);
   assert.equal(JSON.stringify(c.state),before,'stationary event must not drift camera');
 });
 test(`${mode}: single pointer rotates; right mouse pans; wheel remains bounded`,()=>{
   const c=controls(fallback);c.event('pointerdown',1,20,20);c.event('pointermove',1,40,30);
   assert.notEqual(c.state.az,0);c.event('pointerup',1,40,30);
   c.event('pointerdown',2,40,30,{button:2});c.event('pointermove',2,60,40);
   assert.notEqual(c.state.tx,0);c.event('wheel',0,0,0,{deltaY:1e8});
   assert.ok(c.state[fallback?'d':'dist']<=11000);
 });
}
test('keyboard zoom has bounds and immediately responds after repeated zooming',()=>{
 const c=controls();for(let i=0;i<100;i++)c.event('keydown',0,0,0,{key:'-'});
 assert.ok(c.state.dist<=9000);c.event('keydown',0,0,0,{key:'+'});assert.ok(c.state.dist<9000);
 for(let i=0;i<100;i++)c.event('keydown',0,0,0,{key:'+'});assert.ok(c.state.dist>=190);
});
