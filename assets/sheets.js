
const LS_ENDPOINT='sheets_endpoint_v1'; const LS_QUEUE='sheets_queue_v1'; const LS_APIKEY='sheets_apikey_v1';
export function getEndpoint(){return localStorage.getItem(LS_ENDPOINT)||'';}
export function setEndpoint(url){localStorage.setItem(LS_ENDPOINT,(url||'').trim());}
export function getApiKey(){return localStorage.getItem(LS_APIKEY)||'';}
export function setApiKey(v){localStorage.setItem(LS_APIKEY,(v||'').trim());}

function loadQueue(){try{return JSON.parse(localStorage.getItem(LS_QUEUE))||[]}catch(e){return[]}}
function saveQueue(a){localStorage.setItem(LS_QUEUE,JSON.stringify(a))}

export async function sendToSheets(payload){
  const url=getEndpoint(); if(!url){const q=loadQueue(); q.push({ts:Date.now(),payload}); saveQueue(q); return {ok:false, reason:'NO_ENDPOINT', queued:true};}
  try{
    await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({},payload,{apiKey:getApiKey()}))});
    return {ok:true};
  }catch(err){
    const q=loadQueue(); q.push({ts:Date.now(),payload}); saveQueue(q); return {ok:false, reason:String(err), queued:true};
  }
}

export async function flushQueue(){
  const url=getEndpoint(); if(!url) return {ok:false,reason:'NO_ENDPOINT'};
  const q=loadQueue(); if(!q.length) return {ok:true,sent:0};
  let sent=0, kept=[];
  for(const item of q){
    try{ await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({},item.payload,{apiKey:getApiKey()}))}); sent++; }
    catch(e){ kept.push(item); }
  }
  saveQueue(kept); return {ok:true,sent,kept:kept.length};
}

(function(){
  if(!location.pathname.endsWith('/ajustes/index.html')) return;
  const ep=document.getElementById('endpoint'); const ak=document.getElementById('apikey'); const st=document.getElementById('status');
  ep.value=getEndpoint(); ak.value=getApiKey();
  document.getElementById('save').addEventListener('click',()=>{ setEndpoint(ep.value); setApiKey(ak.value); st.textContent='✅ Guardado.'; });
  document.getElementById('test').addEventListener('click', async ()=>{
    const r=await sendToSheets({type:'test',source:'ajustes',ts:new Date().toISOString(),ping:true}); st.textContent=r.ok?'✅ Envío de prueba realizado.':'⚠️ No se pudo enviar, quedó en cola.';
  });
  flushQueue().then(r=>{ if(r.ok) st.textContent=((st.textContent==='—')?'':st.textContent+'\n')+`⟳ Reenvío: ${r.sent||0} enviados.`; });
})();
