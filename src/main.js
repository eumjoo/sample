import './style.css';
import { calculate, presets, stages } from './model.js';
import { createScene } from './scene.js';

const icon = (name) => ({ play: '▶', pause: 'Ⅱ', reset: '↺', rotate: '⟳', arrow: '↗', expand: '⛶' }[name]);
document.querySelector('#app').innerHTML = `
<header class="topbar"><a class="brand" href="./"><span class="brand-mark">n<span>·</span></span> NEPHRON<span class="brand-light">LAB</span></a><span class="header-divider"></span><span class="header-sub">생명과학 인터랙티브 실험실</span><div class="header-right"><span class="online-dot"></span> 탐구 모드 <span class="chapter">HUMAN BIOLOGY <b> / 03</b></span></div></header>
<main><div class="page-heading"><div><div class="eyebrow">EXPLORE THE INVISIBLE</div><h1>작은 네프론, 놀라운 균형<span>.</span></h1><p>혈액이 소변이 되기까지, 우리 몸의 정교한 여과 시스템을 탐구해 보세요.</p></div><span class="subject-tag">인체의 항상성 <span>↗</span></span></div>
<div class="workspace"><section class="visual-panel"><div class="visual-header"><div><span class="eyebrow">LIVE SIMULATION</span><h2>네프론의 구조와 물질 이동</h2></div><span class="live-badge"><i></i> 실시간</span></div>
<div class="view-tabs" role="group" aria-label="모델 보기"><button class="active" data-view="3d">3D 모델</button><button data-view="front">정면 보기</button></div>
<div class="scene-wrap"><canvas id="nephron" aria-label="회전 및 확대 가능한 3D 네프론 모델"></canvas><div id="fallback" hidden>3D 그래픽을 시작할 수 없습니다. 아래 과정 설명과 수치 시뮬레이션은 계속 사용할 수 있습니다.</div><span class="anatomy-label label-glomerulus">사구체 <small>Glomerulus</small></span><span class="anatomy-label label-proximal">근위세뇨관</span><span class="anatomy-label label-distal">원위세뇨관</span><span class="anatomy-label label-loop">헨레고리 <small>Loop of Henle</small></span><span class="anatomy-label label-duct">집합관 <small>Collecting duct</small></span><div class="scene-guidance">드래그하여 회전 · 스크롤하여 확대</div><div class="model-controls"><button id="rotate" title="자동 회전" aria-label="자동 회전" aria-pressed="false">${icon('rotate')}</button><button id="reset-view" title="시점 초기화" aria-label="시점 초기화">${icon('expand')}</button></div></div>
<div class="legend"><span>분홍 관 · 혈액</span><span>금빛 관 · 세뇨관</span><span>입자 색 · 선택한 물질</span></div>
<div class="playback"><button id="play" class="play-button" aria-label="일시정지">${icon('pause')}</button><div class="play-info"><b id="play-status">물질 이동 관찰 중</b><span>선택한 과정의 입자 흐름을 따라가 보세요</span></div><button id="speed" class="speed-button" aria-label="재생 속도 변경">1×</button><button id="reset" class="reset-button" title="모든 설정 초기화" aria-label="모든 설정 초기화">${icon('reset')}</button></div></section>
<aside class="control-panel"><div class="panel-heading"><span class="eyebrow">EXPERIMENT CONTROLS</span><h2>어떤 변화가 생길까요?</h2><p>상황과 물질을 선택해 이동을 관찰하세요.</p></div><label class="field-label" for="scenario">상황 선택 <span>SCENARIO</span></label><select id="scenario">${Object.entries(presets).map(([key,p])=>`<option value="${key}">${p.name}</option>`).join('')}</select><div id="scenario-note" class="scenario-note"></div><div class="divider"></div><div class="conditions-heading"><h3>관찰할 물질</h3><span>눌러서 하나씩 보기</span></div><div class="substance-buttons"><button class="active" data-substance="all">모두 보기</button><button data-substance="blood"><i style="background:#f28d9d"></i>혈구</button><button data-substance="protein"><i style="background:#bb9aff"></i>단백질</button><button data-substance="urea"><i style="background:#f2c46e"></i>요소</button><button data-substance="water"><i style="background:#6cdbf2"></i>물</button><button data-substance="glucose"><i style="background:#94e3a4"></i>포도당</button><button data-substance="amino"><i style="background:#f5ac78"></i>아미노산</button></div><div class="substance-note" id="substance-note">색이 있는 입자를 따라가 보세요. 물질을 선택하면 해당 물질만 표시됩니다.</div><div class="tip"><span>ⓘ</span><p>혈구·단백질은 혈액에 남고, 포도당·아미노산은 정상적으로 모두 재흡수돼요.</p></div><div class="result-card"><div><span class="result-label">예상 소변 생성량</span><span class="result-pill">실시간 계산</span></div><p><strong id="urine"></strong><span>mL/min</span><span id="urine-trend"></span></p><div class="result-track"><i id="urine-bar"></i></div><small>정상 상태 기준 약 1–2 mL/min</small></div></aside></div>
<section class="process-section"><div class="section-heading"><div><span class="eyebrow">FOLLOW THE JOURNEY</span><h2>세 가지 과정, 하나의 균형</h2></div><p>과정 선택으로 관 사이의 이동을 강조해 보세요.</p></div><div class="process-cards">${stages.map((s,i)=>`<button class="process-card ${i===0?'selected':''}" data-stage="${i}" aria-pressed="${i===0}" style="--stage-color:${s.color}"><div class="card-top"><span class="step-number">0${i+1}</span><span class="stage-en">${s.en}</span><span class="card-arrow">↗</span></div><h3>${s.title}<span>${s.site}</span></h3><p>${s.description}</p><div class="molecules">${s.molecules.map(m=>`<span>${m}</span>`).join('')}</div></button>`).join('')}</div></section>
<section class="detail-panel" aria-live="polite"><div><span id="detail-tag">지금 관찰 중 · 01 여과</span><h3 id="detail-title"></h3><p id="detail-text"></p></div><div class="metric"><span>사구체 여과율</span><strong id="gfr"></strong><small>mL/min</small></div><div class="metric"><span>물 재흡수율</span><strong id="water"></strong><small>%</small></div><div class="metric"><span>소변의 주성분</span><strong style="font-size:17px">물 · 요소</strong></div></section>
<footer><span class="footer-brand">n· <b>NEPHRON LAB</b></span><p>학습을 위한 단순화 모델입니다. 수치는 양쪽 신장의 합산 추정값이며 의학적 판단에 사용할 수 없습니다.</p><span>관찰하고, 비교하고, 이해하세요.</span></footer></main>`;

let state={...presets.normal}, activeStage=0, playing=true, speed=1;
let substance='all';
let scene;
try { scene=createScene(document.querySelector('#nephron')); } catch(error) { document.querySelector('#fallback').hidden=false; console.warn('WebGL unavailable',error.message); }
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
document.querySelector('#reset').addEventListener('click',()=>{state={...presets.normal};substance='all';document.querySelector('[data-substance=all]').click();document.querySelector('#scenario').value='normal';playing=true;speed=1;document.querySelector('#play').textContent=icon('pause');document.querySelector('#play').setAttribute('aria-label','일시정지');document.querySelector('#play-status').textContent='물질 이동 관찰 중';document.querySelector('#speed').textContent='1×';scene?.reset();document.querySelector('#rotate').setAttribute('aria-pressed','false');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='3d'));selectStage(0);});
document.querySelector('#rotate').addEventListener('click',e=>{const b=e.currentTarget;const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));scene?.rotate(on);});
document.querySelector('#reset-view').addEventListener('click',()=>scene?.reset());
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el===b));scene?.view(b.dataset.view);}));
selectStage(0);
