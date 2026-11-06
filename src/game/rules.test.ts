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

test('Building costs adhere strictly to specified prices including Burj Khalifa $2B', () => {
  // Oddiy uy: $30
  assert.equal(calculateBuildingCost({ type: 'residential_simple' }), 30);

  // Biznes uchun uy: $60
  assert.equal(calculateBuildingCost({ type: 'business' }), 60);

  // Osmono'par bino 1 qavat: $20, 20 qavat: $120, 100 qavat: $200
  assert.equal(calculateBuildingCost({ type: 'skyscraper', floors: 1 }), 20);
  assert.equal(calculateBuildingCost({ type: 'skyscraper', floors: 20 }), 120);
  assert.equal(calculateBuildingCost({ type: 'skyscraper', floors: 100 }), 200);

  // Burj Khalifa: $1 (user request: narxi 1$ qil)
  assert.equal(calculateBuildingCost({ type: 'burj_khalifa' }), 1);

  // Yangi binolar
  assert.equal(calculateBuildingCost({ type: 'cyber_villa' }), 500);
  assert.equal(calculateBuildingCost({ type: 'megamall' }), 1500);
  assert.equal(calculateBuildingCost({ type: 'spaceport' }), 5000);

  // Daraxt ($10), Yo'l ($5), Park ($25)
  assert.equal(calculateBuildingCost({ type: 'tree' }), 10);
  assert.equal(calculateBuildingCost({ type: 'road' }), 5);
  assert.equal(calculateBuildingCost({ type: 'park' }), 25);
});

test('Color options: Oltin rang eng qimmati $999.9 va boshqa ranglar $100 atrofida', () => {
  const goldColor = BUILDING_COLORS.find(c => c.id === 'gold_24k');
  assert.ok(goldColor);
  assert.equal(goldColor.price, 999.9);

  // Oddiy uy ($30) + 24K Sof Oltin ($999.9) = $1029.9
  const costWithGold = calculateBuildingCost({
    type: 'residential_simple',
    colorId: 'gold_24k',
  });
  assert.equal(costWithGold, 1029.9);

  // Colors around $100
  const ruby = BUILDING_COLORS.find(c => c.id === 'plasma_ruby');
  assert.ok(ruby);
  assert.equal(ruby.price, 105);

  const diamond = BUILDING_COLORS.find(c => c.id === 'diamond_white');
  assert.ok(diamond);
  assert.equal(diamond.price, 110);
});

test('Hokim God Mode makes all building costs 0 (even Burj Khalifa $2B)', () => {
  const burjGodMode = calculateBuildingCost({
    type: 'burj_khalifa',
    colorId: 'gold_24k',
    isHokimGodMode: true,
  });
  assert.equal(burjGodMode, 0);
  assert.equal(canAfford(0, 2000000000, true), true);
});

test('Population increases when constructing buildings including Burj Khalifa', () => {
  assert.equal(calculatePopulationIncrease('residential_simple'), 6);
  assert.equal(calculatePopulationIncrease('business'), 14);
  assert.equal(calculatePopulationIncrease('skyscraper', 100), 1000);
  assert.equal(calculatePopulationIncrease('burj_khalifa'), 50000);
});

test('Usta Rustam territory expansion triggers correctly on population milestones', () => {
  const status1 = getUstaExpansionStatus(10, 8);
  assert.equal(status1.canExpand, false);
  assert.equal(status1.nextSize, 10);

  const status2 = getUstaExpansionStatus(50, 8);
  assert.equal(status2.canExpand, true);
  assert.equal(status2.nextSize, 10);
});
