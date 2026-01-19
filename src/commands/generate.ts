import { generatePuzzle, Difficulty } from '../lib/generator.js';

export interface GenerateCommandOptions {
  difficulty: string;
  seed: string | number;
  input?: string;
}

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export async function handleGenerateCommand(
  options: GenerateCommandOptions,
): Promise<void> {
  // Validate seed
  const numericSeed = Number(options.seed);
  if (!Number.isFinite(numericSeed)) {
    console.error('Seed must be a finite number.');
    process.exitCode = 1;
    return;
  }

  // Validate difficulty
  const difficulty = options.difficulty.toLowerCase();
  if (!VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    console.error(
      `Invalid difficulty: "${options.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}.`
    );
    process.exitCode = 1;
    return;
  }

  // Generate the puzzle
  const puzzle = generatePuzzle(difficulty as Difficulty, numericSeed);

  // Output as a single 81-character line
  const puzzleString = puzzle.flat().join('');
  console.log(puzzleString);
}
