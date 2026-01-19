import { describe, expect, it } from 'vitest';
import { parseGridFromString } from '../src/lib/parser.js';
import { solveGrid } from '../src/lib/solver.js';

// A known solvable puzzle (easy difficulty)
const solvablePuzzle =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079';

// Expected solution for the above puzzle
const expectedSolution =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

// An already solved puzzle
const solvedPuzzle = expectedSolution;

// An unsolvable puzzle (has contradictions)
const unsolvablePuzzle =
  '115678912672195348198342567859761423426853791713924856961537284287419635345286179';

describe('solveGrid', () => {
  it('solves a valid solvable puzzle', () => {
    const grid = gridFromString(solvablePuzzle);
    const result = solveGrid(grid);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const solutionString = gridToString(result.solution);
      expect(solutionString).toBe(expectedSolution);
    }
  });

  it('returns the same grid when already solved', () => {
    const grid = gridFromString(solvedPuzzle);
    const result = solveGrid(grid);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const solutionString = gridToString(result.solution);
      expect(solutionString).toBe(solvedPuzzle);
    }
  });

  it('returns failure for unsolvable puzzles', () => {
    const grid = gridFromString(unsolvablePuzzle);
    const result = solveGrid(grid);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBeTruthy();
      expect(['unsolvable', 'invalid']).toContain(result.reason);
    }
  });

  it('handles empty grid by finding a solution', () => {
    const emptyPuzzle = '0'.repeat(81);
    const grid = gridFromString(emptyPuzzle);
    const result = solveGrid(grid);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should return a valid completed grid
      expect(result.solution).toHaveLength(9);
      expect(result.solution[0]).toHaveLength(9);
      // Verify it's not all zeros
      const flatSolution = result.solution.flat();
      expect(flatSolution.every(val => val !== 0)).toBe(true);
    }
  });
});

function gridFromString(puzzle: string): number[][] {
  const result = parseGridFromString(puzzle);
  if (!result.ok) {
    throw new Error('Test fixture must be a valid grid');
  }
  return result.grid;
}

function gridToString(grid: number[][]): string {
  return grid.flat().join('');
}
