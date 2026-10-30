// These are intentionally 100% teaching-model routes, not renal physiology rates.
// A particle follows one complete journey; it cannot also bypass a transfer.
export const routes = {
  blood: ['inlet', 'retainedBlood'],
  protein: ['inlet', 'retainedBlood'],
  urea: ['inlet', 'bloodToSecretion', 'secrete', 'lateTubule', 'urine'],
  glucose: ['inlet', 'filter', 'earlyTubule', 'reabsorb', 'venousReturn'],
  amino: ['inlet', 'filter', 'earlyTubule', 'reabsorb', 'venousReturn'],
};
export function createJourney(species, paths) {
  const segments = routes[species].map(id => ({ id, ...paths[id] }));
  const length = segments.reduce((sum, segment) => sum + segment.length, 0);
  return {
    length,
    sample(distance) {
      let offset = ((distance % length) + length) % length;
      for (const segment of segments) {
        if (offset < segment.length) return { point: segment.at(offset / segment.length), region: segment.id };
        offset -= segment.length;
      }
      return { point: segments[0].at(0), region: segments[0].id };
    },
  };
}
