import { readAndParseInput } from '../lib/parser.js';
import { solveGrid } from '../lib/solver.js';
import { validateGrid } from '../lib/validator.js';

export interface SolveCommandOptions {
  input: string;
}

export async function handleSolveCommand(options: SolveCommandOptions): Promise<void> {
  const parsedResult = await readAndParseInput(options.input);

  if (!parsedResult.ok) {
    console.error(parsedResult.error.message);
    process.exitCode = 1;
    return;
  }

  // Optionally validate the grid before solving
  const validation = validateGrid(parsedResult.grid);
  if (!validation.valid) {
    console.error('Input puzzle violates Sudoku rules and cannot be solved.');
    validation.violations.forEach((violation) => {
      const scopeLabel =
        violation.type === 'row'
          ? `row ${violation.index + 1}`
          : violation.type === 'column'
            ? `column ${violation.index + 1}`
            : `box ${violation.index + 1}`;
      console.error(`  Duplicate digit ${violation.digit} in ${scopeLabel}`);
    });
    process.exitCode = 1;
    return;
  }

  // Attempt to solve the puzzle
  const solveResult = solveGrid(parsedResult.grid);

  if (!solveResult.ok) {
    console.error(`Unable to solve puzzle: ${solveResult.reason}`);
    process.exitCode = 1;
    return;
  }

  // Output the solution as a single 81-character line
  const solutionString = solveResult.solution.flat().join('');
  console.log(solutionString);
}
