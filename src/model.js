export const presets = {
  normal: { name: '정상 상태', pressure: 60, hydration: 60, adh: 45, glucose: 90, note: '몸의 균형이 잘 유지되는 상태예요. 필요한 물질은 혈액으로 돌아가고, 노폐물은 소변으로 배출됩니다.' },
  dehydrated: { name: '수분 부족', pressure: 52, hydration: 20, adh: 90, glucose: 90, note: '수분이 부족하면 ADH가 증가해 집합관에서 물을 더 많이 재흡수합니다. 소변량은 줄고 농도는 높아져요.' },
  hydrated: { name: '물 마신 후', pressure: 60, hydration: 95, adh: 10, glucose: 90, note: '물을 충분히 마시면 ADH가 감소합니다. 집합관의 물 재흡수가 줄어 묽은 소변이 더 많이 만들어져요.' },
};
export function calculate({ pressure, hydration, adh, glucose }) {
  const gfr = Math.max(30, Math.min(180, 125 + (pressure - 60) * 2));
  const filteredGlucose = gfr * glucose / 100;
  const glucoseExcretion = Math.max(0, filteredGlucose - 300);
  const urine = gfr * (0.018 - adh * 0.00012) * (0.75 + hydration / 200) + glucoseExcretion * 0.015;
  const reabsorbed = gfr - urine;
  return { gfr, urine, reabsorbed, waterPercent: reabsorbed / gfr * 100, filteredGlucose, glucoseExcretion, glucoseReabsorbed: Math.min(filteredGlucose, 300) };
}
export const stages = [
  { id: 'filtration', title: '여과', en: 'FILTRATION', site: '사구체 → 보먼주머니', color: '#64d9c0', description: '혈압의 힘으로 혈액 속 작은 물질이 사구체 모세혈관을 통과합니다.', detail: '물, 포도당, 아미노산, 요소는 보먼주머니로 이동해 원뇨가 됩니다. 혈구와 대부분의 단백질은 크기가 커서 혈액에 남아요.', molecules: ['물', '포도당', '아미노산', '요소'] },
  { id: 'reabsorption', title: '재흡수', en: 'REABSORPTION', site: '세뇨관 → 주위 모세혈관', color: '#f0bc72', description: '몸에 필요한 물과 영양소가 세뇨관에서 혈액으로 돌아갑니다.', detail: '근위세뇨관은 포도당·아미노산과 많은 물·이온을 재흡수합니다. 헨레고리는 농도 기울기를 만들고, ADH는 집합관의 물 재흡수를 조절해요.', molecules: ['물', '포도당', '아미노산'] },
  { id: 'secretion', title: '분비', en: 'SECRETION', site: '요소의 재순환 → 헨레고리', color: '#b39aef', description: '요소 일부가 헨레고리 안으로 다시 이동합니다.', detail: '이 모델에서는 요소의 재순환을 보여줍니다. 집합관에서 나온 요소 일부가 신장 속 조직을 거쳐 헨레고리로 들어갑니다. 실제 신장에서는 H⁺, K⁺, 일부 약물의 분비도 일어나요.', molecules: ['요소 · 일부 재순환'] },
];
