import { readAndParseInput } from '../lib/parser.js';
import { validateGrid, Violation } from '../lib/validator.js';

export interface ValidateCommandOptions {
  input: string;
}

export async function handleValidateCommand(
  options: ValidateCommandOptions,
): Promise<void> {
  const parsedResult = await readAndParseInput(options.input);

  if (!parsedResult.ok) {
    console.error(parsedResult.error.message);
    process.exitCode = 1;
    return;
  }

  const validation = validateGrid(parsedResult.grid);

  if (!validation.valid) {
    validation.violations.forEach((violation) => {
      console.error(formatViolation(violation));
    });
    process.exitCode = 1;
    return;
  }

  console.log('Grid is valid.');
}

function formatViolation(violation: Violation): string {
  const scopeLabel =
    violation.type === 'row'
      ? `row ${violation.index + 1}`
      : violation.type === 'column'
        ? `column ${violation.index + 1}`
        : `box ${violation.index + 1}`;

  const coordinateList = violation.positions
    .map((position) => `(${position.row + 1},${position.col + 1})`)
    .join(', ');

  return `Duplicate digit ${violation.digit} in ${scopeLabel} at positions ${coordinateList}.`;
}
