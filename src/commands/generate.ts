export interface GenerateCommandOptions {
  difficulty: string;
  seed: string | number;
}

export async function handleGenerateCommand(
  options: GenerateCommandOptions,
): Promise<void> {
  const numericSeed = Number(options.seed);
  console.log('Generate command not implemented yet.');
  if (Number.isFinite(numericSeed)) {
    console.log(
      `Requested difficulty: ${options.difficulty} with deterministic seed ${numericSeed}.`,
    );
  } else {
    console.log(
      `Requested difficulty: ${options.difficulty} with non-numeric seed value ${options.seed}.`,
    );
  }
}
