/* Original site-race broadcast. No video feed, network request or licensed footage. */
(function(root){'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout,T=typeof module==='object'?require('./teams.js').teams:root.CircuitTeams.teams;
const WIDTH=320,HEIGHT=128,INTERVAL=250,UV=[[0,0],[WIDTH/1024,0],[WIDTH/1024,HEIGHT/2048],[0,HEIGHT/2048]];
function snapshot(seconds){return {seconds,cars:T.map((team,i)=>({id:i,color:team.color,pose:L.atTime(seconds+L.lapSeconds*i/T.length)})),lap:Math.floor(seconds/L.lapSeconds)+1};}
function create(createCanvas){const canvas=(createCanvas||(()=>document.createElement('canvas')))();canvas.width=WIDTH;canvas.height=HEIGHT;const c=canvas.getContext('2d');let bucket=-1;
 const xs=L.track.map(p=>p[0]),zs=L.track.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),zmin=Math.min(...zs),zmax=Math.max(...zs),xy=p=>[132+(p[0]-xmin)/(xmax-xmin)*175,105-(p[1]-zmin)/(zmax-zmin)*61];
 function update(ms){const next=Math.floor(ms/INTERVAL);if(next===bucket)return false;bucket=next;const state=snapshot(next*INTERVAL/1000);
 c.fillStyle='#122d38';c.fillRect(0,0,WIDTH,HEIGHT);c.fillStyle='#234e42';c.fillRect(0,25,WIDTH,88);
 // Original overhead race-camera graphic, driven by this scene's actual route.
 c.beginPath();L.track.forEach((p,i)=>{const q=xy(p);i?c.lineTo(...q):c.moveTo(...q)});c.closePath();c.strokeStyle='#acafb0';c.lineWidth=10;c.stroke();c.strokeStyle='#202c34';c.lineWidth=7;c.stroke();
 c.fillStyle='#7f9caa';c.fillRect(177,106,82,5);c.fillStyle='#dde9e5';c.font='bold 7px Arial';c.fillText('SONGSHAN AIRPORT',185,119);
 for(const car of state.cars){const p=xy(car.pose);c.save();c.translate(...p);c.rotate(-car.pose[2]);c.fillStyle='#07101b';c.fillRect(-3.6,-2.7,7.2,5.4);c.fillStyle=car.color;c.fillRect(-4,-1.2,8,2.4);c.fillStyle='#faf5e4';c.fillRect(-.6,-1,1.2,2);c.restore();}
 c.fillStyle='#071321';c.fillRect(0,0,WIDTH,24);c.fillRect(0,113,WIDTH,15);c.fillStyle='#ef3340';c.fillRect(7,6,5,5);c.fillStyle='#eef9fc';c.font='bold 10px Arial';c.fillText('TAIPEI GP',18,14);c.font='bold 8px Arial';c.fillText('SITE RACE / SIMULATED',136,14);c.fillStyle='#102532';c.fillRect(5,29,110,77);c.fillStyle='#6fdae2';c.font='bold 8px Arial';c.fillText('LAP '+state.lap+'  /  RACE CAM',10,40);
 state.cars.slice(0,5).forEach((car,i)=>{c.fillStyle=car.color;c.fillRect(10,46+i*11,3,7);c.fillStyle='#e6f0f3';c.fillText(String(i+1)+'  CAR '+String(car.id+1).padStart(2,'0'),19,53+i*11)});c.fillStyle='#b7cad4';c.font='bold 7px Arial';c.fillText('UNOFFICIAL CONCEPT  /  ORIGINAL SIMULATION',8,123);return true;}
 update(0);return {canvas,update};}
function upload(gl,texture,source){gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);}
function projected(ctx,p,canvas){if(p.length!==4)return;const src=[[0,HEIGHT],[WIDTH,HEIGHT],[WIDTH,0],[0,0]];for(const ids of [[0,1,2],[0,2,3]]){const [a,b,c]=ids.map(i=>src[i]),[A,B,C]=ids.map(i=>p[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);const m=(B[0]-A[0])*(c[1]-a[1])-(C[0]-A[0])*(b[1]-a[1]),n=(B[1]-A[1])*(c[1]-a[1])-(C[1]-A[1])*(b[1]-a[1]),r=(C[0]-A[0])*(b[0]-a[0])-(B[0]-A[0])*(c[0]-a[0]),s=(C[1]-A[1])*(b[0]-a[0])-(B[1]-A[1])*(c[0]-a[0]);ctx.save();ctx.beginPath();ctx.moveTo(...A.slice(0,2));ctx.lineTo(...B.slice(0,2));ctx.lineTo(...C.slice(0,2));ctx.closePath();ctx.clip();ctx.transform(m/det,n/det,r/det,s/det,A[0]-(m*a[0]+r*a[1])/det,A[1]-(n*a[0]+s*a[1])/det);ctx.drawImage(canvas,0,0);ctx.restore();}}
const api={WIDTH,HEIGHT,INTERVAL,UV,snapshot,create,upload,projected};if(typeof module==='object')module.exports=api;else root.CircuitBroadcast=api;
})(typeof window==='object'?window:globalThis);
