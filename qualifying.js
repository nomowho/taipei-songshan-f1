(function(root){
'use strict';
const API='https://nomowho-taipei-qualifying.mighty-harp-8860.chatgpt.site/api/qualifying',BOARD='taipei-drive2b-v1',sessions=new Set();
function driverName(raw){const name=String(raw).normalize('NFKC').trim().replace(/\s+/gu,' ');if(!name||Array.from(name).length>20||/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(raw))throw Error('車手名字請輸入 1～20 個字');return name;}
async function request(path,data,token){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);try{const r=await fetch(API+path,{method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined,signal:controller.signal,credentials:'omit',cache:'no-store'});const body=await r.json();if(!r.ok){const e=new Error(body.error||'排行榜暫時無法連線');e.status=r.status;throw e;}return body;}catch(e){if(e.name==='AbortError')throw Error('排行榜連線逾時，請重試');throw e;}finally{clearTimeout(timer);}}
async function top(){return (await request('/top')).entries;}
async function begin(raw,onStatus,onBoard){const result=await request('/session',{name:driverName(raw),boardVersion:BOARD});let sequence=0,busy=false,failed=false;const pending=[];
 const session={name:result.name,entries:result.entries,submit(lap){if(failed){onStatus('成績連線已失效，請返回參觀後重新進入排位賽',false);return;}pending.push({id:crypto.randomUUID(),boardVersion:BOARD,sequence:++sequence,lapNumber:lap.lapNumber,lapMs:Math.round(lap.time*1000),sectors:lap.sectors.map(t=>Math.round(t*1000)),checkpoints:24});sessions.add(session);flush();},retry:flush};
 async function flush(){if(busy||failed||!pending.length)return;busy=true;onStatus('有效圈速上傳中…',false);try{while(pending.length){const response=await request('/lap',pending[0],result.token);pending.shift();onBoard(response.entries);}sessions.delete(session);onStatus('成績已同步 · 每位車手保留最快單圈',false);}catch(e){if(e.status>=400&&e.status<500&&e.status!==429){failed=true;sessions.delete(session);onStatus(e.message+'；請重新進入排位賽',false);}else{onStatus('成績尚未上傳 · 可按重試',true);}}finally{busy=false;}}
 return session;
}
function retryPending(){for(const session of sessions)session.retry();}
root.CircuitQualifying={driverName,top,begin,retryPending};
})(window);
