/* Paddock food promenade; the same low-poly mesh serves WebGL and 2D. */
(function(root){
'use strict';
const menu=[['snack','BAO','#b34b43'],['snack','GRILL','#537f76'],['snack','TEA','#456e8b'],['bakery','BREAD','#b58a51'],['bakery','BAKERY','#89729a']];
function plan(){return [280,820].flatMap((start,wing)=>menu.map(([kind,label,color],i)=>({id:`market-${wing*5+i+1}`,kind,label,color,x:start+i*20,z:-252,y:wing?-3.8:-4.8})));}
const font={A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],G:['01111','10000','10000','10111','10001','10001','01111'],I:['11111','00100','00100','00100','00100','00100','11111'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],O:['01110','10001','10001','10001','10001','10001','01110'],R:['11110','10001','10001','11110','10100','10010','10001'],T:['11111','00100','00100','00100','00100','00100','00100'],Y:['10001','10001','01010','00100','00100','00100','00100']};
function build(base,objects,emissive){const stalls=plan();
 for(const s of stalls){const {x,z,y,color}=s;
  const box=(u,h,v,w,dh,d,c=color,type=8,m=objects)=>m.box(x+u,y+h,z+v,w,dh,d,c,type);
  const quad=(a,b,c,d,col,type=8,m=objects)=>m.quad(...[a,b,c,d].map(p=>[x+p[0],y+p[1],z+p[2]]),col,type);
  // Raised promenade slabs stop short of the pit entrance/exit and garages.
  base.box(x,y-.2,z+2,18,.2,22,'#a3a59b',6);
  box(0,.5,0,12,2.8,7);box(0,3.25,2.9,13,.3,2.4,'#d7d8c9');
  box(0,3,-3.2,12,4,.5,'#d4d2ba');
  for(const u of [-5.6,5.6]){box(u,3,-2.8,.3,4.7,.3,'#ccd8d9');box(u,3,3.3,.25,3.2,.25,'#ccd8d9');}
  // A sloping striped awning, metal sign box, warm service lights.
  for(let i=0;i<8;i++){const a=-6.8+i*1.7,b=a+1.7;quad([a,7.3,-4],[b,7.3,-4],[b,6.2,5.4],[a,6.2,5.4],i%2?'#e5e0c8':color);quad([a,5.6,5.4],[b,5.6,5.4],[b,6.2,5.4],[a,6.2,5.4],i%2?'#e5e0c8':color);}
  box(0,7.3,-1,12,2.6,.6,'#14242d');
  const scale=.27,total=s.label.length*6*scale;
  for(let c=0;c<s.label.length;c++)for(let row=0;row<7;row++)for(let k=0;k<5;k++)if(font[s.label[c]][row][k]==='1'){
   // Looking from the north (+z), +x is screen-left: reverse the world axis.
   const a=total/2-(c*6+k)*scale,b=a-scale*.85,h=7.6+(6-row)*scale;
   quad([a,h,-.68],[b,h,-.68],[b,h+scale*.85,-.68],[a,h+scale*.85,-.68],'#ffe9b2',12,emissive);
  }
  box(0,6.05,3.1,10,.18,.25,'#ffe5a1',12,emissive);
  for(const u of [-4.7,4.7])for(const side of [-1,1]){const v=side*3.55;box(u,.5,v,.4,.4,.05,'#a2acaf');for(let j=0;j<10;j++){const a=j*Math.PI/5,b=(j+1)*Math.PI/5;quad([u,.7,v],[u+Math.cos(a)*.7,.7+Math.sin(a)*.7,v],[u+Math.cos(b)*.7,.7+Math.sin(b)*.7,v],[u,.7,v],'#18272d');}}
  if(s.kind==='bakery'){
   // Bread display: framed glass, wooden trays and scored golden loaves.
   box(0,3.6,2.8,9,.18,2.2,'#966c44');
   for(const u of [-4.6,4.6])box(u,3.5,2.8,.18,1.8,2.2,'#cadde1');
   box(0,5.2,2.8,9.4,.15,2.3,'#bfd8db');
   for(let i=0;i<6;i++){const u=-3.7+i*1.45;box(u,3.8,2.8,1.1,.48,1.6,'#d99b4c',0);for(let j=0;j<3;j++)box(u,4.28,2.3+j*.45,.8,.03,.12,'#f0d99c',0);}
   quad([-4.5,3.7,3.96],[4.5,3.7,3.96],[4.5,5.15,3.96],[-4.5,5.15,3.96],'#c0e1df',13);
   box(4,4,-1,2.8,2.1,2.5,'#343f45');box(4,4.5,.28,2,.8,.08,'#eea95e',12,emissive);
  }else{
   box(-2,3.5,2.6,4,.2,2,'#434d53');
   if(s.label==='GRILL')for(let i=0;i<5;i++){box(-3.6+i*.75,3.75,2.6,.28,.2,1.7,'#9e572f',0);box(-3.6+i*.75,3.7,3.6,.06,.06,.6,'#d8cba0',0);}
   else if(s.label==='BAO')for(let i=0;i<3;i++){box(-3.3+i*1.4,3.75,2.6,1.2,.22,1.4,'#b98c58');box(-3.3+i*1.4,3.97,2.6,.9,.55,.9,'#f0e5c7',0);}
   else for(let i=0;i<5;i++){box(-3.6+i*.8,3.7,2.8,.5,.8,.5,'#c69250',0);box(-3.6+i*.8,4.5,2.8,.55,.1,.55,'#eee3c4',0);box(-3.6+i*.8,4.6,2.8,.07,.6,.07,'#6e4332',0);}
   box(4,3.5,2,1.4,1.1,1.3,'#283b47');box(4,4.6,2,1.2,.1,1,'#91d4df',12,emissive);
  }
  // One vendor and one guest; front tables sit inside each stall's clear footprint.
  for(const [u,v,shirt,h] of [[1,-.3,'#e7dec7',1],[-2,7.2,color,0]]){if(h)box(u,0,v,2,h,2,'#5c5a50');box(u,h,v,.8,1.1,.7,'#263640');box(u,h+1.1,v,1.3,1.3,.85,shirt);box(u,h+2.4,v,.85,.7,.8,'#cfab8d',0);}
  box(4,0,8,.25,2.5,.25,'#c4cdd0');box(4,2.5,8,3.6,.25,3.2,'#b59163');
  for(const u of [1.4,6.6]){box(u,0,8,.25,1.4,.25,'#b3bfc1');box(u,1.4,8,1.3,.2,1.3,color);}
 }
 return stalls;
}
const api={plan,build};if(typeof module==='object')module.exports=api;else root.CircuitMarket=api;
})(typeof window==='object'?window:globalThis);
