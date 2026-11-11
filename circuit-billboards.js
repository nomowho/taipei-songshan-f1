/* User-provided concept artwork, displayed unchanged on three double-sided signs. */
(function(root){'use strict';
const L=typeof module==='object'?require('./circuit.js'):root.CircuitLayout;
const replaced=new Set([1,2,3]);
const boards=[
 {id:'gvm-travel',src:'./assets/billboards/gvm-travel.png',x:1260,z:-145,w:96,ratio:1586/578},
 {id:'taipei-speed',src:'./assets/billboards/taipei-speed.png',x:1100,z:-300,w:96,ratio:1672/941},
 {id:'green-commute',src:'./assets/billboards/green-commute.png',x:250,z:560,w:72,ratio:1672/941}
].map(b=>{const index=L.nearest([b.x,b.z]),approach=L.locate((L.distances[index]-150)/L.length),dx=approach[0]-b.x,dz=approach[1]-b.z,d=Math.hypot(dx,dz);return {...b,y:8,h:b.w/b.ratio,n:[dx/d,dz/d],r:[-dz/d,dx/d],approach};});
const point=(b,u,y,depth=0)=>[b.x+b.r[0]*u+b.n[0]*depth,y,b.z+b.r[1]*u+b.n[1]*depth];
function faces(b){return [1,-1].map(side=>{const left=-side*b.w/2,right=side*b.w/2;return [point(b,left,b.y,side*.8),point(b,right,b.y,side*.8),point(b,right,b.y+b.h,side*.8),point(b,left,b.y+b.h,side*.8)];});}
function frames(objects){for(const b of boards){for(const u of [-b.w*.32,b.w*.32]){const p=point(b,u,0);objects.box(p[0],0,p[2],1.8,b.y,1.8,'#71838f',8);}const f=faces(b);for(let i=0;i<4;i++)objects.quad(f[0][i],f[0][(i+1)%4],f[1][[1,0,3,2][(i+1)%4]],f[1][[1,0,3,2][i]],'#2b3947',8);}}
function surface(mesh,b,type=14){for(const f of faces(b))mesh.quad(...f,'#ffffff',type,[[0,0],[1,0],[1,1],[0,1]]);}
const images=[];let loading;
function load(){if(!loading)loading=Promise.all(boards.map((b,i)=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images[i]=img;resolve(img);};img.onerror=()=>{console.warn('看板圖片載入失敗：'+b.id);resolve(null);};img.src=b.src;})));return loading;}
function textures(gl){const textures=boards.map(()=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([30,45,58,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;});load().then(loaded=>loaded.forEach((img,i)=>{if(!img||gl.isContextLost())return;gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);}));return textures;}
function projected(ctx,p,img){if(!img||p.length!==4)return;const src=[[0,img.height],[img.width,img.height],[img.width,0],[0,0]];for(const ids of [[0,1,2],[0,2,3]]){const [a,b,c]=ids.map(i=>src[i]),[A,B,C]=ids.map(i=>p[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);const m=(B[0]-A[0])*(c[1]-a[1])-(C[0]-A[0])*(b[1]-a[1]),n=(B[1]-A[1])*(c[1]-a[1])-(C[1]-A[1])*(b[1]-a[1]),r=(C[0]-A[0])*(b[0]-a[0])-(B[0]-A[0])*(c[0]-a[0]),s=(C[1]-A[1])*(b[0]-a[0])-(B[1]-A[1])*(c[0]-a[0]);ctx.save();ctx.beginPath();ctx.moveTo(...A.slice(0,2));ctx.lineTo(...B.slice(0,2));ctx.lineTo(...C.slice(0,2));ctx.closePath();ctx.clip();ctx.transform(m/det,n/det,r/det,s/det,A[0]-(m*a[0]+r*a[1])/det,A[1]-(n*a[0]+s*a[1])/det);ctx.drawImage(img,0,0);ctx.restore();}}
const api={boards,replaced,faces,frames,surface,load,textures,images,projected};if(typeof module==='object')module.exports=api;else root.CircuitBillboards=api;
})(typeof window==='object'?window:globalThis);
