#!/usr/bin/env node
import { Command } from 'commander';
import {
  GenerateCommandOptions,
  handleGenerateCommand,
} from './commands/generate.js';
import { handleSolveCommand, SolveCommandOptions } from './commands/solve.js';
import {
  handleValidateCommand,
  ValidateCommandOptions,
} from './commands/validate.js';

const program = new Command();

program
  .name('sudoku')
  .description('Sudoku CLI toolkit for validating, solving, and generating puzzles.')
  .version('0.1.0');

program
  .command('validate')
  .description('Validate a Sudoku puzzle input.')
  .requiredOption('-i, --input <value>', '81-character puzzle string or file path placeholder.')
  .action(async (options: ValidateCommandOptions) => {
    await handleValidateCommand(options);
  });

program
  .command('solve')
  .description('Solve a Sudoku puzzle input.')
  .requiredOption('-i, --input <value>', '81-character puzzle string or file path placeholder.')
  .action(async (options: SolveCommandOptions) => {
    await handleSolveCommand(options);
  });

program
  .command('generate')
  .description('Generate a new Sudoku puzzle for a given difficulty and seed.')
  .requiredOption('-d, --difficulty <level>', 'Difficulty level to generate (e.g., easy, medium, hard).')
  .requiredOption('-s, --seed <number>', 'Seed used for deterministic generation.')
  .action(async (options: GenerateCommandOptions) => {
    await handleGenerateCommand(options);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
