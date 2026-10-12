/* Original site-race broadcast. No video feed, network request or licensed footage. */
(function(root){'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout,T=typeof module==='object'?require('./teams.js').teams:root.CircuitTeams.teams;
const WIDTH=1024,HEIGHT=128,INTERVAL=250,UV=[[0,0],[WIDTH/1024,0],[WIDTH/1024,HEIGHT/2048],[0,HEIGHT/2048]];
function snapshot(seconds){return {seconds,cars:T.map((team,i)=>({id:i,color:team.color,pose:L.atTime(seconds+L.lapSeconds*i/T.length)})),lap:Math.floor(seconds/L.lapSeconds)+1};}
function create(createCanvas){const canvas=(createCanvas||(()=>document.createElement('canvas')))();canvas.width=WIDTH;canvas.height=HEIGHT;const c=canvas.getContext('2d');let bucket=-1;
 const xs=L.track.map(p=>p[0]),zs=L.track.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),zmin=Math.min(...zs),zmax=Math.max(...zs),xy=p=>[470+(p[0]-xmin)/(xmax-xmin)*530,107-(p[1]-zmin)/(zmax-zmin)*70];
 function update(ms){const next=Math.floor(ms/INTERVAL);if(next===bucket)return false;bucket=next;const state=snapshot(next*INTERVAL/1000);
 c.fillStyle='#061521';c.fillRect(0,0,WIDTH,HEIGHT);c.fillStyle='#ee3345';c.fillRect(0,0,8,HEIGHT);
 c.fillStyle='#f4f9ff';c.font='bold 29px Arial';c.fillText('TAIPEI / CIRCUIT INFO',24,37);
 c.fillStyle='#69e2ea';c.font='bold 30px Arial';c.fillText((L.length/1000).toFixed(3)+' KM',24,78);c.fillText(L.turns.length+' TURNS',238,78);
 c.fillStyle='#c1d1dd';c.font='bold 14px Arial';c.fillText('UNOFFICIAL CONCEPT / SIMULATED CARS',24,110);
 c.fillStyle='#9cb6c8';c.font='bold 14px Arial';c.fillText('N ↑    TRACK POSITION',470,22);
 c.beginPath();L.track.forEach((p,i)=>{const q=xy(p);i?c.lineTo(...q):c.moveTo(...q)});c.closePath();c.strokeStyle='#42dce7';c.lineWidth=4;c.stroke();
 for(const car of state.cars){const p=xy(car.pose);c.fillStyle='#061521';c.fillRect(p[0]-5,p[1]-5,10,10);c.fillStyle=car.color;c.fillRect(p[0]-3,p[1]-3,6,6);}
 const finish=xy(L.start);c.fillStyle='#ffffff';c.fillRect(finish[0]-2,finish[1]-6,4,12);return true;}
 update(0);return {canvas,update};}
function upload(gl,texture,source){gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);}
function projected(ctx,p,canvas){if(p.length!==4)return;const src=[[0,HEIGHT],[WIDTH,HEIGHT],[WIDTH,0],[0,0]];for(const ids of [[0,1,2],[0,2,3]]){const [a,b,c]=ids.map(i=>src[i]),[A,B,C]=ids.map(i=>p[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);const m=(B[0]-A[0])*(c[1]-a[1])-(C[0]-A[0])*(b[1]-a[1]),n=(B[1]-A[1])*(c[1]-a[1])-(C[1]-A[1])*(b[1]-a[1]),r=(C[0]-A[0])*(b[0]-a[0])-(B[0]-A[0])*(c[0]-a[0]),s=(C[1]-A[1])*(b[0]-a[0])-(B[1]-A[1])*(c[0]-a[0]);ctx.save();ctx.beginPath();ctx.moveTo(...A.slice(0,2));ctx.lineTo(...B.slice(0,2));ctx.lineTo(...C.slice(0,2));ctx.closePath();ctx.clip();ctx.transform(m/det,n/det,r/det,s/det,A[0]-(m*a[0]+r*a[1])/det,A[1]-(n*a[0]+s*a[1])/det);ctx.drawImage(canvas,0,0);ctx.restore();}}
const api={WIDTH,HEIGHT,INTERVAL,UV,snapshot,create,upload,projected};if(typeof module==='object')module.exports=api;else root.CircuitBroadcast=api;
})(typeof window==='object'?window:globalThis);
