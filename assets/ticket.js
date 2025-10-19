import { sendToSheets, flushQueue } from './sheets.js';

const KEY = 'tickets_semillas_v1';

function load(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch(e){ return []; }
}
function save(arr){
  localStorage.setItem(KEY, JSON.stringify(arr));
}
function render(){
  const list = load();
  const div = document.getElementById('ticket-list');
  if (!list.length){ div.textContent = '— Sin respuestas aún.'; return; }
  const rows = list.map((r,i)=> `<div>#${i+1} — ${r.fecha} — ${r.nombre} — Aprendizaje: ${r.aprendizaje} — Difícil: ${r.dificil} — Mejora: ${r.mejora} — Auto: ${r.auto}</div>`);
  div.innerHTML = rows.join('');
}

function toCSV(arr){
  const head = ['fecha','nombre','aprendizaje','dificil','mejora','auto'];
  const lines = [head.join(',')];
  for(const r of arr){
    const row = head.map(k => `"${String(r[k]).replace(/"/g,'""')}"`).join(',');
    lines.push(row);
  }
  return lines.join('\n');
}

function download(filename, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type:'text/csv'}));
  a.download = filename;
  a.click();
}

document.addEventListener('DOMContentLoaded', () => {
  render();
    flushQueue();
  const form = document.getElementById('ticket-form');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.fecha = new Date().toISOString();
    const list = load();
    list.push(data);
    save(list);
    // send to Sheets (best-effort)
    sendToSheets({type:'ticket', data, ts: new Date().toISOString(), page:'ticket'});
    form.reset();
    render();
    flushQueue();
    alert('¡Guardado en este dispositivo! Puedes exportar a CSV cuando quieras.');
  });
  document.getElementById('btn-export').addEventListener('click', ()=>{
    const list = load();
    if (!list.length){ alert('No hay respuestas para exportar.'); return; }
    const csv = toCSV(list);
    const d = new Date();
    const ts = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    download(`ticket_salida_${ts}.csv`, csv);
  });
});
