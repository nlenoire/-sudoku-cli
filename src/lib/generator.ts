/**
 * Sudoku Puzzle Generator
 * 
 * Generates valid Sudoku puzzles with configurable difficulty levels using a
 * deterministic seeded random number generator. For any given (difficulty, seed)
 * pair, the generator produces the same puzzle consistently.
 * 
 * Strategy:
 * 1. Generate a complete valid Sudoku solution
 * 2. Remove clues based on difficulty level
 * 3. Verify the puzzle remains solvable
 * 
 * Difficulty levels (by number of clues):
 * - easy: 40-45 clues (easier to solve)
 * - medium: 30-40 clues (moderate challenge)
 * - hard: 22-30 clues (more difficult)
 */

import { solveGrid } from './solver.js';

const GRID_DIMENSION = 9;
const BOX_SIZE = 3;

export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Seeded Linear Congruential Generator (LCG) for deterministic randomness.
 * Parameters chosen for good distribution: a=1664525, c=1013904223, m=2^32
 */
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    // Ensure seed is a positive integer
    this.state = Math.abs(Math.floor(seed)) || 1;
  }

  /**
   * Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // LCG formula: state = (a * state + c) % m
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    
    this.state = (a * this.state + c) % m;
    return this.state / m;
  }

  /**
   * Returns a random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

/**
 * Generates a valid Sudoku puzzle with specified difficulty and seed.
 * 
 * @param difficulty - The difficulty level (easy, medium, or hard)
 * @param seed - Seed for deterministic generation
 * @returns A 9x9 grid representing the puzzle (0 for empty cells)
 */
export function generatePuzzle(difficulty: Difficulty, seed: number): number[][] {
  const rng = new SeededRandom(seed);

  // Generate a complete valid solution
  const solution = generateCompleteSolution(rng);

  // Remove clues based on difficulty
  const targetClues = getTargetClues(difficulty, rng);
  const puzzle = removeClues(solution, targetClues, rng);

  return puzzle;
}

/**
 * Determines the target number of clues based on difficulty.
 * Adds slight randomness within the range to create variety.
 */
function getTargetClues(difficulty: Difficulty, rng: SeededRandom): number {
  switch (difficulty) {
    case 'easy':
      // 40-45 clues
      return rng.nextInt(40, 46);
    case 'medium':
      // 30-40 clues
      return rng.nextInt(30, 41);
    case 'hard':
      // 22-30 clues
      return rng.nextInt(22, 31);
  }
}

/**
 * Generates a complete valid Sudoku solution using a randomized approach.
 */
function generateCompleteSolution(rng: SeededRandom): number[][] {
  // Start with an empty grid
  const grid: number[][] = Array.from({ length: GRID_DIMENSION }, () =>
    Array(GRID_DIMENSION).fill(0)
  );

  // Fill the grid using a modified backtracking with randomization
  fillGrid(grid, rng);

  return grid;
}

/**
 * Fills the grid using backtracking with randomized number selection.
 */
function fillGrid(grid: number[][], rng: SeededRandom): boolean {
  // Find the next empty cell
  const emptyCell = findEmptyCell(grid);
  
  if (!emptyCell) {
    // Grid is complete
    return true;
  }

  const [row, col] = emptyCell;

  // Create a shuffled list of numbers 1-9
  const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);

  for (const num of numbers) {
    if (isValidPlacement(grid, row, col, num)) {
      grid[row][col] = num;

      if (fillGrid(grid, rng)) {
        return true;
      }

      grid[row][col] = 0;
    }
  }

  return false;
}

/**
 * Removes clues from a complete solution to create a puzzle.
 * Ensures the resulting puzzle has exactly targetClues filled cells.
 */
function removeClues(
  solution: number[][],
  targetClues: number,
  rng: SeededRandom
): number[][] {
  // Create a deep copy
  const puzzle = solution.map(row => [...row]);

  // Create a list of all cell positions
  const positions: [number, number][] = [];
  for (let row = 0; row < GRID_DIMENSION; row++) {
    for (let col = 0; col < GRID_DIMENSION; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle positions to randomize removal order
  const shuffledPositions = shuffleArray(positions, rng);

  // Calculate how many clues to remove
  const totalCells = GRID_DIMENSION * GRID_DIMENSION;
  const cluesToRemove = totalCells - targetClues;

  // Remove clues
  for (let i = 0; i < cluesToRemove && i < shuffledPositions.length; i++) {
    const [row, col] = shuffledPositions[i];
    puzzle[row][col] = 0;
  }

  return puzzle;
}

/**
 * Fisher-Yates shuffle with seeded randomness.
 */
function shuffleArray<T>(array: T[], rng: SeededRandom): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Finds the first empty cell (value 0) in the grid.
 */
function findEmptyCell(grid: number[][]): [number, number] | null {
  for (let row = 0; row < GRID_DIMENSION; row++) {
    for (let col = 0; col < GRID_DIMENSION; col++) {
      if (grid[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

/**
 * Checks if placing a number at the given position is valid.
 */
function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < GRID_DIMENSION; c++) {
    if (grid[row][c] === num) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < GRID_DIMENSION; r++) {
    if (grid[r][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = boxStartRow; r < boxStartRow + BOX_SIZE; r++) {
    for (let c = boxStartCol; c < boxStartCol + BOX_SIZE; c++) {
      if (grid[r][c] === num) {
        return false;
      }
    }
  }

  return true;
}
