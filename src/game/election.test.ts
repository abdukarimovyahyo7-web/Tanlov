import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getHokimElectionCountdown,
  getYordamchiElectionCountdown,
  initializeDistrictElection,
} from '../types/election.ts';
import {
  UZBEKISTAN_REGIONS,
  findDistrictById,
  DEFAULT_DISTRICT_ID,
} from '../data/uzbekistanRegions.ts';

describe('Uzbekistan Administrative Regions & Districts (Google Maps)', () => {
  it('Contains all 14 official regions of Uzbekistan', () => {
    assert.strictEqual(UZBEKISTAN_REGIONS.length, 14);
    const regionNames = UZBEKISTAN_REGIONS.map(r => r.name);
    assert.ok(regionNames.includes('Toshkent shahri'));
    assert.ok(regionNames.includes('Samarqand viloyati'));
    assert.ok(regionNames.includes('Buxoro viloyati'));
    assert.ok(regionNames.includes('Farg‘ona viloyati'));
    assert.ok(regionNames.includes('Andijon viloyati'));
    assert.ok(regionNames.includes('Namangan viloyati'));
    assert.ok(regionNames.includes('Qashqadaryo viloyati'));
    assert.ok(regionNames.includes('Surxondaryo viloyati'));
    assert.ok(regionNames.includes('Xorazm viloyati'));
    assert.ok(regionNames.includes('Navoiy viloyati'));
    assert.ok(regionNames.includes('Jizzax viloyati'));
    assert.ok(regionNames.includes('Sirdaryo viloyati'));
    assert.ok(regionNames.includes('Toshkent viloyati'));
    assert.ok(regionNames.includes('Qoraqalpog‘iston Respublikasi'));
  });

  it('Accurately finds districts with official Google Maps naming', () => {
    const chilonzor = findDistrictById('chilonzor');
    assert.ok(chilonzor);
    assert.strictEqual(chilonzor.name, 'Chilonzor tumani');
    assert.strictEqual(chilonzor.regionId, 'tashkent_city');

    const samarkandCity = findDistrictById('samarkand_city');
    assert.ok(samarkandCity);
    assert.strictEqual(samarkandCity.name, 'Samarqand shahri');

    const bukharaCity = findDistrictById('bukhara_city');
    assert.ok(bukharaCity);
    assert.strictEqual(bukharaCity.name, 'Buxoro shahri');
  });
});

describe('Elections Rules: Monthly Hokim & 15-day Yordamchi Cycle', () => {
  it('Calculates 30-day monthly Hokim election countdown correctly', () => {
    const now = Date.now();
    // Cycle started exactly 10 days ago
    const cycleStart = now - 10 * 24 * 60 * 60 * 1000;
    const { daysLeft, percentElapsed } = getHokimElectionCountdown(cycleStart);
    assert.strictEqual(daysLeft, 20); // 30 - 10 = 20 days remaining
    assert.ok(percentElapsed >= 32 && percentElapsed <= 35);
  });

  it('Calculates 15-day Hokim Yordamchisi term and 16th day election day correctly', () => {
    const now = Date.now();

    // Day 5 of the 15-day term
    const day5Start = now - 4 * 24 * 60 * 60 * 1000 - 2 * 3600 * 1000;
    const day5Result = getYordamchiElectionCountdown(day5Start);
    assert.strictEqual(day5Result.isElectionDay, false);
    assert.strictEqual(day5Result.dayInCycle, 5);
    assert.ok(day5Result.daysLeft >= 10);

    // Exact 16th day in the cycle
    const day16Start = now - 15 * 24 * 60 * 60 * 1000 - 4 * 3600 * 1000;
    const day16Result = getYordamchiElectionCountdown(day16Start);
    assert.strictEqual(day16Result.dayInCycle, 16);
    assert.strictEqual(day16Result.isElectionDay, true);
    assert.strictEqual(day16Result.daysLeft, 0);
  });

  it('Initializes district elections with candidates and elected leaders', () => {
    const election = initializeDistrictElection('chilonzor', 'Chilonzor tumani');
    assert.strictEqual(election.districtId, 'chilonzor');
    assert.ok(election.hokim);
    assert.ok(election.yordamchi);
    assert.ok(election.hokimCandidates.length >= 2);
    assert.ok(election.yordamchiCandidates.length >= 2);
    assert.ok(election.hokim.votes >= election.hokimCandidates[1].votes);
  });
});
