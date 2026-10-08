const test=require('node:test');const assert=require('node:assert/strict');
const materials=require('../materials.js');
test('iPhone and touch iPad use the compatible framebuffer path',()=>{
 for(const device of [{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit Safari',platform:'iPhone',maxTouchPoints:5},{userAgent:'Mozilla/5.0 Macintosh',platform:'MacIntel',maxTouchPoints:5}]){
  const p=materials.renderPolicy({...device,width:390,pixelRatio:3});
  assert.equal(p.context.antialias,false);assert.equal(p.context.preserveDrawingBuffer,true);
  assert.equal(p.shadows,false);assert.ok(p.dpr<=1.5);
 }
 const desktop=materials.renderPolicy({userAgent:'Chrome',platform:'Win32',maxTouchPoints:0,width:1440,pixelRatio:2});
 assert.equal(desktop.shadows,true);assert.equal(desktop.context.antialias,true);
});
test('scene frame clears the visible framebuffer fully after offscreen rendering',()=>{
 const state={target:'shadow',scissor:true,depth:false,color:[false,false,false,false]},clears=[];
 const gl={FRAMEBUFFER:1,SCISSOR_TEST:2,BLEND:3,DEPTH_TEST:4,COLOR_BUFFER_BIT:8,DEPTH_BUFFER_BIT:16,
  bindFramebuffer:(_,target)=>state.target=target,disable:v=>{if(v===2)state.scissor=false},enable(){},
  depthMask:v=>state.depth=v,colorMask:(...v)=>state.color=v,viewport:(...v)=>state.viewport=v,
  clearDepth:v=>state.clearDepth=v,clearColor:(...v)=>state.clearColor=v,clear:v=>clears.push({mask:v,...state})};
 materials.beginFrame(gl,390,844,[.1,.2,.3]);
 assert.equal(clears.length,1);assert.equal(clears[0].target,null);assert.equal(clears[0].scissor,false);
 assert.equal(clears[0].depth,true);assert.deepEqual(clears[0].color,[true,true,true,true]);
 assert.deepEqual(clears[0].viewport,[0,0,390,844]);assert.equal(clears[0].mask,24);
});
