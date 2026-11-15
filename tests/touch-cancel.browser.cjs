const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXE||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
  await page.goto('about:blank');
  await page.evaluate(()=>{
   document.body.innerHTML='<canvas id="view"></canvas><button id="driveStart">排位賽</button>';
   window.CircuitLayout={length:7402,splits:[2400,4800]};
   window.CircuitDriveExperience={map:()=>null};
   window.CircuitQualifying={driverName:s=>s,top:async()=>[],begin:async name=>({name,entries:[],submit(){}}),retryPending(){}};
   window.fakeGame={state:{speed:0,time:0,lap:1,lastLap:null,bestLap:null,completed:0,nextGate:1,valid:true,started:false,paused:false,offroad:false,wrongWay:false,hit:0,currentSectors:[null,null,null],lastSectors:[null,null,null],personalSectors:[null,null,null],recordSectors:[null,null,null],sectorIndex:0,sectorStart:0},renderState(){return {x:0,z:0,angle:0,speed:0};},restart(){this.state.paused=false;this.state.started=false;},pause(value){this.state.paused=value;},update(){}};
  });
  await page.addScriptTag({path:path.join(__dirname,'../drive-ui.js')});
  await page.evaluate(()=>CircuitDriveUI.mount(fakeGame,{onStart(){},onStop(){}}));
  await page.locator('#driveStart').click();
  await page.locator('#qualifyingName').fill('Touch QA');
  await page.locator('#qualifyingEnter').click();
  await page.locator('#drivePanel').waitFor({state:'visible'});
  const afterBrakeCancel=await page.evaluate(()=>{
   const brake=document.querySelector('[data-drive="brake"]');brake.setPointerCapture=()=>{};
   brake.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:11,pointerType:'touch'}));
   brake.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:11,pointerType:'touch'}));
   return {paused:fakeGame.state.paused,held:brake.classList.contains('held')};
  });
  await page.locator('#driveRestart').click();
  const afterCaptureLoss=await page.evaluate(()=>{
   const stick=document.getElementById('driveSteer');stick.setPointerCapture=()=>{};
   const rect=stick.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
   stick.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:22,pointerType:'touch',clientX:x,clientY:y}));
   stick.dispatchEvent(new PointerEvent('lostpointercapture',{bubbles:true,pointerId:22,pointerType:'touch'}));
   document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:22,pointerType:'touch',clientX:x+rect.width*.35,clientY:y}));
   const moving=Number(stick.getAttribute('aria-valuenow'));
   document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:22,pointerType:'touch'}));
   return {moving,released:Number(stick.getAttribute('aria-valuenow'))};
  });
  assert.equal(afterBrakeCancel.held,false,'cancelled brake must release');
  assert.equal(afterBrakeCancel.paused,false,'cancelled pedal touch must not abort the lap');
  assert.ok(afterCaptureLoss.moving<-.5,'the same finger must keep steering after capture loss');
  assert.equal(afterCaptureLoss.released,0,'steering must reset when the finger lifts');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await page.evaluate(()=>fakeGame.state.paused),true,'a real focus loss still ends the lap');
  console.log('Touch cancellation releases pedals, steering survives capture loss, and blur ends the lap.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
