const NS = 'http://www.w3.org/2000/svg';
const colors = { blood: '#f28d9d', protein: '#bb9aff', urea: '#f2c46e', water: '#6cdbf2', glucose: '#94e3a4', amino: '#f5ac78' };

const names = { blood:'혈구', protein:'단백질', urea:'요소', water:'물', glucose:'포도당', amino:'아미노산' };
function symbol(species, size=1) {
  const color=colors[species];
  if(species==='blood')return `<ellipse rx="${7*size}" ry="${5*size}" fill="${color}" stroke="#ad354e" stroke-width="1.5"/><ellipse rx="${3*size}" ry="${2*size}" fill="#b9475c"/>`;
  if(species==='protein')return `<path d="M ${-6*size} ${-6*size} H ${4*size} L ${7*size} 0 L ${3*size} ${6*size} H ${-5*size} Z" fill="${color}" stroke="#765594"/>`;
  if(species==='urea')return `<path d="M 0 ${-7*size} L ${7*size} ${6*size} H ${-7*size} Z" fill="${color}" stroke="#ca8b33"/>`;
  if(species==='water')return `<path d="M 0 ${-8*size} Q ${12*size} ${5*size} 0 ${7*size} Q ${-12*size} ${5*size} 0 ${-8*size}" fill="${color}" stroke="#349cb6"/>`;
  return `<${species==='glucose'?'polygon points="-7,0 -3,-6 4,-6 8,0 4,6 -3,6"':'rect x="-6" y="-6" width="12" height="12" rx="3"'} fill="${color}" stroke="${species==='glucose'?'#498d5b':'#b96f3d'}"/>`;
}
function chips(items,x,y,columns=2,gap=105) {
 return items.map((species,i)=>`<g transform="translate(${x+i%columns*gap} ${y+Math.floor(i/columns)*31})">${symbol(species)}<text x="14" y="5" font-size="14" fill="#34445a">${names[species]}</text></g>`).join('');
}
// A textbook-style overview; all paths remain visible without JavaScript.
export const diagramMarkup = `<svg viewBox="0 0 1000 650" role="img" aria-label="토리와 가로로 이어진 세뇨관에서 여과, 재흡수, 분비와 오줌 생성을 보여주는 그림" class="nephron-diagram">
  <defs>
   <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dcefff"/><stop offset=".5" stop-color="#a9dcf4"/><stop offset="1" stop-color="#7abbdc"/></linearGradient>
   <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#356da0"/></marker>
   <marker id="process-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#d45c68"/></marker>
  </defs>
  <rect x="4" y="4" width="992" height="642" rx="17" fill="#fffdf9" stroke="#cbd7e3" stroke-width="5"/>
  <g font-family="sans-serif">
   <text x="34" y="35" font-size="16" font-weight="700" fill="#52667d">오줌이 만들어지는 과정</text>
   <g><rect x="35" y="58" width="310" height="137" rx="12" fill="#fff" stroke="#e1a9b3" stroke-width="2"/><path d="M48 58 H332 Q345 58 345 71 V93 H35 V71 Q35 58 48 58" fill="#f5e0e5"/><text x="57" y="82" font-size="15" fill="#533c47" font-weight="700">토리 속 혈액</text>${chips(['blood','protein','water','glucose','amino','urea'],57,120,3,96)}</g>
   <g data-process="2"><rect x="650" y="61" width="310" height="134" rx="10" fill="#fff" stroke="#a6b9cb" stroke-width="2"/><path d="M660 61 H950 Q960 61 960 71 V96 H650 V71 Q650 61 660 61" fill="#e5e9f4"/><text x="668" y="85" font-size="15" fill="#34445a" font-weight="700">C · 분비될 때 이동하는 물질</text>${chips(['urea'],676,125)}<text x="671" y="175" font-size="12" fill="#6c7483">혈액에 남은 노폐물 · 요소로 표시</text></g>
   <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path id="blood-in" d="M210 235 H301 Q330 235 330 270" stroke="#e7a1b0" stroke-width="22"/>
    <path id="blood-out" d="M340 275 Q384 261 399 291 V315 Q399 330 425 330 H717 Q750 330 750 362 V475" stroke="#e7a1b0" stroke-width="32"/>
    <ellipse cx="330" cy="296" rx="48" ry="43" fill="#e6f6ff" stroke="#83bbd8" stroke-width="10"/>
    <path d="M314 286 C285 262 362 262 350 293 S305 315 316 282 S368 288 341 309 S302 294 335 280" stroke="#cf8096" stroke-width="10"/>
    <path id="tubule" d="M330 337 V362 Q330 385 355 385 H900" stroke="url(#tube)" stroke-width="27"/>
    <path id="duct" d="M900 385 H968" stroke="#97d2ee" stroke-width="27"/>
    <path d="M398 385 H430 M811 385 H845 M926 385 H947" stroke="#356da0" stroke-width="3" marker-end="url(#flow-arrow)"/>
    <path id="filter" d="M330 288 V350" stroke="#d45c68" stroke-width="5" marker-end="url(#process-arrow)"/>
    <path id="reabsorb" d="M530 380 V333" stroke="#d45c68" stroke-width="5" marker-end="url(#process-arrow)"/>
    <path id="water-return" d="M580 380 V333" stroke="#68abc7" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#flow-arrow)"/>
    <path id="secrete" d="M680 335 V379" stroke="#d45c68" stroke-width="5" marker-end="url(#process-arrow)"/>
    <path d="M252 195 L300 264 M805 195 V303 L680 320 M300 478 L330 355 M502 478 L530 404 M837 478 V420 H955 V403" stroke="#adb7c2" stroke-width="1.5" stroke-dasharray="3 4"/>
   </g>
   <g font-size="16" fill="#34445a"><text x="206" y="215">콩팥 동맥 →</text><text x="273" y="273">토리</text><text x="207" y="335">보먼주머니</text><text x="411" y="420">세뇨관</text><text x="759" y="319">모세혈관</text><text x="721" y="507">콩팥 정맥 ↓</text><text x="907" y="428">오줌 →</text></g>
   <g font-size="15" font-weight="700" fill="#3c5870"><text x="349" y="348">여과 ↓</text><text x="475" y="306">재흡수 ↑</text><text x="659" y="305">분비 ↓</text></g>
   <g data-process="0"><rect x="35" y="478" width="285" height="135" rx="10" fill="#fff" stroke="#a6b9cb" stroke-width="2"/><path d="M45 478 H310 Q320 478 320 488 V513 H35 V488 Q35 478 45 478" fill="#e0edf8"/><text x="52" y="502" font-size="15" fill="#34445a" font-weight="700">A · 여과될 때 이동하는 물질</text>${chips(['water','glucose','amino','urea'],59,540,2,127)}</g>
   <g data-process="1"><rect x="355" y="478" width="285" height="135" rx="10" fill="#fff" stroke="#a6b9cb" stroke-width="2"/><path d="M365 478 H630 Q640 478 640 488 V513 H355 V488 Q355 478 365 478" fill="#e0edf8"/><text x="372" y="502" font-size="15" fill="#34445a" font-weight="700">B · 재흡수될 때 이동하는 물질</text>${chips(['water','glucose','amino'],378,540,2,125)}</g>
   <g><rect x="675" y="523" width="285" height="90" rx="10" fill="#fff" stroke="#a6b9cb" stroke-width="2"/><path d="M685 523 H950 Q960 523 960 533 V558 H675 V533 Q675 523 685 523" fill="#e0edf8"/><text x="692" y="547" font-size="15" fill="#34445a" font-weight="700">D · 생성된 오줌</text>${chips(['water','urea'],699,585,2,126)}</g>
   <text x="36" y="636" font-size="12" fill="#748596">혈구·단백질은 혈액에 남아요. 화살표를 따라 이동 방향을 살펴보세요.</text>
  </g>
  <g id="diagram-particles"></g>
 </svg>`;

