/**
 * Common Sudoku utilities shared across solver and generator modules.
 */

const GRID_DIMENSION = 9;
const BOX_SIZE = 3;

/**
 * Finds the first empty cell (value 0) in the grid.
 * Returns [row, col] or null if no empty cells exist.
 */
export function findEmptyCell(grid: number[][]): [number, number] | null {
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
 * Checks if placing a number at the given position is valid according to Sudoku rules.
 * Verifies that the number doesn't already exist in the same row, column, or 3x3 box.
 */
export function isValidPlacement(
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
