
import { sendToSheets, flushQueue } from './sheets.js';

const KEY = 'quiz_semillas_v1';

function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||[] }catch(e){ return [] } }
function save(arr){ localStorage.setItem(KEY, JSON.stringify(arr)) }

function toCSV(arr){
  const head = ['fecha','nombre','q1','q2','q3','score'];
  const lines = [head.join(',')];
  for(const r of arr){
    const row = head.map(k => `"${String(r[k]).replace(/"/g,'""')}"`).join(',');
    lines.push(row);
  }
  return lines.join('\n');
}
function download(name, txt){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt],{type:'text/csv'}));
  a.download = name; a.click();
}

function feedback(choice, correct){
  return (choice===correct) ? '✅ Correcto' : '❌ Incorrecto';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('quiz-form');
  const out  = document.getElementById('quiz-out');
  document.getElementById('btn-export-quiz').addEventListener('click', ()=>{
    const csv = toCSV(load());
    const d = new Date();
    const ts = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    download(`quiz_${ts}.csv`, csv);
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const nombre = fd.get('nombre');
    const q1 = fd.get('q1'); const q2 = fd.get('q2'); const q3 = fd.get('q3');
    const answers = {q1, q2, q3};
    const correct = {q1:'b', q2:'c', q3:'b'};
    let score = 0;
    score += (q1===correct.q1)?1:0;
    score += (q2===correct.q2)?1:0;
    score += (q3===correct.q3)?1:0;

    out.innerHTML = `
      <p>${nombre}</p>
      <p>1) ${feedback(q1, correct.q1)}</p>
      <p>2) ${feedback(q2, correct.q2)}</p>
      <p>3) ${feedback(q3, correct.q3)}</p>
      <p><strong>Puntaje:</strong> ${score}/3</p>
    `;

    const rec = {fecha: new Date().toISOString(), nombre, q1, q2, q3, score};
    const arr = load(); arr.push(rec); save(arr);

    // Enviar a Sheets si hay endpoint, si no, quedará en cola
    await sendToSheets({type:'quiz', data: rec, ts: new Date().toISOString(), page:'quiz'});
    flushQueue();
    form.reset();
  });
});
