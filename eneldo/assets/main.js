
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>[...el.querySelectorAll(s)];
const store = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
const read = (k,def=null)=>JSON.parse(localStorage.getItem(k) || JSON.stringify(def));
function toggleContrast(){
  document.documentElement.classList.toggle('contrast-on');
  store('contrast', document.documentElement.classList.contains('contrast-on'));
}
(function init(){
  if(read('contrast', false)) document.documentElement.classList.add('contrast-on');
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js'); }
})();
function downloadCSV(filename, rows) {
  const process = v => (/^[0-9,\-:"\s]+$/.test(v)? v : `"${String(v).replace(/"/g,'""')}"`);
  const csv = rows.map(r => r.map(process).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
