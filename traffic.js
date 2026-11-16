/* Anonymous page-view counter for the existing Taipei qualifying service. */
(function(root){'use strict';
const KEY='taipei-visitor-id',ENDPOINT='https://nomowho-taipei-qualifying.mighty-harp-8860.chatgpt.site/api/traffic/visit';
function start(host=root){
 if(host.navigator?.doNotTrack==='1'||!host.crypto?.randomUUID)return false;
 let visitorId;try{visitorId=host.localStorage.getItem(KEY);if(!visitorId){visitorId=host.crypto.randomUUID();host.localStorage.setItem(KEY,visitorId);}}catch{visitorId=host.crypto.randomUUID();}
 host.fetch(ENDPOINT,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId})}).catch(()=>{});
 return true;
}
const api={start};if(typeof module==='object')module.exports=api;else{root.CircuitTraffic=api;start();}
})(typeof window==='object'?window:globalThis);
