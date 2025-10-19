
// Simple species parameters (kept in sync with server-side build)
const SPEC = {
  physalis: {name:"Physalis (aguaymanto)", temp_opt:[18,26], humidity_opt:[50,70], germ_days:[7,14], water_ml_day_per_plant:220},
  salvia:   {name:"Salvia", temp_opt:[15,25], humidity_opt:[40,60], germ_days:[10,21], water_ml_day_per_plant:180},
  eneldo:   {name:"Eneldo", temp_opt:[16,22], humidity_opt:[45,65], germ_days:[10,14], water_ml_day_per_plant:160},
  albahaca: {name:"Albahaca", temp_opt:[20,28], humidity_opt:[55,75], germ_days:[5,10],  water_ml_day_per_plant:250}
};

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function scoreRange(v,[a,b]){
  if (v>=a && v<=b) return 1.0;
  const d = (v<a) ? (a-v) : (v-b);
  // penalize gently: each unit outside range reduces 5%
  return Math.max(0, 1 - d*0.05);
}

function estimate(spec, temp, hum, light, plants){
  const p = SPEC[spec];
  const sTemp = scoreRange(temp, p.temp_opt);
  const sHum  = scoreRange(hum,  p.humidity_opt);
  const sLight = scoreRange(light, [6,10]); // heuristic target
  const health = (sTemp*0.45 + sHum*0.35 + sLight*0.20);
  // Watering: adjust baseline by humidity and health
  const daily_ml = p.water_ml_day_per_plant * (0.8 + (1-sHum)*0.6) * (0.9 + (1-health)*0.4);
  const freq_days = (daily_ml<140) ? 2 : (daily_ml<220 ? 1 : 0.75); // every 2d, daily, ~twice/day
  // Germination: adjust by temp score
  const [gmin,gmax] = p.germ_days;
  const gAvg = (gmin+gmax)/2;
  const germ = clamp(Math.round(gAvg * (1.2 - sTemp*0.4)), gmin, gmax+7);
  return {
    name:p.name,
    health: Math.round(health*100),
    daily_ml: Math.round(daily_ml*plants),
    per_plant_ml: Math.round(daily_ml),
    freq_days,
    germ_days:germ
  };
}

function humanFreq(d){
  if (d>=1.75) return "Cada 2 días";
  if (d>=0.9)  return "Diario";
  return "2 veces al día";
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sim-form');
  const out  = document.getElementById('sim-out');
  form.addEventListener('input', calc);
  form.addEventListener('submit', (e)=>{ e.preventDefault(); calc(); });
  calc();
  function calc(){
    const spec = form.species.value;
    const temp = Number(form.temp.value||22);
    const hum  = Number(form.hum.value||55);
    const light= Number(form.light.value||8);
    const plants = Number(form.plants.value||1);
    const r = estimate(spec,temp,hum,light,plants);
    out.innerHTML = `
      <p><strong>Especie:</strong> ${r.name}</p>
      <p><strong>Salud esperada:</strong> ${r.health}%</p>
      <p><strong>Agua recomendada:</strong> ${r.per_plant_ml} ml/planta/día — <em>${r.daily_ml} ml/día total</em> (${humanFreq(r.freq_days)})</p>
      <p><strong>Germinación estimada:</strong> ${r.germ_days} días</p>
    `;
  }
});
