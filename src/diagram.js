const NS = 'http://www.w3.org/2000/svg';
const colors = { blood: '#f28d9d', protein: '#bb9aff', urea: '#f2c46e', water: '#6cdbf2', glucose: '#94e3a4', amino: '#f5ac78' };

// SVG works without WebGL or a GPU. Paths are also used to position particles.
export function createDiagram(container) {
  container.innerHTML = `<svg viewBox="0 0 760 550" role="img" aria-label="네프론의 여과, 재흡수, 요소 재순환을 보여주는 그림" class="nephron-diagram">
    <defs>
      <linearGradient id="tube" x1="0" x2="1"><stop stop-color="#d6a85e"/><stop offset=".5" stop-color="#ffe3a3"/><stop offset="1" stop-color="#c49f63"/></linearGradient>
      <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9acac4"/></marker>
    </defs>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path id="blood-in" d="M 65 125 C 105 125 102 170 142 174" stroke="#c97889" stroke-width="17"/>
      <path id="blood-out" d="M 160 164 C 170 100 240 100 310 109 S 455 100 505 132 C 560 168 490 210 455 230 L 455 430 C 455 510 280 510 280 435 L 280 270 C 280 232 222 239 170 240 L 65 240" stroke="#739daf" stroke-width="10"/>
      <circle cx="153" cy="194" r="51" fill="#3f9a9520" stroke="#6edbc5" stroke-width="2"/>
      <path d="M 125 198 C 100 165 159 149 173 174 S 133 234 120 205 S 167 168 182 198 S 132 236 128 192 S 186 162 178 209 S 114 209 140 171" stroke="#d68c9d" stroke-width="10"/>
      <path id="tubule" d="M 195 210 C 225 210 214 139 247 135 C 285 131 305 170 277 184 C 251 197 230 174 250 161 C 284 139 330 153 330 192 C 330 225 325 239 325 277 L 325 434 C 325 481 390 481 390 434 L 390 255 C 390 208 401 166 431 160 C 466 153 479 197 453 204 C 424 212 417 181 438 170 C 469 155 503 170 503 206 C 503 233 533 235 565 235" stroke="url(#tube)" stroke-width="19"/>
      <path id="duct" d="M 565 120 L 565 490" stroke="#dbc08b" stroke-width="28"/>
      <path id="filter" d="M 160 192 Q 186 238 220 203" stroke="#72ddc2" stroke-width="2" stroke-dasharray="5 7" marker-end="url(#flow-arrow)"/>
      <path id="reabsorb" d="M 291 188 Q 248 215 226 238" stroke="#f0bc72" stroke-width="2" stroke-dasharray="5 7" marker-end="url(#flow-arrow)"/>
      <path id="water-return" d="M 565 335 Q 500 312 455 341" stroke="#6cdbf2" stroke-width="2" stroke-dasharray="5 7" marker-end="url(#flow-arrow)"/>
      <path id="recycle" d="M 565 420 Q 475 455 390 409" stroke="#f2c46e" stroke-width="2" stroke-dasharray="5 7" marker-end="url(#flow-arrow)"/>
    </g>
    <g font-family="sans-serif" font-size="13" fill="#c6dbe2">
      <text x="109" y="290" class="diagram-ko">혈구·단백질은 혈관 안에</text>
      <text x="113" y="267" class="diagram-ko">← 혈액으로</text>
      <text x="63" y="100" class="diagram-ko">혈액 →</text>
      <text x="115" y="149">사구체</text><text x="239" y="119">근위세뇨관</text><text x="433" y="142">원위세뇨관</text>
      <text x="326" y="510">헨레고리</text><text x="591" y="299">집합관</text><text x="530" y="523" fill="#f0d294">소변 ↓</text>
      <text x="477" y="309" fill="#6cdbf2" font-size="11">물 재흡수</text><text x="442" y="460" fill="#f2c46e" font-size="11">요소 재순환</text>
    </g>
    <g id="diagram-particles"></g>
  </svg>`;
  const svg = container.querySelector('svg');
  const particles = [];
  const layer = svg.querySelector('#diagram-particles');
  function add(pathId, species, count, stage = -1, end = 1) {
    const path = svg.querySelector(`#${pathId}`);
    const length = path.getTotalLength();
    for (let i = 0; i < count; i++) {
      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('r', species === 'blood' ? 5 : species === 'protein' ? 4.3 : 3.4);
      circle.setAttribute('fill', colors[species]);
      circle.setAttribute('stroke', '#122633');
      circle.setAttribute('stroke-width', '1');
      circle.dataset.species = species;
      layer.append(circle);
      particles.push({ circle, path, pathId, length, species, i, stage, end, t: (i / count + Object.keys(colors).indexOf(species) * .073) % 1 });
    }
  }
  for (const species of Object.keys(colors)) { add('blood-in', species, 3); add('blood-out', species, 7); }
  for (const species of ['water', 'urea', 'glucose', 'amino']) add('filter', species, 3, 0);
  for (const species of ['water', 'urea']) { add('tubule', species, 20); add('duct', species, 10); }
  for (const species of ['glucose', 'amino']) { add('tubule', species, 6, -1, .25); add('reabsorb', species, 4, 1); }
  add('reabsorb', 'water', 5, 1); add('reabsorb', 'urea', 2, 1);
  add('water-return', 'water', 12, 1); add('recycle', 'urea', 6, 2);
  let state = { stage: 0, substance: 'all', playing: true, speed: 1, adh: 45 };
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
      const point = p.path.getPointAtLength(((p.t + elapsed * .12) % 1) * p.length * p.end);
      p.circle.setAttribute('cx', point.x); p.circle.setAttribute('cy', point.y);
    }
    for (const [id, stage] of [['filter', 0], ['reabsorb', 1], ['water-return', 1], ['recycle', 2]]) svg.querySelector(`#${id}`).style.opacity = state.stage === stage ? '1' : '.18';
    frame = requestAnimationFrame(render);
  }
  render(performance.now());
  return { setState(value) { state = value; }, dispose() { cancelAnimationFrame(frame); } };
}
