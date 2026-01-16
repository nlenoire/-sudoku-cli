import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const GRID_DIMENSION = 9;
const GRID_SIZE = GRID_DIMENSION * GRID_DIMENSION;
const WHITESPACE_PATTERN = /\s+/g;

export type ParseErrorCode = 'INVALID_LENGTH' | 'INVALID_CHARACTER';

export interface ParseError {
  message: string;
  code: ParseErrorCode;
  index?: number;
}

export interface ParseSuccess {
  ok: true;
  canonical: string;
  grid: number[][];
}

export interface ParseFailure {
  ok: false;
  error: ParseError;
}

export type ParseResult = ParseSuccess | ParseFailure;

export interface ParsedInputSuccess extends ParseSuccess {
  source: 'inline' | 'file';
  sourcePath?: string;
}

export type InputParseResult = ParsedInputSuccess | ParseFailure;

/**
 * Converts a raw Sudoku string (inline or file contents) into a canonical
 * 81-character representation plus a 9x9 numeric grid. Accepts digits 1-9
 * along with placeholders '0' and '.' for empty cells.
 */
export function parseGridFromString(raw: string): ParseResult {
  const significantChars = raw.replace(WHITESPACE_PATTERN, '');

  if (significantChars.length !== GRID_SIZE) {
    return {
      ok: false,
      error: {
        code: 'INVALID_LENGTH',
        message: `Expected 81 significant characters, received ${significantChars.length}.`,
      },
    };
  }

  const cells: number[] = new Array(GRID_SIZE);

  for (let i = 0; i < GRID_SIZE; i += 1) {
    const char = significantChars[i];
    if (!isValidCellChar(char)) {
      return {
        ok: false,
        error: {
          code: 'INVALID_CHARACTER',
          message: `Invalid character "${char}" at position ${i + 1}. Allowed characters: 1-9, 0, .`,
          index: i,
        },
      };
    }

    cells[i] = char === '.' || char === '0' ? 0 : Number(char);
  }

  const canonical = cells.map((value) => value.toString()).join('');
  const grid: number[][] = [];

  for (let row = 0; row < GRID_DIMENSION; row += 1) {
    const start = row * GRID_DIMENSION;
    grid.push(cells.slice(start, start + GRID_DIMENSION));
  }

  return {
    ok: true,
    canonical,
    grid,
  };
}

/**
 * Determines whether the provided CLI argument represents raw inline content
 * or a path to a readable file. File input is preferred if a readable file
 * exists at the resolved path; otherwise the argument is parsed inline.
 */
export async function readAndParseInput(inputArg: string): Promise<InputParseResult> {
  const resolvedPath = path.resolve(process.cwd(), inputArg);

  try {
    const stats = await stat(resolvedPath);
    if (stats.isFile()) {
      const fileContents = await readFile(resolvedPath, 'utf8');
      const parsedFromFile = parseGridFromString(fileContents);
      if (parsedFromFile.ok) {
        return {
          ...parsedFromFile,
          source: 'file',
          sourcePath: resolvedPath,
        };
      }

      return {
        ok: false,
        error: {
          ...parsedFromFile.error,
          message: `Failed to parse input file ${resolvedPath}: ${parsedFromFile.error.message}`,
        },
      };
    }
  } catch {
    // If the path does not exist or is unreadable, fall back to inline parsing.
  }

  const parsedInline = parseGridFromString(inputArg);
  if (parsedInline.ok) {
    return {
      ...parsedInline,
      source: 'inline',
    };
  }

  return parsedInline;
}

function isValidCellChar(char: string): boolean {
  return char === '.' || char === '0' || (char >= '1' && char <= '9');
}
