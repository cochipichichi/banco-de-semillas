
const SPEC={
  physalis:{name:"Physalis (aguaymanto)",temp_opt:[18,26],humidity_opt:[50,70],germ_days:[7,14],water_ml_day_per_plant:220},
  salvia:{name:"Salvia",temp_opt:[15,25],humidity_opt:[40,60],germ_days:[10,21],water_ml_day_per_plant:180},
  eneldo:{name:"Eneldo",temp_opt:[16,22],humidity_opt:[45,65],germ_days:[10,14],water_ml_day_per_plant:160},
  albahaca:{name:"Albahaca",temp_opt:[20,28],humidity_opt:[55,75],germ_days:[5,10],water_ml_day_per_plant:250}
};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function scoreRange(v,[a,b]){ if(v>=a&&v<=b) return 1.0; const d=(v<a)?(a-v):(v-b); return Math.max(0,1-d*0.05); }
function estimate(spec,temp,hum,light,plants){
  const p=SPEC[spec]; const sT=scoreRange(temp,p.temp_opt), sH=scoreRange(hum,p.humidity_opt), sL=scoreRange(light,[6,10]);
  const health=(sT*0.45+sH*0.35+sL*0.20); const daily=p.water_ml_day_per_plant*(0.8+(1-sH)*0.6)*(0.9+(1-health)*0.4);
  const freq=(daily<140)?2:(daily<220?1:0.75); const [gmin,gmax]=p.germ_days; const gAvg=(gmin+gmax)/2;
  const germ=clamp(Math.round(gAvg*(1.2-sT*0.4)),gmin,gmax+7);
  return {name:p.name, health:Math.round(health*100), daily_ml:Math.round(daily*plants), per_plant_ml:Math.round(daily), freq_days:freq, germ_days:germ};
}
function humanFreq(d){ if(d>=1.75) return "Cada 2 días"; if(d>=0.9) return "Diario"; return "2 veces al día"; }
document.addEventListener('DOMContentLoaded',()=>{
  const f=document.getElementById('sim-form'), out=document.getElementById('sim-out');
  const calc=()=>{const r=estimate(f.species.value,Number(f.temp.value||22),Number(f.hum.value||55),Number(f.light.value||8),Number(f.plants.value||1));
    out.innerHTML=`<p><strong>Especie:</strong> ${r.name}</p><p><strong>Salud esperada:</strong> ${r.health}%</p><p><strong>Agua recomendada:</strong> ${r.per_plant_ml} ml/planta/día — <em>${r.daily_ml} ml/día total</em> (${humanFreq(r.freq_days)})</p><p><strong>Germinación estimada:</strong> ${r.germ_days} días</p>`;};
  f.addEventListener('input',calc); f.addEventListener('submit',e=>{e.preventDefault();calc()}); calc();
});
