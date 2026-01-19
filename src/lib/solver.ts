/**
 * Sudoku Solver
 * 
 * Implements a backtracking algorithm to solve Sudoku puzzles.
 * The solver attempts to fill empty cells (represented by 0) with digits 1-9
 * while respecting Sudoku rules: no duplicates in rows, columns, or 3x3 boxes.
 */

import { findEmptyCell, isValidPlacement } from './utils.js';

const GRID_DIMENSION = 9;
const BOX_SIZE = 3;

export interface SolveSuccess {
  ok: true;
  solution: number[][];
}

export interface SolveFailure {
  ok: false;
  reason: 'unsolvable' | 'invalid' | 'multiple-solutions' | string;
}

export type SolveResult = SolveSuccess | SolveFailure;

/**
 * Solves a Sudoku puzzle using backtracking algorithm.
 * 
 * @param grid - A 9x9 grid where 0 represents empty cells
 * @returns SolveResult with either the solution or a failure reason
 */
export function solveGrid(grid: number[][]): SolveResult {
  // Create a deep copy to avoid mutating the input
  const workingGrid = grid.map(row => [...row]);

  // Check if the initial grid has any violations
  if (hasInitialViolations(workingGrid)) {
    return {
      ok: false,
      reason: 'invalid',
    };
  }

  // Attempt to solve using backtracking
  if (backtrack(workingGrid)) {
    return {
      ok: true,
      solution: workingGrid,
    };
  }

  return {
    ok: false,
    reason: 'unsolvable',
  };
}

/**
 * Backtracking algorithm to fill the grid.
 * Returns true if a solution is found, false otherwise.
 */
function backtrack(grid: number[][]): boolean {
  // Find the next empty cell
  const emptyCell = findEmptyCell(grid);
  
  if (!emptyCell) {
    // No empty cells left, puzzle is solved
    return true;
  }

  const [row, col] = emptyCell;

  // Try digits 1-9
  for (let num = 1; num <= GRID_DIMENSION; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      // Place the number
      grid[row][col] = num;

      // Recursively attempt to solve the rest
      if (backtrack(grid)) {
        return true;
      }

      // Backtrack: remove the number and try the next one
      grid[row][col] = 0;
    }
  }

  // No valid number found for this cell
  return false;
}

/**
 * Checks if the initial grid has any Sudoku rule violations.
 * Returns true if there are violations (duplicate non-zero values).
 */
function hasInitialViolations(grid: number[][]): boolean {
  // Check all rows
  for (let row = 0; row < GRID_DIMENSION; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < GRID_DIMENSION; col++) {
      const val = grid[row][col];
      if (val !== 0) {
        if (seen.has(val)) {
          return true;
        }
        seen.add(val);
      }
    }
  }

  // Check all columns
  for (let col = 0; col < GRID_DIMENSION; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < GRID_DIMENSION; row++) {
      const val = grid[row][col];
      if (val !== 0) {
        if (seen.has(val)) {
          return true;
        }
        seen.add(val);
      }
    }
  }

  // Check all 3x3 boxes
  for (let boxRow = 0; boxRow < GRID_DIMENSION; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < GRID_DIMENSION; boxCol += BOX_SIZE) {
      const seen = new Set<number>();
      for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
          const val = grid[r][c];
          if (val !== 0) {
            if (seen.has(val)) {
              return true;
            }
            seen.add(val);
          }
        }
      }
    }
  }

  return false;
}
