import { describe, expect, it } from 'vitest';
import { parseGridFromString } from '../src/lib/parser.js';
import { validateGrid } from '../src/lib/validator.js';

const solvedGrid =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

describe('validateGrid', () => {
  it('returns valid when the grid respects Sudoku rules', () => {
    const grid = gridFromString(solvedGrid);
    const result = validateGrid(grid);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('detects duplicate digits that share a row', () => {
    const grid = createEmptyGrid();
    grid[2][0] = 4;
    grid[2][5] = 4;

    const result = validateGrid(grid);
    expect(result.valid).toBe(false);
    const rowViolation = result.violations.find((violation) => violation.type === 'row');
    expect(rowViolation).toBeDefined();
    expect(rowViolation?.index).toBe(2);
    expect(rowViolation?.digit).toBe(4);
    expect(rowViolation?.positions).toEqual([
      { row: 2, col: 0 },
      { row: 2, col: 5 },
    ]);
  });

  it('detects duplicate digits that share a column', () => {
    const grid = createEmptyGrid();
    grid[0][3] = 7;
    grid[8][3] = 7;

    const result = validateGrid(grid);
    expect(result.valid).toBe(false);
    const columnViolation = result.violations.find((violation) => violation.type === 'column');
    expect(columnViolation).toBeDefined();
    expect(columnViolation?.index).toBe(3);
    expect(columnViolation?.digit).toBe(7);
    expect(columnViolation?.positions).toEqual([
      { row: 0, col: 3 },
      { row: 8, col: 3 },
    ]);
  });

  it('detects duplicate digits that share a 3x3 box', () => {
    const grid = createEmptyGrid();
    grid[3][3] = 9;
    grid[4][4] = 9;

    const result = validateGrid(grid);
    expect(result.valid).toBe(false);
    const boxViolation = result.violations.find((violation) => violation.type === 'box');
    expect(boxViolation).toBeDefined();
    expect(boxViolation?.index).toBe(4);
    expect(boxViolation?.digit).toBe(9);
    expect(boxViolation?.positions).toEqual([
      { row: 3, col: 3 },
      { row: 4, col: 4 },
    ]);
  });
});

function gridFromString(puzzle: string): number[][] {
  const result = parseGridFromString(puzzle);
  if (!result.ok) {
    throw new Error('Test fixture must be a valid grid');
  }
  return result.grid;
}

function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}
