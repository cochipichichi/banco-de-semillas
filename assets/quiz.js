
import { sendToSheets, flushQueue } from './sheets.js';

const KEY='quiz_semillas_v2'; // new version
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
const save=(a)=>localStorage.setItem(KEY,JSON.stringify(a));

function toCSV(arr){
  const head=['fecha','nombre','species','total','correct','score_pct','answers_json'];
  const lines=[head.join(',')];
  for(const r of arr){
    const row = head.map(k => `"${String(r[k]).replace(/"/g,'""')}"`).join(',');
    lines.push(row);
  }
  return lines.join('\\n');
}
function download(name,txt){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));
  a.download=name; a.click();
}

async function loadBank(){
  const res = await fetch('../assets/quiz_bank.json');
  return await res.json();
}

function pick(arr, n){
  const a=[...arr]; const out=[];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];}
  for(let i=0;i<Math.min(n,a.length);i++) out.push(a[i]);
  return out;
}

function renderItems(container, items){
  container.innerHTML = items.map((it,idx)=>{
    const opts = it.opts.map((op,i)=>`<label><input type="radio" name="q${idx}" value="${i}" required> ${op}</label>`).join('');
    return `<fieldset class="card" style="margin-top:.5rem"><legend><strong>${idx+1}.</strong> ${it.q}</legend>${opts}</fieldset>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const bank = await loadBank();
  const form = document.getElementById('quiz-form');
  const itemsDiv = document.getElementById('quiz-items');
  const out  = document.getElementById('quiz-out');

  document.getElementById('btn-export-quiz').addEventListener('click', ()=>{
    const csv = toCSV(load());
    const d = new Date();
    const ts = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    download(`quiz_${ts}.csv`, csv);
  });

  document.getElementById('btn-generate').addEventListener('click', ()=>{
    const species = form.species.value;
    const n = Math.max(8, Math.min(10, Number(form.n.value||8)));
    let pool = [];
    if (species==='mixto'){
      // combine all banks
      pool = [...bank.mixto, ...bank.albahaca, ...bank.physalis, ...bank.salvia, ...bank.eneldo];
    } else {
      pool = [...(bank[species]||[])];
      // add some general questions if needed
      if (pool.length < n) pool = pool.concat(bank.mixto);
    }
    const items = pick(pool, n);
    form.dataset.items = JSON.stringify(items);
    renderItems(itemsDiv, items);
    out.textContent = '—';
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (!form.dataset.items){ alert('Primero genera los ítems.'); return; }
    const items = JSON.parse(form.dataset.items);
    const fd = new FormData(form);
    const nombre = fd.get('nombre');
    const species = fd.get('species');
    const answers = [];
    let correct = 0;
    items.forEach((it,idx)=>{
      const v = Number(fd.get('q'+idx));
      const ok = (v===it.a);
      if (ok) correct++;
      answers.push({q:it.q, chosen:v, correct:it.a, correcto:ok});
    });
    const total = items.length;
    const score_pct = Math.round(100 * correct / total);

    const level = (score_pct>=90)?'Sobresaliente':(score_pct>=70)?'Adecuado':(score_pct>=50)?'Básico':'Insuficiente';

    out.innerHTML = `
      <p><strong>${nombre}</strong> — ${species}</p>
      <p>Correctas: ${correct}/${total} — Puntaje: ${score_pct}% — Nivel: <strong>${level}</strong></p>
    `;

    const rec = {
      fecha: new Date().toISOString(),
      nombre, species, total, correct, score_pct,
      answers_json: JSON.stringify(answers)
    };
    const arr = load(); arr.push(rec); save(arr);

    await sendToSheets({type:'quiz', page:'quiz', data:rec, ts:new Date().toISOString()});
    flushQueue();
    // opcional: form.reset(); // no reseteamos para que veas tus respuestas
  });
});
