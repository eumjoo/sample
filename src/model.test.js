import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, presets } from './model.js';
test('water balance is conserved for each scenario', () => {
  for (const preset of Object.values(presets)) {
    const r = calculate(preset);
    assert.ok(r.urine > 0 && r.urine < r.gfr);
    assert.ok(Math.abs(r.reabsorbed + r.urine - r.gfr) < 1e-9);
    assert.equal(r.filteredGlucose, r.glucoseReabsorbed + r.glucoseExcretion);
  }
});
test('water conservation changes urine while the teaching model fully reabsorbs glucose', () => {
  assert.ok(calculate(presets.dehydrated).urine < calculate(presets.hydrated).urine);
  assert.equal(calculate(presets.normal).glucoseExcretion, 0);
  assert.equal(calculate({...presets.normal, glucose: 320}).glucoseExcretion, 0);
  assert.ok(calculate({...presets.normal, adh: 90}).urine < calculate({...presets.normal, adh: 10}).urine);
});
