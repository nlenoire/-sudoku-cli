import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseGridFromString, readAndParseInput } from '../src/lib/parser.js';

const validPuzzle =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079';

describe('parseGridFromString', () => {
  it('parses a valid 81-character puzzle', () => {
    const result = parseGridFromString(validPuzzle);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toHaveLength(81);
      expect(result.grid).toHaveLength(9);
      expect(result.grid[0][0]).toBe(5);
    }
  });

  it('removes whitespace characters before parsing', () => {
    const spacedInput = `${validPuzzle.slice(0, 40)}\n${validPuzzle.slice(40)}`;
    const result = parseGridFromString(spacedInput);
    expect(result.ok).toBe(true);
  });

  it('rejects inputs that are not exactly 81 characters', () => {
    const tooShort = validPuzzle.slice(0, 80);
    const result = parseGridFromString(tooShort);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_LENGTH');
      expect(result.error.message).toContain('Expected 81');
    }
  });

  it('rejects invalid characters and reports their position', () => {
    const invalid = `${validPuzzle.slice(0, 10)}x${validPuzzle.slice(11)}`;
    const result = parseGridFromString(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_CHARACTER');
      expect(result.error.index).toBe(10);
      expect(result.error.message).toContain('Invalid character');
    }
  });

  it('maps placeholders to zero in the grid and canonical string', () => {
    const puzzleWithDots = '.'.repeat(81);
    const result = parseGridFromString(puzzleWithDots);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toBe('0'.repeat(81));
      expect(result.grid[0][0]).toBe(0);
    }
  });
});

describe('readAndParseInput', () => {
  it('treats inline strings as input when file is absent', async () => {
    const result = await readAndParseInput(validPuzzle);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe('inline');
    }
  });

  it('parses content from a file when the path exists', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'sudoku-'));
    const filePath = path.join(tempDir, 'puzzle.txt');
    const formattedGrid = `${validPuzzle.slice(0, 27)}\n${validPuzzle.slice(27, 54)}\n${validPuzzle.slice(54)}`;
    await writeFile(filePath, formattedGrid, 'utf8');

    const result = await readAndParseInput(filePath);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe('file');
      expect(result.sourcePath).toBe(filePath);
      expect(result.canonical).toBe(validPuzzle);
    }
  });
});
