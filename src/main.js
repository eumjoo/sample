import './style.css';
import { calculate, presets, stages } from './model.js';
import { createVisualization } from './visualization.js';
import { createLayout, icon } from './layout.js';

document.querySelector('#app').innerHTML = createLayout();

let state={...presets.normal}, activeStage=0, playing=true, speed=1;
let substance='all';
const scene = createVisualization();
function update() {
  const r=calculate(state);
  document.querySelector('#urine').textContent=r.urine.toFixed(2);
  document.querySelector('#urine-trend').textContent=r.urine>2?'↑ 증가':r.urine<1?'↓ 감소':'정상 범위';
  document.querySelector('#urine-bar').style.width=`${Math.min(100,r.urine/5*100)}%`;
  document.querySelector('#gfr').textContent=r.gfr.toFixed(0);
  document.querySelector('#water').textContent=r.waterPercent.toFixed(1);
  document.querySelector('#scenario-note').textContent=state.note;
  scene?.setState({stage:activeStage,playing,speed,adh:state.adh,gfr:r.gfr,substance});
}
function selectStage(index) {
 activeStage=index;const s=stages[index];
 document.querySelectorAll('[data-stage]').forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index));});
 document.querySelector('#detail-tag').textContent=`지금 관찰 중 · 0${index+1} ${s.title}`;
 document.querySelector('#detail-tag').style.color=s.color;
 document.querySelector('#detail-title').textContent=s.site;
 document.querySelector('#detail-text').textContent=s.detail;
 update();
}
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>selectStage(Number(b.dataset.stage))));
document.querySelector('#scenario').addEventListener('change',e=>{state={...presets[e.target.value]};update();});
const substanceNotes={all:'색이 있는 입자를 따라가 보세요. 물질을 선택하면 해당 물질만 표시됩니다.',blood:'혈구는 크기가 커서 여과되지 않아요. 사구체와 주위 모세혈관을 따라 혈액 안에 남습니다.',protein:'대부분의 단백질은 여과 장벽을 통과하지 못하고 혈액 안에 남습니다.',urea:'요소는 여과됩니다. 일부는 재흡수되거나 헨레고리로 다시 분비되지만, 최종적으로 일부가 소변으로 배출돼요.',water:'물은 여과된 뒤 대부분 재흡수됩니다. 수분 부족일 때 더 많이 재흡수되고, 물을 마신 후에는 소변으로 더 많이 나갑니다.',glucose:'포도당은 여과된 뒤 정상 상태에서 근위세뇨관에서 모두 재흡수됩니다. 소변에는 거의 남지 않아요.',amino:'아미노산은 여과된 뒤 정상 상태에서 근위세뇨관에서 거의 모두 재흡수됩니다.'};
document.querySelectorAll('[data-substance]').forEach(b=>b.addEventListener('click',()=>{substance=b.dataset.substance;document.querySelectorAll('[data-substance]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});document.querySelector('#substance-note').textContent=substanceNotes[substance];update();}));
document.querySelector('#play').addEventListener('click',()=>{playing=!playing;document.querySelector('#play').textContent=icon(playing?'pause':'play');document.querySelector('#play').setAttribute('aria-label',playing?'일시정지':'재생');document.querySelector('#play-status').textContent=playing?'물질 이동 관찰 중':'일시정지 · 흐름을 자세히 살펴보세요';update();});
document.querySelector('#speed').addEventListener('click',e=>{speed=speed===1?2:speed===2?0.5:1;e.target.textContent=`${speed}×`;update();});
document.querySelector('#reset').addEventListener('click',()=>{state={...presets.normal};substance='all';document.querySelector('[data-substance=all]').click();document.querySelector('#scenario').value='normal';playing=true;speed=1;document.querySelector('#play').textContent=icon('pause');document.querySelector('#play').setAttribute('aria-label','일시정지');document.querySelector('#play-status').textContent='물질 이동 관찰 중';document.querySelector('#speed').textContent='1×';scene?.reset();document.querySelector('#rotate').setAttribute('aria-pressed','false');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='front'));selectStage(0);});
document.querySelector('#rotate').addEventListener('click',e=>{const b=e.currentTarget;const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));scene?.rotate(on);});
document.querySelector('#reset-view').addEventListener('click',()=>scene?.reset());
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el===b));scene?.view(b.dataset.view);}));
selectStage(0);
document.documentElement.dataset.appReady = 'true';
