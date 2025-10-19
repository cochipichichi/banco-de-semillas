
// Narrator (text-to-speech)
const speak = (text) => {
  if (!('speechSynthesis' in window)) { alert('TTS no soportado en este navegador'); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = document.documentElement.lang || 'es-CL';
  speechSynthesis.speak(u);
};

// Contrast toggle
const toggleContrast = () => {
  document.body.classList.toggle('contrast');
  localStorage.setItem('contrast', document.body.classList.contains('contrast') ? '1' : '0');
};
if (localStorage.getItem('contrast') === '1') document.body.classList.add('contrast');

// Language toggle (ES/EN)
const setLang = (lang) => {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const str = I18N[lang][key] || el.textContent;
    el.textContent = str;
  });
  localStorage.setItem('lang', lang);
};
const savedLang = localStorage.getItem('lang') || 'es';
window.addEventListener('DOMContentLoaded', () => setLang(savedLang));

// Simple i18n dictionary
const I18N = {
  es: {
    title: "Banco de Semillas — Germinando futuro, cuidando el suelo.",
    tagline: "Explora recursos 3D/AR, guías y simuladores educativos para tu invernadero.",
    card_internal: "Repositorios internos",
    card_tools: "Herramientas de aprendizaje",
    card_compare: "Comparativa",
    card_sim: "Simulador",
    card_guides: "Guías PDF",
    open: "Abrir",
    physalis: "Physalis (aguaymanto)",
    salvia: "Salvia",
    eneldo: "Eneldo",
    albahaca: "Albahaca",
    narrator: "🗣️ Narrador",
    contrast: "🌓 Alto contraste",
    to_en: "EN",
    to_es: "ES"
  },
  en: {
    title: "Seed Bank — Growing futures, caring for the soil.",
    tagline: "Explore 3D/AR resources, guides, and educational simulators for your greenhouse.",
    card_internal: "Internal repositories",
    card_tools: "Learning tools",
    card_compare: "Comparison",
    card_sim: "Simulator",
    card_guides: "Guides (PDF)",
    open: "Open",
    physalis: "Physalis (goldenberry)",
    salvia: "Sage",
    eneldo: "Dill",
    albahaca: "Basil",
    narrator: "🗣️ Narrator",
    contrast: "🌓 High contrast",
    to_en: "EN",
    to_es: "ES"
  }
};

// Particles
(function(){
  const c = document.getElementById('particles');
  const ctx = c.getContext('2d');
  let particles = [];
  let w, h;
  const R = () => Math.random();
  const reset = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
  window.addEventListener('resize', reset); reset();
  const N = 100;
  for (let i=0;i<N;i++){
    particles.push({
      x:R()*w, y:R()*h, r:1+R()*2.2,
      vx:(R()-.5)*.3, vy:(R()-.5)*.3,
      a:.25 + R()*.65
    });
  }
  const step = () => {
    ctx.clearRect(0,0,w,h);
    for (const p of particles){
      p.x+=p.vx; p.y+=p.vy;
      if (p.x<0||p.x>w) p.vx*=-1;
      if (p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(64,200,64,${p.a})`;
      ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(64,200,64,.6)';
      ctx.fill();
    }
    requestAnimationFrame(step);
  };
  step();
})();

// PWA register
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
