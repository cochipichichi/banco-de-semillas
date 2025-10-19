
const LS_ENDPOINT = 'sheets_endpoint_v1';
const LS_QUEUE    = 'sheets_queue_v1';

export function getEndpoint(){
  return localStorage.getItem(LS_ENDPOINT) || '';
}
export function setEndpoint(url){
  localStorage.setItem(LS_ENDPOINT, url.trim());
}

function loadQueue(){
  try { return JSON.parse(localStorage.getItem(LS_QUEUE)) || []; }
  catch(e){ return []; }
}
function saveQueue(arr){
  localStorage.setItem(LS_QUEUE, JSON.stringify(arr));
}

export async function sendToSheets(payload){
  const url = getEndpoint();
  if (!url){
    // no endpoint, queue locally and return
    const q = loadQueue(); q.push({ts:Date.now(), payload});
    saveQueue(q);
    return {ok:false, reason:'NO_ENDPOINT', queued:true};
  }
  try{
    const res = await fetch(url, {
      method:'POST',
      mode:'no-cors', // allow Apps Script without CORS
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    // With no-cors we cannot read status; assume success if no exception
    return {ok:true};
  }catch(err){
    const q = loadQueue(); q.push({ts:Date.now(), payload});
    saveQueue(q);
    return {ok:false, reason:String(err), queued:true};
  }
}

// Best-effort retry queued items
export async function flushQueue(){
  const url = getEndpoint();
  if (!url) return {ok:false, reason:'NO_ENDPOINT'};
  const q = loadQueue();
  if (!q.length) return {ok:true, sent:0};
  let sent = 0, kept = [];
  for (const item of q){
    try{
      await fetch(url, {method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(item.payload)});
      sent++;
    }catch(e){
      kept.push(item);
    }
  }
  saveQueue(kept);
  return {ok:true, sent, kept: kept.length};
}

// UI for ajustes page
(function(){
  if (!location.pathname.endsWith('/ajustes/index.html')) return;
  const ep = document.getElementById('endpoint');
  const st = document.getElementById('status');
  ep.value = getEndpoint();
  document.getElementById('save').addEventListener('click', ()=>{
    setEndpoint(ep.value);
    st.textContent = '✅ Guardado.';
  });
  document.getElementById('test').addEventListener('click', async ()=>{
    const payload = {type:'test', source:'ajustes', ts: new Date().toISOString(), ping:true};
    const r = await sendToSheets(payload);
    st.textContent = r.ok ? '✅ Envío de prueba realizado (no-cors, sin lectura de respuesta).' : '⚠️ No se pudo enviar, se guardó en cola local.';
  });
  // try flush
  flushQueue().then(r=>{
    if (r.ok) st.textContent = (st.textContent==='—' ? '' : st.textContent+'\n') + `⟳ Reenvío: ${r.sent||0} enviados.`;
  });
})();
