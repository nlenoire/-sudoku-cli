import { readAndParseInput } from '../lib/parser.js';

export interface GenerateCommandOptions {
  difficulty: string;
  seed: string | number;
  input?: string;
}

export async function handleGenerateCommand(
  options: GenerateCommandOptions,
): Promise<void> {
  const numericSeed = Number(options.seed);
  if (!Number.isFinite(numericSeed)) {
    console.error('Seed must be a finite number.');
    process.exitCode = 1;
    return;
  }

  if (options.input) {
    const parsedResult = await readAndParseInput(options.input);
    if (!parsedResult.ok) {
      console.error(parsedResult.error.message);
      process.exitCode = 1;
      return;
    }
    console.log('Generate command not implemented yet. Parsed optional input successfully.');
    console.log(`Canonical grid: ${parsedResult.canonical}`);
  } else {
    console.log('Generate command not implemented yet.');
  }

  console.log(`Requested difficulty: ${options.difficulty} with deterministic seed ${numericSeed}.`);
}
