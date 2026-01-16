import { readAndParseInput } from '../lib/parser.js';

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

  console.log('Solve command not implemented yet. Input parsed successfully.');
  console.log(`Canonical grid: ${parsedResult.canonical}`);
}
