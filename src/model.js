export const presets = {
  normal: { name: '정상 상태', urineLabel: '보통', pressure: 60, hydration: 60, adh: 45, glucose: 90, note: '몸의 균형이 잘 유지되는 상태예요. 필요한 물질은 혈액으로 돌아가고, 노폐물은 소변으로 배출됩니다.' },
  dehydrated: { name: '수분 부족', urineLabel: '적음', pressure: 52, hydration: 20, adh: 90, glucose: 90, note: '몸에 물이 부족하면 세뇨관에서 물을 더 많이 재흡수해요. 몸 밖으로 나가는 오줌의 양은 줄어듭니다.' },
  hydrated: { name: '물 마신 후', urineLabel: '많음', pressure: 60, hydration: 95, adh: 10, glucose: 90, note: '물을 충분히 마시면 세뇨관에서 물을 덜 재흡수해요. 몸 밖으로 나가는 오줌의 양은 늘어납니다.' },
};
export function calculate({ pressure, hydration, adh, glucose }) {
  const gfr = Math.max(30, Math.min(180, 125 + (pressure - 60) * 2));
  const filteredGlucose = gfr * glucose / 100;
  const glucoseExcretion = 0;
  const urine = gfr * (0.018 - adh * 0.00012) * (0.75 + hydration / 200);
  const reabsorbed = gfr - urine;
  return { gfr, urine, reabsorbed, waterPercent: reabsorbed / gfr * 100, filteredGlucose, glucoseExcretion, glucoseReabsorbed: filteredGlucose };
}
export const stages = [
  { id: 'filtration', title: '여과', en: 'FILTRATION', site: '토리 → 보먼주머니', color: '#64d9c0', description: '혈액 속 크기가 작은 물질이 보먼주머니로 빠져나가요.', detail: '이 모형에서 포도당과 아미노산은 100% 여과되어 토리에서 보먼주머니로 이동해요. 물도 여과되고, 혈구와 단백질은 혈액에 남습니다.', molecules: ['물', '포도당 100%', '아미노산 100%'] },
  { id: 'reabsorption', title: '재흡수', en: 'REABSORPTION', site: '세뇨관 → 모세혈관', color: '#f0bc72', description: '몸에 필요한 물질을 세뇨관에서 혈액으로 다시 흡수해요.', detail: '포도당과 아미노산은 세뇨관에서 100% 재흡수되어 혈액으로 돌아가요. 오줌에는 남지 않아요. 물도 대부분 재흡수되며, 재흡수되는 물의 양은 몸의 수분 상태에 따라 달라집니다.', molecules: ['물', '포도당', '아미노산'] },
  { id: 'secretion', title: '분비', en: 'SECRETION', site: '모세혈관 → 세뇨관', color: '#b39aef', description: '혈액에 남은 노폐물을 세뇨관으로 더 내보내요.', detail: '이 가상 학습 모형에서는 노폐물인 요소가 100% 세뇨관으로 분비되어 오줌으로 나가요. 콩팥정맥으로 가는 요소는 없어요. 실제 콩팥의 처리 비율과는 다른 가정입니다.', molecules: ['요소 100% 분비'] },
];
