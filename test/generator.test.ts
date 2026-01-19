import { describe, expect, it } from 'vitest';
import { generatePuzzle } from '../src/lib/generator.js';
import { solveGrid } from '../src/lib/solver.js';
import { validateGrid } from '../src/lib/validator.js';

describe('generatePuzzle', () => {
  it('generates a valid puzzle for easy difficulty', () => {
    const puzzle = generatePuzzle('easy', 42);

    // Should be a 9x9 grid
    expect(puzzle).toHaveLength(9);
    expect(puzzle[0]).toHaveLength(9);

    // Should be valid according to Sudoku rules
    const validation = validateGrid(puzzle);
    expect(validation.valid).toBe(true);
  });

  it('generates a valid puzzle for medium difficulty', () => {
    const puzzle = generatePuzzle('medium', 100);

    // Should be a 9x9 grid
    expect(puzzle).toHaveLength(9);
    expect(puzzle[0]).toHaveLength(9);

    // Should be valid according to Sudoku rules
    const validation = validateGrid(puzzle);
    expect(validation.valid).toBe(true);
  });

  it('generates a valid puzzle for hard difficulty', () => {
    const puzzle = generatePuzzle('hard', 200);

    // Should be a 9x9 grid
    expect(puzzle).toHaveLength(9);
    expect(puzzle[0]).toHaveLength(9);

    // Should be valid according to Sudoku rules
    const validation = validateGrid(puzzle);
    expect(validation.valid).toBe(true);
  });

  it('generates a solvable puzzle', () => {
    const puzzle = generatePuzzle('easy', 12345);
    const result = solveGrid(puzzle);

    expect(result.ok).toBe(true);
  });

  it('generates different puzzles for different seeds', () => {
    const puzzle1 = generatePuzzle('easy', 1);
    const puzzle2 = generatePuzzle('easy', 2);

    const string1 = puzzle1.flat().join('');
    const string2 = puzzle2.flat().join('');

    expect(string1).not.toBe(string2);
  });

  it('generates the same puzzle for the same seed and difficulty', () => {
    const puzzle1 = generatePuzzle('easy', 42);
    const puzzle2 = generatePuzzle('easy', 42);

    const string1 = puzzle1.flat().join('');
    const string2 = puzzle2.flat().join('');

    expect(string1).toBe(string2);
  });

  it('generates the same puzzle consistently across multiple runs', () => {
    const seed = 9999;
    const difficulty = 'medium';

    const puzzle1 = generatePuzzle(difficulty, seed);
    const puzzle2 = generatePuzzle(difficulty, seed);
    const puzzle3 = generatePuzzle(difficulty, seed);

    const string1 = puzzle1.flat().join('');
    const string2 = puzzle2.flat().join('');
    const string3 = puzzle3.flat().join('');

    expect(string1).toBe(string2);
    expect(string2).toBe(string3);
  });

  it('generates puzzles with different number of clues based on difficulty', () => {
    const easyPuzzle = generatePuzzle('easy', 555);
    const mediumPuzzle = generatePuzzle('medium', 555);
    const hardPuzzle = generatePuzzle('hard', 555);

    const easyClues = countClues(easyPuzzle);
    const mediumClues = countClues(mediumPuzzle);
    const hardClues = countClues(hardPuzzle);

    // Easy should have more clues than medium, medium more than hard
    expect(easyClues).toBeGreaterThan(mediumClues);
    expect(mediumClues).toBeGreaterThan(hardClues);

    // Check approximate ranges (as per spec: easy ≈ 40+, medium ≈ 30-40, hard < 30)
    expect(easyClues).toBeGreaterThanOrEqual(40);
    expect(mediumClues).toBeGreaterThanOrEqual(30);
    expect(mediumClues).toBeLessThanOrEqual(40);
    expect(hardClues).toBeLessThan(30);
  });
});

function countClues(grid: number[][]): number {
  return grid.flat().filter(val => val !== 0).length;
}
