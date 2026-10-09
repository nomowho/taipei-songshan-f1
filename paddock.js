/* Original geometry inspired by fluid contemporary architecture, not a replica or licensed design. */
(function(root){
'use strict';
const pi=Math.PI;
function roofPoint(u,v){const span=62+14*Math.sin(pi*u),x=-670+1220*u,z=-21+7*Math.sin(2*pi*u)+(v-.5)*span;return [x,29+12*Math.sin(pi*u)+7*Math.exp(-(((u-.8)/.15)**2))+8*(1-(2*v-1)**2),z]}
function roofNormal(u,v){const a=roofPoint(u-.0001,v),b=roofPoint(u+.0001,v),c=roofPoint(u,v-.0001),d=roofPoint(u,v+.0001),du=b.map((n,i)=>n-a[i]),dv=d.map((n,i)=>n-c[i]);let n=[dv[1]*du[2]-dv[2]*du[1],dv[2]*du[0]-dv[0]*du[2],dv[0]*du[1]-dv[1]*du[0]],length=Math.hypot(...n);return n.map(x=>x/length)}
function buildRoof(mesh){
 const steps=96,bands=12,rgb=[.70,.79,.83];
 function vertex(u,v,offset,down=false){const p=roofPoint(u,v),n=roofNormal(u,v);p[1]+=offset;mesh.arr.push(...p,...n.map(x=>down?-x:x),...rgb,u,v,8)}
 for(let i=0;i<steps;i++)for(let j=0;j<bands;j++)for(const [u,v] of [[i/steps,j/bands],[(i+1)/steps,j/bands],[(i+1)/steps,(j+1)/bands],[i/steps,j/bands],[(i+1)/steps,(j+1)/bands],[i/steps,(j+1)/bands]]){vertex(u,v,0);}
 for(let i=0;i<steps;i++){
  for(const side of [0,1]){
   const a=roofPoint(i/steps,side),b=roofPoint((i+1)/steps,side),lowA=[a[0],a[1]-1.8,a[2]],lowB=[b[0],b[1]-1.8,b[2]];
   mesh.quad(lowA,lowB,b,a,'#9ec0cc',8);
   mesh.quad([a[0],a[1]-.48,a[2]+(side? .1:-.1)],[b[0],b[1]-.48,b[2]+(side?.1:-.1)],[b[0],b[1]-.05,b[2]+(side?.1:-.1)],[a[0],a[1]-.05,a[2]+(side?.1:-.1)],'#58d6e3',12);
   // Recessed curved glazing follows the underside of the continuous roof.
   const zOffset=side?-4:4;
   mesh.quad([a[0],12,a[2]+zOffset],[b[0],12,b[2]+zOffset],[b[0],b[1]-2,b[2]+zOffset],[a[0],a[1]-2,a[2]+zOffset],'#80aebd',13,[[i*3,0],[(i+1)*3,0],[(i+1)*3,(b[1]-14)/3.5],[i*3,(a[1]-14)/3.5]]);
  }
 }
 for(const end of [0,1])for(let j=0;j<bands;j++){const a=roofPoint(end,j/bands),b=roofPoint(end,(j+1)/bands);mesh.quad([a[0],12,a[2]],[b[0],12,b[2]],b,a,'#80aebd',13);}
 // A shallow underside closes the shell without visible ribs or panel stripes.
 for(let i=0;i<steps;i++)for(let j=0;j<bands;j++)for(const [u,v] of [[i/steps,j/bands],[(i+1)/steps,(j+1)/bands],[(i+1)/steps,j/bands],[i/steps,j/bands],[i/steps,(j+1)/bands],[(i+1)/steps,(j+1)/bands]])vertex(u,v,-1.8,true);
}
function createRaceCar(factory,team){
 const m=factory(),dark='#101820',col=team.color,accent=team.accent;
 function wedge(x0,x1,w0,w1,y0,y1,color){
  const a=[x0,y0,-w0/2],b=[x1,y1,-w1/2],c=[x1,y1,w1/2],d=[x0,y0,w0/2];m.quad(a,b,c,d,color);
  m.quad([x0,.22,-w0/2],[x1,.22,-w1/2],b,a,color);m.quad([x1,.22,w1/2],[x0,.22,w0/2],d,c,color);
 }
 function tube(a,b,r,color){let dir=b.map((v,i)=>v-a[i]),len=Math.hypot(...dir);dir=dir.map(x=>x/len);let u=Math.abs(dir[1])<.9?[dir[2],0,-dir[0]]:[1,0,0];let l=Math.hypot(...u);u=u.map(x=>x/l);let v=[dir[1]*u[2]-dir[2]*u[1],dir[2]*u[0]-dir[0]*u[2],dir[0]*u[1]-dir[1]*u[0]];function p(t,k){let th=k/6*pi*2;return a.map((n,i)=>n+dir[i]*len*t+r*(u[i]*Math.cos(th)+v[i]*Math.sin(th)))}for(let i=0;i<6;i++)m.quad(p(0,i),p(1,i),p(1,i+1),p(0,i+1),color);}
 m.box(-.25,.14,0,4.8,.14,1.8,dark);wedge(-2.5,.7,1.1,.8,.85,.80,col);wedge(.6,3.03,.58,.22,.76,.42,col);
 for(const z of [-.66,.66]){m.box(-.5,.3,z,2.9,.40,.53,col);m.box(-.5,.73,z,2.2,.07,.33,accent);}
 m.box(-.45,.83,0,1.25,.10,.75,dark);wedge(-2.1,-.92,.72,.45,1.04,1.3,col);m.box(-1.2,1.18,0,.4,.25,.28,dark);
 m.cylinder(-.45,0,.17,.25,.95,'#f1cf53',12);
 for(let j=0;j<12;j++){const a=j/12*pi,b=(j+1)/12*pi;tube([-.25+.78*Math.cos(a),1.47,.41*Math.sin(a)],[-.25+.78*Math.cos(b),1.47,.41*Math.sin(b)],.055,dark);tube([-.25+.78*Math.cos(a),1.47,-.41*Math.sin(a)],[-.25+.78*Math.cos(b),1.47,-.41*Math.sin(b)],.055,dark)}
 tube([.53,.84,0],[.53,1.47,0],.06,dark);
 // Four exposed slick tires with hub faces; all wheel bottoms stay at y=0.
 for(const x of [-1.86,1.78])for(const z of [-1.08,1.08]){
  const tire=factory();tire.cylinder(0,0,.56,.5,-.25,dark,16);tire.cylinder(0,0,.23,.54,-.27,'#9aa8ae',12);
  for(let i=0;i<tire.arr.length;i+=12){let a=tire.arr;m.arr.push(a[i]+x,-a[i+2]+.56,a[i+1]+z,a[i+3],-a[i+5],a[i+4],...a.slice(i+6,i+12));}
  tube([x,.45,z*.30],[x,.56,z],.045,dark);tube([x-.35,.48,z*.30],[x,.56,z],.045,dark);
 }
 // Separate front and rear multi-element wings and upright endplates.
 for(const dx of [2.82,3.12])m.box(dx,.24,0,.25,.12,2.72,dark);
 m.box(2.97,.37,0,.48,.10,2.58,accent);
 for(const z of [-1.36,1.36])m.box(2.97,.24,z,.63,.40,.10,col);
 m.box(-2.66,.34,0,.14,1.12,.20,dark);m.box(-2.70,1.28,0,.64,.16,2.55,col);m.box(-2.54,1.49,0,.25,.10,2.55,accent);
 for(const z of [-1.30,1.30])m.box(-2.7,1.13,z,.72,.55,.09,dark);
 return m;
}
function appendCar(target,source,x,z,angle,scale=3,ground=2.4){const c=Math.cos(angle),s=Math.sin(angle),a=source.arr;for(let i=0;i<a.length;i+=12)target.arr.push(x+(c*a[i]-s*a[i+2])*scale,ground+a[i+1]*scale,z+(s*a[i]+c*a[i+2])*scale,c*a[i+3]-s*a[i+5],a[i+4],s*a[i+3]+c*a[i+5],...a.slice(i+6,i+12));}
const api={roofPoint,roofNormal,buildRoof,createRaceCar,appendCar};if(typeof module==='object')module.exports=api;else root.CircuitPaddock=api;
})(typeof window==='object'?window:this);
