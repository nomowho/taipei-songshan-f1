/* Original, deterministic materials. No downloaded images or network dependencies. */
(function(root){
'use strict';
function atlasData(){
 const size=512,tile=128,data=new Uint8Array(size*size*4);
 function noise(x,y,s){let n=Math.imul(x+17,374761393)^Math.imul(y+71,668265263)^Math.imul(s+1,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
 const colors=[[178,176,167],[49,52,54],[87,102,60],[131,136,132],[148,160,162],[88,109,64],[172,150,122],[113,124,131],[152,165,169],[112,127,122],[192,184,164],[113,91,75],[125,133,130],[97,115,122],[147,146,135],[160,159,150]];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const id=(x/tile|0)+4*(y/tile|0),u=x%tile,v=y%tile,n=noise(u,v,id),coarse=noise(u>>3,v>>3,id);
  let shade=.90+n*.19+(coarse-.5)*.09,c=colors[id];
  if(id===0){if(u%32<1||v%32<1)shade*=.74;if(n<.035)shade*=.77;}
  if(id===1){shade=.62+n*.66;if(n>.97)shade*=1.19;}
  if(id===2||id===5){shade=.62+n*.48+coarse*.18;if((u+v*3)%19<2)shade*=.82;}
  if(id===3){if(u%64<2||v%64<2)shade*=.48;shade*=.95+.05*Math.sin(u*.06);}
  if(id===4||id===8){shade=.82+n*.08+.13*Math.cos(u*Math.PI/8);if(u%32<2)shade*=.55;}
  if(id===6||id===11){const row=v/16|0;if(v%16<2||(u+(row%2)*16)%32<2)shade*=.66;}
  if(id===7){if(u%32<1||v%32<1)shade*=.67;}
  const k=(y*size+x)*4;for(let ch=0;ch<3;ch++)data[k+ch]=Math.max(0,Math.min(255,Math.round(c[ch]*shade)));data[k+3]=255;
 }
 return {size,data};
}
function texture(gl){
 const {size,data}=atlasData();
 // Separate repeating tiles keep derivatives continuous across seams. Seven
 // material samplers plus one shadow sampler fit WebGL 1's minimum limit.
 return [0,1,2,3,4,6,7].map((id,unit)=>{
  const pixels=new Uint8Array(128*128*4),sx=(id%4)*128,sy=Math.floor(id/4)*128;
  for(let y=0;y<128;y++)pixels.set(data.subarray(((sy+y)*size+sx)*4,((sy+y)*size+sx+128)*4),y*128*4);
  const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,128,128,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);return t;
 });
}
const vertex=`attribute vec3 aPos;attribute vec3 aNorm;attribute vec3 aCol;attribute vec2 aUV;attribute float aType;
uniform mat4 uVP;uniform mat4 uLightVP;varying vec3 vPos;varying vec3 vN;varying vec3 vC;varying vec2 vUV;varying float vType;varying vec4 vShadow;
void main(){vPos=aPos;vN=aNorm;vC=aCol;vUV=aUV;vType=aType;vShadow=uLightVP*vec4(aPos,1.);gl_Position=uVP*vec4(aPos,1.);}`;
const fragment=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vPos;varying vec3 vN;varying vec3 vC;varying vec2 vUV;varying float vType;varying vec4 vShadow;
uniform vec3 uEye;uniform float uNight;uniform vec3 uFog;uniform float uTime;uniform sampler2D uConcrete;uniform sampler2D uAsphalt;uniform sampler2D uGrass;uniform sampler2D uSlab;uniform sampler2D uMetal;uniform sampler2D uTile;uniform sampler2D uRoof;uniform sampler2D uShadow;uniform float uShadowEnabled;uniform float uShadowSize;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 tex(float id,vec2 uv){if(id<.5)return texture2D(uConcrete,uv).rgb;if(id<1.5)return texture2D(uAsphalt,uv).rgb;if(id<2.5||id==5.)return texture2D(uGrass,uv).rgb;if(id<3.5)return texture2D(uSlab,uv).rgb;if(id<4.5||id==8.)return texture2D(uMetal,uv).rgb;if(id<6.5)return texture2D(uTile,uv).rgb;return texture2D(uRoof,uv).rgb;}
float unpackDepth(vec4 c){return dot(c,vec4(1./16777216.,1./65536.,1./256.,1.));}
float shadow(vec3 normal){
 if(uShadowEnabled<.5)return 1.;vec3 p=vShadow.xyz/vShadow.w*.5+.5;
 if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;
 float bias=max(.0006,.0018*(1.-max(dot(normal,normalize(vec3(-.52,.80,.34))),0.)));
 float lit=0.;for(int x=0;x<2;x++)for(int y=0;y<2;y++){vec2 off=(vec2(float(x),float(y))-.5)/uShadowSize;float depth=unpackDepth(texture2D(uShadow,p.xy+off));lit+=step(p.z-bias,depth);}
 return mix(.32,1.,lit*.25);
}
void main(){
 vec3 N=normalize(vN),V=normalize(uEye-vPos),L=normalize(vec3(-.52,.80,.34));float sun=max(dot(N,L),0.);
 float dist=length(uEye-vPos),detail=1.-smoothstep(800.,3600.,dist);vec2 surface=abs(N.y)>.6?vPos.xz:(abs(N.x)>.6?vPos.zy:vPos.xy);
 vec3 albedo=vC;float rough=.8;vec3 emission=vec3(0.);float material=floor(vType+.1);
 if(material<.5){albedo*=mix(vec3(1.),tex(0.,surface*.085)*1.5,.60);}
 else if(material<1.5||material>9.5){
   bool office=material>9.5&&material<10.5;bool tile=material>10.5;
   albedo*=mix(vec3(1.),tex(tile?6.:0.,surface*(tile?.28:.11))*1.5,.55);
   vec2 uv=vUV,f=fract(uv);float frame=office?.06:.19;
   float window=step(frame,f.x)*(1.-step(1.-frame,f.x))*step(office?.06:.20,f.y)*(1.-step(office?.93:.81,f.y));
   float fresnel=pow(1.-max(dot(N,V),0.),4.);vec3 glass=mix(vec3(.12,.22,.28),vec3(.39,.55,.64),fresnel*.75+f.y*.16);
   glass+=vec3(.08,.11,.12)*sin(f.y*3.14159);albedo=mix(albedo,glass,window*mix(.6,1.,detail));rough=mix(.8,.23,window);
   float room=hash(floor(uv)+floor(vPos.xz*.018));float lit=step(office?.71:.60,room);
   emission=vec3(1.,.70,.36)*window*lit*uNight*(.40+.60*detail);
   // Balconies and horizontal floor bands remain visible without extra draw calls.
   if(tile)albedo*=mix(.72,1.,step(.07,f.y));
 }
 else if(material<2.5){emission=vC*(.28+uNight*1.55);rough=.35;}
 else if(material<3.5){
   vec2 wave=vPos.xz*.19;N=normalize(vec3(sin(wave.x+uTime*.38)*.025,1.,cos(wave.y+wave.x*.5-uTime*.26)*.035));
   float fresnel=.10+pow(1.-max(dot(N,V),0.),3.)*.8;
   albedo=mix(vec3(.035,.12,.14),mix(vec3(.43,.61,.72),vec3(.07,.14,.24),uNight),fresnel);rough=.16;
   emission+=vec3(.09,.14,.17)*pow(max(0.,sin(wave.y*2.+uTime*.12)),12.)*.04;
 }
 else if(material<4.5){albedo*=tex(1.,surface*.33)*4.;rough=.96;}
 else if(material<5.5){albedo*=tex(2.,surface*.09)*2.4;rough=1.;}
 else if(material<6.5){albedo*=tex(3.,surface*.022)*1.75;rough=.88;}
 else if(material<7.5){albedo*=tex(7.,surface*.055)*1.8;rough=.78;}
 else if(material<8.5){albedo*=tex(4.,surface*.055)*1.55;rough=.33;}
 else{albedo*=tex(5.,surface*.22)*2.;rough=.95;}
 float sh=shadow(N);float hemi=N.y*.5+.5;vec3 ambient=mix(vec3(.27,.29,.31),vec3(.54,.62,.70),hemi);
 ambient=mix(ambient,ambient*vec3(.58,.65,.84),uNight);
 vec3 direct=mix(vec3(.83,.77,.66),vec3(.25,.34,.46),uNight)*sun*sh;
 float baseAO=mix(.68,1.,smoothstep(-4.,18.,vPos.y));if(N.y>.65)baseAO=1.;
 vec3 c=albedo*(ambient+direct)*baseAO;
 vec3 H=normalize(L+V);float spec=pow(max(dot(N,H),0.),mix(75.,5.,rough))*(1.-rough)*sh;
 c+=mix(vec3(.44,.42,.37),vec3(.13,.21,.28),uNight)*spec+emission;
 float fog=smoothstep(3900.,11500.,dist)*.64;c=mix(c,uFog,fog);c=pow(max(c,vec3(0.)),vec3(.90));gl_FragColor=vec4(c,1.);
}`;
// Static packed-depth shadow map. Re-render only when building visibility changes.
function shadows(gl,size){
 function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,'attribute vec3 p;uniform mat4 vp;void main(){gl_Position=vp*vec4(p,1.);}'));
 gl.attachShader(p,compile(gl.FRAGMENT_SHADER,'precision highp float;void main(){vec4 d=fract(gl_FragCoord.z*vec4(16777216.,65536.,256.,1.));d-=d.xxyz*vec4(0.,1./256.,1./256.,1./256.);gl_FragColor=d;}'));
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 const f=gl.createFramebuffer(),t=gl.createTexture(),depth=gl.createRenderbuffer();gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size,size);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const pos=gl.getAttribLocation(p,'p'),vp=gl.getUniformLocation(p,'vp');
 return {texture:t,ok,size,render(meshes,matrix){if(!ok)return;gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.viewport(0,0,size,size);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(p);for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(pos);gl.uniformMatrix4fv(vp,false,matrix);for(const m of meshes){gl.bindBuffer(gl.ARRAY_BUFFER,m.buf);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,48,0);gl.drawArrays(gl.TRIANGLES,0,m.count)}gl.bindFramebuffer(gl.FRAMEBUFFER,null);}};
}
const api={atlasData,texture,vertex,fragment,shadows};if(typeof module==='object'&&module.exports)module.exports=api;else root.CircuitMaterials=api;
})(typeof window==='object'?window:this);
