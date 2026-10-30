import './style.css';
import { calculate, presets, stages } from './model.js';
import { createVisualization } from './visualization.js';
import { createLayout, icon } from './layout.js';
import { waterSplit } from './routes.js';

document.querySelector('#app').innerHTML = createLayout();

let state={...presets.normal}, activeStage=0, playing=true, speed=.5;
let substance='all';
const scene = createVisualization();
function update() {
  const r=calculate(state);
  document.querySelector('#urine').textContent=state.urineLabel;
  document.querySelector('#urine-trend').textContent=state.urineLabel==='많음'?'↑ 늘어남':state.urineLabel==='적음'?'↓ 줄어듦':'정상 상태';
  document.querySelector('#urine-bar').style.width=`${100-state.waterReabsorption}%`;
  document.querySelector('#scenario-note').textContent=state.note;
  const rate=state.waterReabsorption, split=waterSplit(rate);
  document.querySelector('#water-reabsorbed').textContent=`${rate}개 · ${rate}%`;
  document.querySelector('#water-excreted').textContent=`${100-rate}개 · ${100-rate}%`;
  document.querySelector('#water-return-bar').style.width=`${rate}%`;
  document.querySelector('#water-urine-bar').style.width=`${100-rate}%`;
  document.querySelector('.water-ratio-bar').setAttribute('aria-label',`재흡수 ${rate}%, 오줌 ${100-rate}%`);
  const drops=document.querySelector('#water-drops');
  drops.innerHTML=Array.from({length:split.total},(_,i)=>`<i class="${i<split.reabsorbed?'returned':'excreted'}"></i>`).join('');
  drops.setAttribute('aria-label',`물 입자 ${split.total}개 중 ${split.reabsorbed}개 재흡수, ${split.excreted}개 오줌`);
  document.querySelectorAll('[data-water-scenario]').forEach(button=>{const on=presets[button.dataset.waterScenario].name===state.name;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on));});
  if(substance==='water')document.querySelector('#substance-note').textContent=`물은 100% 여과된 뒤 ${rate}%가 혈액으로 재흡수되고 ${100-rate}%는 오줌으로 나가요. 비교를 위한 가정값입니다.`;
  scene?.setState({stage:activeStage,playing,speed,waterReabsorption:rate,gfr:r.gfr,substance});
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
document.querySelectorAll('[data-water-scenario]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#scenario').value=button.dataset.waterScenario;state={...presets[button.dataset.waterScenario]};update();}));
const substanceNotes={all:'색이 있는 입자를 천천히 따라가 보세요. 물질을 선택하면 그 물질만 보여요.',blood:'혈구는 크기가 커서 여과되지 않아요. 토리와 모세혈관을 따라 혈액 안에 남아요.',protein:'단백질은 크기가 커서 여과되지 않고 혈액 안에 남아요.',urea:'이 모형의 요소는 100% 분비되어 오줌으로 나가요. 콩팥정맥에는 요소가 남지 않아요. 실제 콩팥의 비율과 다른 학습용 가정입니다.',water:'물은 100% 여과된 뒤 상황에 따라 일부만 재흡수돼요. 물방울 수와 비율로 혈액과 오줌으로 나뉘는 양을 비교해 보세요.',glucose:'포도당은 100% 여과된 뒤 100% 재흡수되어 혈액으로 돌아가요. 여과를 건너뛰지 않고, 오줌에는 남지 않아요.',amino:'아미노산은 100% 여과된 뒤 100% 재흡수되어 혈액으로 돌아가요. 여과를 건너뛰지 않고, 오줌에는 남지 않아요.'};
document.querySelectorAll('[data-substance]').forEach(b=>b.addEventListener('click',()=>{substance=b.dataset.substance;document.querySelectorAll('[data-substance]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});document.querySelector('#substance-note').textContent=substanceNotes[substance];update();}));
document.querySelector('#play').addEventListener('click',()=>{playing=!playing;document.querySelector('#play').textContent=icon(playing?'pause':'play');document.querySelector('#play').setAttribute('aria-label',playing?'일시정지':'재생');document.querySelector('#play-status').textContent=playing?'물질 이동 관찰 중':'일시정지 · 흐름을 자세히 살펴보세요';update();});
document.querySelector('#speed').addEventListener('click',e=>{speed=speed===.5?.25:speed===.25?1:.5;e.target.textContent=`${speed}×`;update();});
document.querySelector('#reset').addEventListener('click',()=>{state={...presets.normal};substance='all';document.querySelector('[data-substance=all]').click();document.querySelector('#scenario').value='normal';playing=true;speed=.5;document.querySelector('#play').textContent=icon('pause');document.querySelector('#play').setAttribute('aria-label','일시정지');document.querySelector('#play-status').textContent='물질 이동 관찰 중';document.querySelector('#speed').textContent='0.5×';scene?.reset();document.querySelector('#rotate').setAttribute('aria-pressed','false');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='front'));selectStage(0);});
document.querySelector('#rotate').addEventListener('click',e=>{const b=e.currentTarget;const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));scene?.rotate(on);});
document.querySelector('#reset-view').addEventListener('click',()=>scene?.reset());
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el===b));scene?.view(b.dataset.view);}));
selectStage(0);
document.documentElement.dataset.appReady = 'true';
