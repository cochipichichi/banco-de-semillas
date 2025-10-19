
self.addEventListener('install',e=>{e.waitUntil(caches.open('semillas-v3').then(c=>c.addAll([
'/', '/index.html','/assets/style.css','/assets/main.js','/particles.js','/favicon.ico',
'/comparativa/index.html','/simulador/index.html','/assets/simulador.js',
'/ticket/index.html','/assets/ticket.js',
'/quiz/index.html','/assets/quiz.js','/assets/quiz_bank.json',
'/ajustes/index.html','/assets/sheets.js'
])))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))})