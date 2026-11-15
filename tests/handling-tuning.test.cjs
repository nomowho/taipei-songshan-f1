const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../driving.js'),X=require('../drive-experience.js'),L=require('../circuit.js');

test('braking distance from 300 km/h leaves useful room for the 150 m board',()=>{
 const g=D.create(L),start=[g.state.x,g.state.z];g.state.speed=300/3.6;g.state.started=true;
 for(let i=0;i<600&&g.state.speed>0;i++)g.update(1/60,{brake:1});
 const distance=Math.hypot(g.state.x-start[0],g.state.z-start[1]);
 assert.ok(distance>80&&distance<130,`braking distance ${distance.toFixed(1)} m`);
});

test('automatic throttle returns gradually after braking and still reaches full power',()=>{
 const g=D.create(L);g.state.speed=20;g.state.started=true;
 g.update(1/60,{brake:1});g.update(1/60,{throttle:1});
 assert.ok(g.state.throttle>0&&g.state.throttle<.2,`first throttle step ${g.state.throttle}`);
 for(let i=0;i<30;i++)g.update(1/60,{throttle:1});
 assert.equal(g.state.throttle,1);
 g.update(1/60,{brake:1,throttle:1});assert.equal(g.state.throttle,0);
});

test('stable steering softens turn-in without removing full steering authority',()=>{
 const standard=D.create(L),stable=D.create(L);
 for(const g of [standard,stable]){g.state.speed=80/3.6;g.state.started=true;}
 for(let i=0;i<12;i++){standard.update(1/60,{steer:1,steeringMode:'standard'});stable.update(1/60,{steer:1,steeringMode:'stable'});}
 const start=L.locate(0)[2];
 assert.ok(stable.state.angle-start>0&&stable.state.angle-start<standard.state.angle-start);
 assert.ok(stable.state.steer<standard.state.steer);
 for(let i=0;i<90;i++)stable.update(1/60,{steer:1,steeringMode:'stable'});
 assert.ok(stable.state.steer>.99);
});

test('brake prompt changes with speed at the same corner and shows a stable target',()=>{
 const t=L.turns[0],fast={d:t.distance-100,speed:300/3.6},slow={d:t.distance-100,speed:100/3.6};
 const fastCue=X.turnCue(L,fast),slowCue=X.turnCue(L,slow);
 const fastAdvice=X.brakingAdvice(L,fast,fastCue),slowAdvice=X.brakingAdvice(L,slow,slowCue);
 assert.equal(fastAdvice.targetKmh,slowAdvice.targetKmh);
 assert.ok(fastAdvice.targetKmh>=70&&fastAdvice.targetKmh<=180);
 assert.ok(fastAdvice.brakeDistance>slowAdvice.brakeDistance);
 assert.equal(fastAdvice.action,'brake');assert.notEqual(slowAdvice.action,'brake');
});
