const {readFileSync}=require('node:fs');const {join}=require('node:path');
const vm=require('node:vm');const test=require('node:test');const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const code=html.slice(html.indexOf('function matMul('),html.indexOf('let cam='));
const env={Math,Float32Array};vm.runInNewContext(code,env);
function screen(p,m){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13]];}
test('north-up overhead keeps east on the right and Taipei 101 in the southeast',()=>{
 const view=env.lookAt([0,3500,-20],[0,0,0]);
 const east=screen([100,0,0],view),north=screen([0,0,100],view),tower=screen([1250,0,-3650],view);
 assert.ok(east[0]>0,'east must appear right, matching mini-map');
 assert.ok(north[1]>0,'north must appear above center');
 assert.ok(tower[0]>0&&tower[1]<0,'101 must appear southeast');
});
