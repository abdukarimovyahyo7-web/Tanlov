import test from 'node:test';
import assert from 'node:assert/strict';
import {
  serializeGameState,
  deserializeGameState,
  getDefaultInitialCells,
  getDefaultInitialCitizens,
  SavedGameState,
} from './storage.ts';

test('Serializes and deserializes game state cleanly without losing data', () => {
  const initialCells = Array.from(getDefaultInitialCells().entries());
  const initialCitizens = getDefaultInitialCitizens();

  const mockState: SavedGameState = {
    version: 2,
    timestamp: 1730790000000,
    gridSize: 10,
    budget: 840,
    population: 180,
    happiness: 95,
    taxRate: 15,
    timeOfDay: 'sunset',
    isHokimGodMode: true,
    gameSpeed: 2,
    isometric3D: true,
    cells: initialCells,
    citizens: initialCitizens,
    actionLog: [
      { id: '1', text: '100 Qavatli bino qurildi', timestamp: 1730790000000, type: 'build' },
      { id: '2', text: 'Instagram @islom_dev biriktirildi', timestamp: 1730790001000, type: 'instagram' },
    ],
  };

  const serialized = serializeGameState(mockState);
  assert.ok(typeof serialized === 'string');
  assert.ok(serialized.includes('tanlovmahallasi'));
  assert.ok(serialized.includes('840'));

  const restored = deserializeGameState(serialized);
  assert.ok(restored !== null);
  assert.equal(restored.budget, 840);
  assert.equal(restored.population, 180);
  assert.equal(restored.isHokimGodMode, true);
  assert.equal(restored.timeOfDay, 'sunset');
  assert.equal(restored.gridSize, 10);
  assert.equal(restored.cells.length, initialCells.length);
  assert.equal(restored.actionLog.length, 2);
  assert.equal(restored.citizens.length, 5);
});

test('Handles corrupted or invalid json string safely', () => {
  assert.equal(deserializeGameState('invalid json!'), null);
  assert.equal(deserializeGameState('{}'), null); // Missing cells array
  assert.equal(deserializeGameState('""'), null);
});