export function createDiagram(container) {
  container.innerHTML = diagramMarkup;
  const svg = container.querySelector('svg');
  const particles = [];
  const layer = svg.querySelector('#diagram-particles');
  function add(pathId, species, count, stage = -1, end = 1) {
    const path = svg.querySelector(`#${pathId}`);
    const length = path.getTotalLength();
    for (let i = 0; i < count; i++) {
      const circle = document.createElementNS(NS, 'g');
      circle.innerHTML = symbol(species,.75);
      circle.setAttribute('fill', colors[species]);
      circle.setAttribute('stroke', '#122633');
      circle.setAttribute('stroke-width', '1');
      circle.dataset.species = species;
      circle.dataset.route = pathId;
      layer.append(circle);
      particles.push({ circle, path, pathId, length, species, i, stage, end, t: (i / count + Object.keys(colors).indexOf(species) * .073) % 1 });
    }
  }
  for (const species of Object.keys(colors)) { add('blood-in', species, 3); add('blood-out', species, 7); }
  for (const species of ['water', 'urea', 'glucose', 'amino']) add('filter', species, 3, 0);
  for (const species of ['water', 'urea']) { add('tubule', species, 20); add('duct', species, 10); }
  for (const species of ['glucose', 'amino']) { add('tubule', species, 5, -1, .4); add('reabsorb', species, 3, 1); }
  add('reabsorb', 'water', 5, 1);
  add('water-return', 'water', 12, 1); add('secrete', 'urea', 3, 2);
  let state = { stage: 0, substance: 'all', playing: true, speed: .5, adh: 45 };
  let elapsed = 0, previous, frame;
  function render(now) {
    const dt = previous === undefined ? 0 : Math.max(0, Math.min((now - previous) / 1000, .05));
    previous = now;
    if (state.playing) elapsed += dt * state.speed;
    for (const p of particles) {
      let visible = (state.substance === 'all' || state.substance === p.species) && (p.stage < 0 || state.stage === p.stage);
      if (p.species === 'water' && p.pathId === 'duct') visible &&= p.i < Math.round(3 + (100 - state.adh) * .07);
      if (p.pathId === 'water-return') visible &&= p.i < Math.round(3 + state.adh * .09);
      p.circle.style.display = visible ? '' : 'none';
      const point = p.path.getPointAtLength((p.t * p.length * p.end + elapsed * 30) % (p.length * p.end));
      p.circle.setAttribute('cx', point.x); p.circle.setAttribute('cy', point.y);
      p.circle.setAttribute('transform', `translate(${point.x} ${point.y})`);
    }
    for (const [id, stage] of [['filter', 0], ['reabsorb', 1], ['water-return', 1], ['secrete', 2]]) svg.querySelector(`#${id}`).style.opacity = state.stage === stage ? '1' : '.18';
    svg.querySelectorAll('[data-process]').forEach(panel => panel.querySelector('rect').setAttribute('stroke', Number(panel.dataset.process)===state.stage?'#43829f':'#a6b9cb'));
    frame = requestAnimationFrame(render);
  }
  render(performance.now());
  return { setState(value) { state = value; }, dispose() { cancelAnimationFrame(frame); } };
}
