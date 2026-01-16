const GRID_DIMENSION = 9;

export type ViolationType = 'row' | 'column' | 'box';

export interface CellPosition {
  row: number;
  col: number;
}

export interface Violation {
  type: ViolationType;
  index: number;
  digit: number;
  positions: CellPosition[];
}

export interface ValidationResult {
  valid: boolean;
  violations: Violation[];
}

/**
 * Applies the standard Sudoku uniqueness rules to a 9x9 grid. Non-zero digits
 * must appear at most once in each row, column, and 3x3 subgrid. Returns all
 * detected violations so callers can surface useful error messages.
 */
export function validateGrid(grid: number[][]): ValidationResult {
  const violations: Violation[] = [];

  checkRows(grid, violations);
  checkColumns(grid, violations);
  checkBoxes(grid, violations);

  return {
    valid: violations.length === 0,
    violations,
  };
}

function checkRows(grid: number[][], violations: Violation[]): void {
  for (let row = 0; row < GRID_DIMENSION; row += 1) {
    const seen = new Map<number, CellPosition[]>();
    for (let col = 0; col < GRID_DIMENSION; col += 1) {
      const digit = grid[row]?.[col] ?? 0;
      if (digit === 0) {
        continue;
      }

      const positions = seen.get(digit) ?? [];
      positions.push({ row, col });
      seen.set(digit, positions);
    }

    recordViolations('row', row, seen, violations);
  }
}

function checkColumns(grid: number[][], violations: Violation[]): void {
  for (let col = 0; col < GRID_DIMENSION; col += 1) {
    const seen = new Map<number, CellPosition[]>();
    for (let row = 0; row < GRID_DIMENSION; row += 1) {
      const digit = grid[row]?.[col] ?? 0;
      if (digit === 0) {
        continue;
      }

      const positions = seen.get(digit) ?? [];
      positions.push({ row, col });
      seen.set(digit, positions);
    }

    recordViolations('column', col, seen, violations);
  }
}

function checkBoxes(grid: number[][], violations: Violation[]): void {
  for (let boxRow = 0; boxRow < GRID_DIMENSION; boxRow += 3) {
    for (let boxCol = 0; boxCol < GRID_DIMENSION; boxCol += 3) {
      const seen = new Map<number, CellPosition[]>();
      const boxIndex = Math.floor(boxRow / 3) * 3 + Math.floor(boxCol / 3);

      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          const row = boxRow + r;
          const col = boxCol + c;
          const digit = grid[row]?.[col] ?? 0;
          if (digit === 0) {
            continue;
          }

          const positions = seen.get(digit) ?? [];
          positions.push({ row, col });
          seen.set(digit, positions);
        }
      }

      recordViolations('box', boxIndex, seen, violations);
    }
  }
}

function recordViolations(
  type: ViolationType,
  index: number,
  seen: Map<number, CellPosition[]>,
  violations: Violation[],
): void {
  for (const [digit, positions] of seen.entries()) {
    if (positions.length > 1) {
      violations.push({
        type,
        index,
        digit,
        positions: [...positions],
      });
    }
  }
}
