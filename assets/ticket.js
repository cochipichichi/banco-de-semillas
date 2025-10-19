
import { sendToSheets, flushQueue } from './sheets.js';
const KEY='tickets_semillas_v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
const save=(a)=>localStorage.setItem(KEY,JSON.stringify(a));
function render(){const list=load();const div=document.getElementById('ticket-list'); if(!list.length){div.textContent='— Sin respuestas aún.';return;}
  div.innerHTML=list.map((r,i)=>`<div>#${i+1} — ${r.fecha} — ${r.nombre} — Aprendizaje: ${r.aprendizaje} — Difícil: ${r.dificil} — Mejora: ${r.mejora} — Auto: ${r.auto}</div>`).join('');}
function toCSV(arr){const head=['fecha','nombre','aprendizaje','dificil','mejora','auto']; const lines=[head.join(',')]; for(const r of arr){lines.push(head.map(k=>`"${String(r[k]).replace(/"/g,'""')}"`).join(','));} return lines.join('\n');}
function download(name,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));a.download=name;a.click();}
document.addEventListener('DOMContentLoaded',()=>{
  render();
  const form=document.getElementById('ticket-form');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    data.fecha=new Date().toISOString();
    const list=load(); list.push(data); save(list);
    // send best-effort to Sheets
    await sendToSheets({type:'ticket', data, ts:new Date().toISOString(), page:'ticket'});
    flushQueue();
    form.reset(); render(); alert('¡Guardado! También se intentó enviar a Sheets.');
  });
  document.getElementById('btn-export').addEventListener('click',()=>{
    const list=load(); if(!list.length){alert('No hay respuestas para exportar.');return;}
    const d=new Date(), ts=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    download(`ticket_salida_${ts}.csv`, toCSV(list));
  });
});
