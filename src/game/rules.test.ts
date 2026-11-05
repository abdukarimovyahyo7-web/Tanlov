import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBuildingCost,
  calculatePopulationIncrease,
  calculateIncomePerSecond,
  getUstaExpansionStatus,
  canAfford,
  BUILDING_COLORS,
} from './rules.ts';

test('Building costs adhere strictly to specified prices', () => {
  // Oddiy uy: $30
  assert.equal(calculateBuildingCost({ type: 'residential_simple' }), 30);

  // Biznes uchun uy: $60
  assert.equal(calculateBuildingCost({ type: 'business' }), 60);

  // Osmono'par bino 1 qavat: $20
  assert.equal(calculateBuildingCost({ type: 'skyscraper', floors: 1 }), 20);

  // Osmono'par bino 20 qavat: $120
  assert.equal(calculateBuildingCost({ type: 'skyscraper', floors: 20 }), 120);

  // Osmono'par bino 100 qavat: $200
  assert.equal(calculateBuildingCost({ type: 'skyscraper', floors: 100 }), 200);

  // Daraxt ($10) & Yo'l ($5)
  assert.equal(calculateBuildingCost({ type: 'tree' }), 10);
  assert.equal(calculateBuildingCost({ type: 'road' }), 5);
});

test('Color options are within $10 - $30 and add to building cost', () => {
  for (const color of BUILDING_COLORS) {
    assert.ok(color.price >= 10 && color.price <= 30, `Color ${color.name} should be between 10 and 30`);
  }

  // Oddiy uy ($30) + Kiber Moviy ($15) = $45
  const costWithColor = calculateBuildingCost({
    type: 'residential_simple',
    colorId: 'neon_cyan',
  });
  assert.equal(costWithColor, 45);

  // 100 qavat ($200) + Oq Neoklassika ($30) = $230
  const skyscraper100WithColor = calculateBuildingCost({
    type: 'skyscraper',
    floors: 100,
    colorId: 'imperial_white',
  });
  assert.equal(skyscraper100WithColor, 230);
});

test('Hokim God Mode makes all building costs 0', () => {
  const godModeCost = calculateBuildingCost({
    type: 'skyscraper',
    floors: 100,
    colorId: 'imperial_white',
    isHokimGodMode: true,
  });
  assert.equal(godModeCost, 0);
  assert.equal(canAfford(0, 500, true), true);
});

test('Population increases when constructing buildings', () => {
  assert.equal(calculatePopulationIncrease('residential_simple'), 6);
  assert.equal(calculatePopulationIncrease('business'), 14);
  assert.equal(calculatePopulationIncrease('skyscraper', 1), 15);
  assert.equal(calculatePopulationIncrease('skyscraper', 20), 150);
  assert.equal(calculatePopulationIncrease('skyscraper', 100), 1000);
});

test('Usta Rustam territory expansion triggers correctly on population milestones', () => {
  // At population 10, cannot expand from 8x8 yet (threshold is 40)
  const status1 = getUstaExpansionStatus(10, 8);
  assert.equal(status1.canExpand, false);
  assert.equal(status1.nextSize, 10);

  // At population 50, can expand to 10x10!
  const status2 = getUstaExpansionStatus(50, 8);
  assert.equal(status2.canExpand, true);
  assert.equal(status2.nextSize, 10);
});
