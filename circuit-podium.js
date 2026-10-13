/* Original fluid awards pavilion and Taipei concept trophy, shared by both renderers. */
(function(root){
'use strict';
const Market=typeof module==='object'?require('./circuit-market.js'):root.CircuitMarket;
const site={x:155,z:-310,y:-3,w:160,d:112};
function plan(){return {...site,podiums:[{rank:2,x:23,h:3.4},{rank:1,x:0,h:5.3},{rank:3,x:-23,h:2.5}],trophy:{x:0,z:5,base:12.3,height:22}};}
function build(base,objects,emissive){const s=plan(),p=(x,y,z)=>[s.x+x,s.y+y,s.z+z];
 const quad=(m,a,b,c,d,color,type=8)=>m.quad(p(...a),p(...b),p(...c),p(...d),color,type);
 const box=(m,x,y,z,w,h,d,color,type=8)=>m.box(s.x+x,s.y+y,s.z+z,w,h,d,color,type);
 function ellipse(m,x,z,rx,rz,bottom,top,color,type=8,n=72){for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,A=[x+Math.cos(a)*rx,top,z+Math.sin(a)*rz],B=[x+Math.cos(b)*rx,top,z+Math.sin(b)*rz];m.tri(p(x,top,z),p(...B),p(...A),color,type);quad(m,[A[0],bottom,A[2]],[B[0],bottom,B[2]],B,A,color,type);}}
 // Smooth oval forecourt, broad rising steps and a recessed black stage.
 ellipse(base,0,0,80,56,-2,.25,'#89999d',6);
 for(let i=0;i<4;i++){const rx=76-i*3,rz=51-i*3;ellipse(base,0,-2,rx,rz,.25+i*.7,.95+i*.7,'#c0d1d3');}
 ellipse(base,0,-5,64,36,3.05,4,'#243740');
 for(let i=0;i<72;i++){const a=i*Math.PI/36,b=(i+1)*Math.PI/36;quad(emissive,[73*Math.cos(a),2.53,-2+48*Math.sin(a)],[73*Math.cos(b),2.53,-2+48*Math.sin(b)],[72.5*Math.cos(b),2.53,-2+47.5*Math.sin(b)],[72.5*Math.cos(a),2.53,-2+47.5*Math.sin(a)],'#77dce9',12);}
 // An asymmetric continuous shell rises from both sides; the front remains open.
 const roof=(u,v,offset=0)=>[-73+146*u,1.65+39*Math.pow(Math.sin(Math.PI*u),.85)+6*Math.sin(2*Math.PI*u)+4*Math.sin(Math.PI*v)+offset,-23-12*Math.sin(Math.PI*u)+(v-.5)*22];
 for(let i=0;i<64;i++)for(let j=0;j<8;j++){const u=i/64,U=(i+1)/64,v=j/8,V=(j+1)/8;quad(objects,roof(u,v),roof(u,V),roof(U,V),roof(U,v),'#bacdd4');quad(objects,roof(u,v,-1.4),roof(U,v,-1.4),roof(U,V,-1.4),roof(u,V,-1.4),'#566f80');}
 for(let i=0;i<64;i++)for(const v of [0,1]){const u=i/64,U=(i+1)/64;quad(objects,roof(u,v),roof(U,v),roof(U,v,-1.4),roof(u,v,-1.4),'#8da8b9');quad(emissive,roof(u,v,.08),roof(U,v,.08),roof(U,v===1?.97:.03,.08),roof(u,v===1?.97:.03,.08),v?'#67e4f1':'#dc647e',12);}
 // Curved illuminated backdrop under the arch, facing the circuit (+Z).
 for(let i=0;i<32;i++){const a=-51+i*102/32,b=a+102/32,z=x=>-25+7*(x/51)**2;quad(objects,[a,5,z(a)],[b,5,z(b)],[b,24,z(b)],[a,24,z(a)],'#112c3d',8);quad(emissive,[a,7,z(a)+.08],[b,7,z(b)+.08],[b,7.35,z(b)+.08],[a,7.35,z(a)+.08],'#6ad8e8',12);}
 Market.sign(objects,'TAIPEI GP',s.x,s.y+26,s.z-20,1.25,1);
 Market.sign(objects,'CONCEPT',s.x,s.y+20,s.z-20,.4,1);
 // Podium order 2 / 1 / 3 reads correctly to the audience standing north.
 const numerals={1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111']};
 for(const b of s.podiums){ellipse(objects,b.x,10,10,9,4,4+b.h,b.rank===1?'#b39b5a':'#9bafb8',8,32);ellipse(emissive,b.x,10,10.1,9.1,4.25,4.45,'#80e0e8',12,32);for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(numerals[b.rank][r][c]==='1'){const x=b.x+1.05-c*.7,y=4.6+(4-r)*.4;quad(objects,[x,y,19.05],[x-.6,y,19.05],[x-.6,y+.34,19.05],[x,y+.34,19.05],'#f4eee0',2);}}
 // Centre plinth with an oversized exhibition trophy; two smaller ceremony cups.
 ellipse(objects,0,5,5.2,5.2,9.3,12.3,'#152c38');
 function trophy(cx,cz,y,scale){const v=(x,h,z)=>[cx+x*scale,y+h*scale,cz+z*scale];
  ellipse(objects,cx,cz,3.3*scale,3.3*scale,y,y+1.1*scale,'#caa052');
  // Eight flared tiers evoke Taipei 101 without copying an existing race trophy.
  for(let i=0;i<8;i++){const lo=.7+i*1.5,hi=lo+1.3,r=1.2+(i%2)*.1,R=r+.55;for(let side=0;side<4;side++){const a=side*Math.PI/2,b=(side+1)*Math.PI/2;quad(objects,v(Math.cos(a)*r,lo,Math.sin(a)*r),v(Math.cos(b)*r,lo,Math.sin(b)*r),v(Math.cos(b)*R,hi,Math.sin(b)*R),v(Math.cos(a)*R,hi,Math.sin(a)*R),'#6cc7c2',8);}}
  box(emissive,cx,y+13*scale,cz,.22*scale,3*scale,.22*scale,'#c2f6ef',12);
  // Two swept gold ribbons form a hollow aerodynamic crown around the tower.
  for(const side of [-1,1])for(let i=0;i<40;i++){const a=i/40*Math.PI,b=(i+1)/40*Math.PI;const f=(t,edge,depth=0)=>v(side*(2.4+4.8*Math.sin(t)+edge),1.2+20*t/Math.PI,1.8*Math.sin(t*2)+edge*.4+depth);quad(objects,f(a,-.6),f(b,-.6),f(b,.6),f(a,.6),'#e2b65c');quad(objects,f(a,.6,-.35),f(b,.6,-.35),f(b,-.6,-.35),f(a,-.6,-.35),'#ad7835');quad(emissive,f(a,.48,.06),f(b,.48,.06),f(b,.6,.06),f(a,.6,.06),'#f9cb72',12);}
  // River-like blue ribbon wraps the trophy's dark plinth.
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,b=(i+1)/24*Math.PI*2;quad(emissive,v(3.35*Math.cos(a),.65,3.35*Math.sin(a)),v(3.35*Math.cos(b),.65,3.35*Math.sin(b)),v(3.35*Math.cos(b),.83,3.35*Math.sin(b)),v(3.35*Math.cos(a),.83,3.35*Math.sin(a)),'#62dcdf',12);}
 }
 trophy(0,5,12.3,1);trophy(23,10,7.4,.25);trophy(-23,10,6.5,.22);
 Market.sign(objects,'TAIPEI',s.x,s.y+10,s.z+10.25,.25,1);
 for(const side of [-1,1]){box(objects,side*49,4,12,4,7,4,'#152b37');box(objects,side*49,11,12,5,1.6,5,'#718b9b');box(emissive,side*49,12.6,12,4,.2,4,'#bdebf5',12);}
 return s;
}
const api={plan,build};if(typeof module==='object')module.exports=api;else root.CircuitPodium=api;
})(typeof window==='object'?window:globalThis);
