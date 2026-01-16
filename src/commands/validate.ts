import { readAndParseInput } from '../lib/parser.js';

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

  console.log('Validate command not implemented yet. Input parsed successfully.');
  console.log(`Canonical grid: ${parsedResult.canonical}`);
}
