const test=require('node:test'),assert=require('node:assert/strict');
const {start}=require('../traffic.js');
test('one anonymous page view reuses a browser id without sending a name or IP',()=>{
 const sent=[],values=new Map(),id='a1b2c3d4-1111-4222-8333-123456789abc';
 const host={navigator:{doNotTrack:'0'},crypto:{randomUUID:()=>id},localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},fetch:(url,options)=>{sent.push({url,options});return Promise.resolve();}};
 assert.equal(start(host),true);assert.equal(start(host),true);assert.equal(sent.length,2);
 for(const {url,options} of sent){assert.match(url,/\/api\/traffic\/visit$/);assert.deepEqual(JSON.parse(options.body),{visitorId:id});assert.equal(options.credentials,'omit');assert.equal(options.keepalive,true);}
});
test('do-not-track disables the page-view request',()=>{
 let calls=0;const host={navigator:{doNotTrack:'1'},crypto:{randomUUID:()=>''},fetch:()=>{calls++;}};
 assert.equal(start(host),false);assert.equal(calls,0);
});
