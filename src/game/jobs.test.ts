import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_NATIONAL_JOBS,
  calculateTotalEmployed,
  calculateTotalWorkplaces,
  calculateEmploymentRate,
  calculateJobsIncomePerSecond,
  upgradeNationalJob,
  assignWorkersToJob,
  autoEmployAll,
} from './jobs.ts';

test('National jobs initializes with authentic Uzbek trades', () => {
  assert.ok(INITIAL_NATIONAL_JOBS.length >= 8);
  const pottery = INITIAL_NATIONAL_JOBS.find(j => j.id === 'rishton_pottery');
  assert.ok(pottery);
  assert.equal(pottery.regionOrigin, 'Rishton (Farg‘ona)');

  const embroidery = INITIAL_NATIONAL_JOBS.find(j => j.id === 'bukhara_gold_embroidery');
  assert.ok(embroidery);

  const bakery = INITIAL_NATIONAL_JOBS.find(j => j.id === 'samarkand_bakery');
  assert.ok(bakery);

  const silk = INITIAL_NATIONAL_JOBS.find(j => j.id === 'margilon_silk');
  assert.ok(silk);
});

test('Calculates employment and income properly', () => {
  const totalEmployed = calculateTotalEmployed(INITIAL_NATIONAL_JOBS);
  assert.ok(totalEmployed > 100);

  const workplaces = calculateTotalWorkplaces(INITIAL_NATIONAL_JOBS);
  assert.ok(workplaces > totalEmployed);

  const income = calculateJobsIncomePerSecond(INITIAL_NATIONAL_JOBS);
  assert.ok(income > 20);

  const rate = calculateEmploymentRate(1000, INITIAL_NATIONAL_JOBS);
  assert.ok(rate > 0 && rate <= 100);
});

test('Upgrading workshop expands capacity and subtracts budget', () => {
  const result = upgradeNationalJob(INITIAL_NATIONAL_JOBS, 'rishton_pottery', 500, false);
  assert.equal(result.success, true);
  assert.equal(result.newBudget, 400); // 500 - 100
  const upgraded = result.updatedJobs.find(j => j.id === 'rishton_pottery');
  assert.equal(upgraded?.level, 2);
  assert.equal(upgraded?.maxCapacity, 150);
});

test('Auto employ distributes available unemployed workers', () => {
  const totalBefore = calculateTotalEmployed(INITIAL_NATIONAL_JOBS);
  const employed = autoEmployAll(INITIAL_NATIONAL_JOBS, totalBefore + 50);
  const totalAfter = calculateTotalEmployed(employed);
  assert.equal(totalAfter, totalBefore + 50);
});
