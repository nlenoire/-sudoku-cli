# BACKLOG_PACK

---

## **Guardrails**

These apply to **all stories** and should be respected by both humans and AI coding assistants:

- **Tests-first (or at least tests-together)**:
    - When adding behavior, add/adjust tests in the same or preceding change.
    - Avoid large behavior changes without corresponding test updates.

- **Small, focused diffs**:
    - Prefer small, coherent changes scoped to the current story.
    - Avoid refactoring unrelated code unless explicitly called out.

- **Deterministic generator with seed**:
    - Sudoku generator must use a **seeded RNG**, not `Math.random` directly.
    - For a given `(difficulty, seed)` pair, output must be stable (within same Node/deps).

- **No UI**:
    - Scope is **CLI-only**. No web UI, no GUI, no additional interfaces.

- **Node ≥ 20**:
    - Code, tooling, and CI must assume **Node 20 or higher**.
    - Use modern Node/TS features that are compatible with Node ≥ 20.

---

## **SUD-1 — Project Scaffolding & CLI Framework**

**Title**  
SUD-1 — Scaffold TypeScript Sudoku CLI repo and base CLI framework

**Description**  
Create a new Node.js (≥ 20) TypeScript project for the Sudoku CLI, with a clear structure and a minimal but functional CLI skeleton. Provide a `sudoku` command exposing stub subcommands: `validate`, `solve`, and `generate`. This establishes the base for all further work.

**Acceptance Criteria**

- Repository exists with:
    - `package.json` configured for **Node ≥ 20** (`"engines.node": ">=20"`).
    - `tsconfig.json` suitable for a Node ≥ 20 CLI (ES module or CJS is fine as long as consistent).
    - Standard layout: `src/`, `test/`, `dist/`, and optionally `bin/`.
- CLI entrypoint implemented (e.g., `src/cli.ts`), compiled to something like `dist/cli.js`.
- `package.json` has a `bin` mapping, e.g.:
    - `"bin": { "sudoku": "dist/cli.js" }`
- After `npm run build`, running:
    - `npx sudoku --help` (or `node dist/cli.js --help`)
    - Shows usage plus subcommands: `validate`, `solve`, `generate`.
- Subcommand stubs:
    - `sudoku validate --input "<value>"`
    - `sudoku solve --input "<value>"`
    - `sudoku generate --difficulty <level> --seed <number>`
    - All print “Not implemented yet” (or equivalent) and exit with **code 0** (for now).
- NPM scripts exist:
    - `"build"` — compiles TS to `dist`.
    - `"start"` or `"dev"` (optional) — runs the CLI in dev mode.

**Definition of Done**

- Fresh checkout flow works:
    - `npm install`
    - `npm run build`
    - `npx sudoku --help` runs successfully (no runtime errors).
- A teammate can clone the repo, run the above commands, and confirm behavior.
- TypeScript compilation completes with no errors.

**Implementation Notes**

- Prefer a well-known CLI framework (e.g., `commander`, `yargs`) to handle arguments and `--help`.
- Keep `src/cli.ts` thin; delegate each subcommand to separate modules later (e.g., `src/commands/validate.ts`).
- Decide on module system (`"type": "module"` vs CJS) once and keep configuration consistent across `tsconfig.json` and `package.json`.
- Add `.gitignore` for `node_modules`, `dist`, coverage, etc.

**Files likely impacted**

- `package.json` (create/configure)
- `tsconfig.json`
- `.gitignore`
- `src/cli.ts`
- (Optional) `src/commands/*.ts` stubs
- `.npmrc` / CI boilerplate (optional at this stage)

**Commands to verify**

Run from project root:

- `npm install`
- `npm run build`
- `node dist/cli.js --help`
- `node dist/cli.js validate --input "123"  # should print 'Not implemented yet'`
- `node dist/cli.js generate --difficulty easy --seed 42  # stub output, exit 0`

---

## **SUD-2 — Input Parsing & Grid Normalization**

**Title**  
SUD-2 — Implement robust Sudoku input parsing (81-char string or file)

**Description**  
Implement a reusable input parsing layer that supports both direct 81-char input and file-based input via `--input`. Normalize whitespace, validate allowed characters and length, and return a canonical grid representation used by validator, solver, and generator.

**Acceptance Criteria**

- Parsing module (e.g., `src/lib/parser.ts`) exports:
    - `parseGridFromString(raw: string): ParseResult`
        - Strips whitespace (spaces, tabs, newlines).
        - Accepts only `1-9`, `0`, `.` as **significant characters**.
        - Ensures exactly **81 significant characters**.
        - Maps `.`, `0` to **empty cell** (e.g., `0`).
        - Returns either:
            - `ok: true, grid: number[][]` (or similar), and canonical 81-char string if useful.
            - `ok: false, error: { message: string, code?: string, index?: number }`.
    - `readAndParseInput(inputArg: string): ParseResult`
        - Decides whether `inputArg` is used as direct content or as a file path (document behavior).
        - If file path, reads the file, then delegates to `parseGridFromString`.
- Error behavior:
    - If significant characters ≠ 81:
        - Error message includes expected and actual counts.
    - If disallowed characters:
        - Error message includes offending character and its position.
- CLI integration:
    - `sudoku validate/solve/generate` use `readAndParseInput` as the **single source of truth** for input parsing (even for `generate`, this might be a no-op or limited; depending on design you may not need parsing there, but wire in a consistent handling if input is ever used).
    - On parsing failure:
        - Print clear error to stderr.
        - Exit with non-zero code.

**Definition of Done**

- TypeScript build passes with parser included.
- Manual validation via CLI:
    - Inline valid 81-char string:
        - `sudoku validate --input "<81-chars>"` reaches later logic (even if not fully implemented yet).
    - File with lines/whitespace:
        - `sudoku validate --input "path/to/puzzle.txt"` correctly flattens to 81 chars.
    - Invalid length / characters cause parse errors with clear descriptions.
- Parsing contract (inputs/outputs, use of `0` and `.`) is documented in code comments.

**Implementation Notes**

- Keep `parseGridFromString` **pure** (no I/O).
- Do file I/O in a thin wrapper (`readAndParseInput`), so it’s easier to test with mocks.
- Consider returning both:
    - `grid: number[][]`
    - `raw: string` (canonical 81-char string)  
      to avoid recomputing string representations downstream.
- Be explicit and deterministic in how you decide “inline string vs file path” (e.g., provide an additional option later if ambiguity is an issue).

**Files likely impacted**

- `src/lib/parser.ts` (new)
- `src/cli.ts` (wire parser into commands)
- `src/commands/validate.ts`, `solve.ts`, `generate.ts` (if split) to call parser
- Future tests in `test/parser.test.ts` (can be stubbed here or in SUD-5)

**Commands to verify**

After `npm run build`:

- `node dist/cli.js validate --input "valid81charstring..."`
    - Should either reach stub validator or show parse success.
- `node dist/cli.js validate --input "fixtures/valid.txt"`
    - With a file containing a 9x9 grid with spaces/newlines.
- `node dist/cli.js validate --input "too-short"`
    - Non-zero exit; stderr shows length error.
- `node dist/cli.js validate --input "invalid@chars..."`
    - Non-zero exit; stderr includes invalid character info.

---

## **SUD-3 — Sudoku Rule Validator**

**Title**  
SUD-3 — Implement Sudoku grid validator and wire `sudoku validate`

**Description**  
Create a Sudoku rule validator that checks rows, columns, and 3×3 subgrids for duplicate non-zero digits. Integrate it into `sudoku validate` so users can validate puzzles from either inline or file input.

**Acceptance Criteria**

- Validator module (e.g., `src/lib/validator.ts`) exports:
    - `validateGrid(grid: number[][]): ValidationResult`
        - Ignores empty cells (`0`).
        - Checks:
            - Row uniqueness: no duplicate digits 1–9 in any row.
            - Column uniqueness: no duplicate digits 1–9 in any column.
            - Box uniqueness: no duplicate digits 1–9 in any 3×3 subgrid.
        - Returns something like:
          ```ts
          type ViolationType = 'row' | 'column' | 'box';
    
          interface Violation {
            type: ViolationType;
            index: number;       // row/column/box index
            digit: number;
            positions?: { row: number; col: number }[];
          }
    
          interface ValidationResult {
            valid: boolean;
            violations: Violation[];
          }
          ```
- `sudoku validate --input "<...>"` behavior:
    - Uses parser from SUD-2 to obtain `grid`.
    - On valid grid:
        - Prints success message (e.g., “Grid is valid.”).
        - Exit code **0**.
    - On invalid grid:
        - Prints at least one violation summary (e.g., “Duplicate 5 in row 3”).
        - Exit code **non-zero**.
    - On parse error, existing SUD-2 behavior remains (non-zero exit + parse error).

**Definition of Done**

- Build passes with validator integrated.
- Manual tests:
    - Valid puzzle (complete or partial) → “valid”, exit code 0.
    - Puzzle with:
        - Row duplicate.
        - Column duplicate.
        - Box duplicate.  
          Each case produces a specific, understandable message and non-zero exit.
- Validator is documented (top-of-file comment summarizing its role) and reviewed.

**Implementation Notes**

- Keep `validateGrid` **pure** and side-effect free.
- Use this same validator later to:
    - Check generated puzzles (SUD-4).
    - Optionally sanity-check input before solving.
- Align error messages with test expectations (stable phrasing is helpful for assertions).

**Files likely impacted**

- `src/lib/validator.ts` (new)
- `src/cli.ts` or `src/commands/validate.ts` (call validator after parser)
- Future tests in `test/validator.test.ts`

**Commands to verify**

After `npm run build`:

- `node dist/cli.js validate --input "<valid81charpuzzle>"`
    - Exit code 0; stdout contains “valid”.
- `node dist/cli.js validate --input "<row-duplicate-puzzle>"`
    - Non-zero exit; stderr or stdout indicates row duplicate.
- `node dist/cli.js validate --input "<box-duplicate-puzzle>"`
    - Non-zero exit; message shows box violation.

---

## **SUD-4 — Sudoku Solver & Generator (Difficulty + Deterministic Seed)**

**Title**  
SUD-4 — Implement Sudoku solver and deterministic, difficulty-aware generator

**Description**  
Implement a Sudoku solver (e.g., backtracking) that can solve valid puzzles, and a generator that creates valid puzzles for `easy`, `medium`, and `hard`. The generator must be deterministic for the same `(difficulty, seed)` pair. Wire these into `sudoku solve` and `sudoku generate`.

**Acceptance Criteria**

- Solver module (e.g., `src/lib/solver.ts`) exports:
    - `solveGrid(grid: number[][]): SolveResult`
        - Attempts to solve the grid.
        - Returns:
          ```ts
          interface SolveSuccess {
            ok: true;
            solution: number[][];
          }
    
          interface SolveFailure {
            ok: false;
            reason: 'unsolvable' | 'invalid' | 'multiple-solutions' | string;
          }
    
          type SolveResult = SolveSuccess | SolveFailure;
          ```
        - Solves at least one known puzzle quickly.
- Generator module (e.g., `src/lib/generator.ts`) exports:
    - `generatePuzzle(difficulty: 'easy' | 'medium' | 'hard', seed: number): number[][]`
        - Uses a **seeded RNG** (no bare `Math.random`).
        - Produces a **valid** Sudoku grid that:
            - Conforms to Sudoku rules (can reuse validator).
            - Is solvable by `solveGrid`.
        - For a fixed `(difficulty, seed)`, returns the **same** puzzle on every run (given same Node & deps).
- Difficulty:
    - At minimum, difficulties differ by number of clues or removal pattern.
    - Behavior is documented in code comments (e.g., “easy ≈ 40+ clues, medium ≈ 30–40, hard < 30”).
- CLI integration:
    - `sudoku solve --input "<...>"`:
        - Parses input (SUD-2).
        - Optionally validates (SUD-3) before solving.
        - On success:
            - Prints solved grid as a single 81-char line.
            - Exit code 0.
        - On failure (unsolvable/invalid):
            - Print reason to stderr.
            - Exit code non-zero.
    - `sudoku generate --difficulty easy|medium|hard --seed <number>`:
        - Validates `difficulty` and `seed` input.
        - Calls `generatePuzzle`.
        - Prints puzzle as a single 81-char line.
        - Exit code 0 on success; non-zero with clear message on invalid args.

**Definition of Done**

- Build passes with solver and generator integrated into CLI.
- Manual scenario checks:
    - Known solvable puzzle:
        - `sudoku solve --input "<puzzle>"` → 81-char solved grid, exit 0.
    - Generated puzzle:
        - `sudoku generate --difficulty easy --seed 42` → 81-char puzzle.
        - That puzzle, fed into `sudoku solve`, yields a solution.
    - Repeat generation with same `(difficulty, seed)` yields same output.
    - Invalid difficulty or seed yields non-zero exit + clear error.
- A brief design note (in code comments or short markdown) explains:
    - Solver algorithm.
    - Generator strategy and difficulty heuristic.
- Peer review completed.

**Implementation Notes**

- For seeded RNG:
    - Implement a simple LCG or use a minimal dependency that supports seeding.
    - Ensure randomness is **only** derived from this seedable RNG inside generator.
- Basic generator strategy:
    - Generate a full valid solution.
    - Remove clues in a pattern influenced by difficulty.
    - Re-check solvability (and, if feasible, uniqueness) using `solveGrid`.
- Keep `generatePuzzle` and `solveGrid` pure and deterministic, with all randomness injected via a seed.

**Files likely impacted**

- `src/lib/solver.ts`
- `src/lib/generator.ts`
- `src/lib/validator.ts` (reuse for generator validation if needed)
- `src/cli.ts` or `src/commands/solve.ts`, `generate.ts`
- (Later) tests in `test/solver.test.ts`, `test/generator.test.ts`

**Commands to verify**

After `npm run build`:

- `node dist/cli.js solve --input "<known-solvable-puzzle>"`
    - Exit 0; stdout 81-char solved line.
- `node dist/cli.js generate --difficulty easy --seed 42`
    - Exit 0; stdout 81-char line.
    - Save output as `<p>` and run: `node dist/cli.js solve --input "<p>"`.
- `node dist/cli.js generate --difficulty invalid --seed 42`
    - Non-zero exit; stderr mentions invalid difficulty.
- Repeat generation with same args and compare outputs for determinism.

---

## **SUD-5 — Testing (Unit + CLI Smoke) & CI Workflow (Test + Typecheck)**

**Title**  
SUD-5 — Add automated tests and CI workflow for test + typecheck

**Description**  
Add unit tests for parser, validator, solver, and generator, plus CLI smoke tests that execute the built CLI. Configure a CI workflow that runs `build`, `test`, and `typecheck` on each push/PR, failing on any error.

**Acceptance Criteria**

- Test framework configured (e.g., Jest, Vitest, Mocha+Chai):
    - `npm test` runs all tests.
- Unit tests:
    - **Parser tests** (`test/parser.test.ts`):
        - Valid 81-char strings → success, correct grid.
        - Too-short / too-long → length error with correct counts.
        - Invalid characters → error with offending char and index.
        - `.` and `0` map to empty cells.
    - **Validator tests** (`test/validator.test.ts`):
        - Valid complete + partial grids → `valid: true`.
        - Row/column/box duplicates → `valid: false`, violations populated.
    - **Solver tests** (`test/solver.test.ts`):
        - Known solvable puzzle → correct solution (grid equality).
        - Unsolvable puzzle → `ok: false` with `reason` explaining.
    - **Generator tests** (`test/generator.test.ts`):
        - For each difficulty and fixed seed:
            - Output has 81 cells.
            - Validator says grid is valid.
            - Running solver yields solution.
            - Multiple runs with same `(difficulty, seed)` produce same output.
- CLI smoke tests (`test/cli.smoke.test.ts` or similar):
    - Run compiled CLI via `child_process`:
        - `sudoku validate --input "<valid>"` → exit 0; output contains “valid”.
        - `sudoku validate --input "<invalid>"` → non-zero exit; error message.
        - `sudoku solve --input "<puzzle>"` → exit 0; 81-char solution.
        - `sudoku generate --difficulty easy --seed 42` → exit 0; 81-char output.
- CI workflow (e.g., `.github/workflows/ci.yml`) that:
    - Triggers on push and PR.
    - Runs steps:
        - `npm ci` or `npm install`
        - `npm run build`
        - `npm run typecheck` (`tsc --noEmit`)
        - `npm test`
    - Fails on any non-zero command.

**Definition of Done**

- Local commands:
    - `npm run build`
    - `npm run typecheck`
    - `npm test`  
      all pass on a clean checkout using Node ≥ 20.
- CI pipeline:
    - Config file exists and runs successfully on at least one branch/PR.
    - Visible in CI UI with passing status.
- Tests cover critical paths of parser, validator, solver, generator, and CLI commands.

**Implementation Notes**

- Consider running tests against TypeScript directly (via ts-jest, ts-node, or vitest with TS support) or compile and test JS in `dist`.
- For CLI smoke tests:
    - Use stable substrings in assertions (avoid brittle full-output matches).
- Determinism:
    - In generator tests, fix seeds and assert exact strings or at least stable patterns.
- Keep test data (puzzles) in dedicated fixtures (e.g., `test/fixtures/`) for reuse.

**Files likely impacted**

- `package.json` (add `test`, `typecheck` scripts)
- `test/parser.test.ts`
- `test/validator.test.ts`
- `test/solver.test.ts`
- `test/generator.test.ts`
- `test/cli.smoke.test.ts`
- CI config (e.g., `.github/workflows/ci.yml` or similar for your platform)

**Commands to verify**

- `npm run build`
- `npm run typecheck`
- `npm test`
- Trigger CI (push/PR) and verify green build in CI UI.

---

## **SUD-6 — Documentation & AI-Readiness Assets**

**Title**  
SUD-6 — Add documentation, usage examples, and AI-readiness repo assets

**Description**  
Create clear user and developer documentation so the Sudoku CLI is easy to understand, install, and use. Add AI-readiness assets (e.g., high-level architecture, pointers for AI tools) so an AI coding assistant can quickly locate key entrypoints and modules.

**Acceptance Criteria**

- `README.md` includes:
    - Overview:
        - “TypeScript Sudoku CLI” with **Node.js ≥ 20** requirement.
        - No UI; CLI-only.
    - Setup:
        - `npm install`
        - `npm run build`
    - Quality:
        - `npm run typecheck`
        - `npm test`
    - Usage examples:
        - `sudoku validate --input "<81-char-string>"`
        - `sudoku validate --input "path/to/puzzle.txt"`
        - `sudoku solve --input "<...>"`
        - `sudoku generate --difficulty easy|medium|hard --seed <number>`
    - Input format explanation:
        - 81 characters, allowed symbols (`1-9`, `0`, `.`).
        - Handling of whitespace and multi-line files.
- Developer / architecture doc (e.g., `docs/architecture.md` or `DEVELOPERS.md`):
    - Describes:
        - `src/cli.ts` and command modules.
        - `src/lib/parser.ts`, `validator.ts`, `solver.ts`, `generator.ts`.
    - Notes constraints:
        - Node ≥ 20.
        - Deterministic generator with seed.
        - No UI.
- AI-readiness assets:
    - A short guide for AI tools (could be a section in `DEVELOPERS.md` or separate `docs/ai-assistant-notes.md`) that:
        - Lists “entrypoint files” (CLI, parser, validator, solver, generator).
        - Encourages small, focused changes and tests updates when editing.
        - Explains naming conventions and directory layout.
- Demo script section:
    - Step-by-step commands to:
        - Validate a known valid puzzle.
        - Validate an invalid puzzle.
        - Generate an `easy` puzzle with `--seed 42` and then solve it.

**Definition of Done**

- Docs render correctly in repo viewer (e.g., GitHub/GitLab).
- Following `README.md` from a clean checkout on Node 20:
    - Allows a new user to build, test, and run example commands successfully.
- A developer unfamiliar with the code can, using docs:
    - Locate core modules.
    - Understand high-level flow from CLI → parser → validator/solver/generator.
- AI-readiness notes are explicit enough for an AI assistant to:
    - Identify where to add new commands.
    - Understand core responsibilities of each module.

**Implementation Notes**

- Keep examples copy-paste friendly with realistic sample puzzles.
- Consider a short “Troubleshooting” / FAQ section for common errors (invalid length, invalid chars, unsolvable puzzles).
- In key source files (e.g., `src/cli.ts`, `src/lib/generator.ts`), add brief header comments summarizing the file’s purpose (helps both humans and AI tools).
- If your organization uses specific AI metadata/config files, integrate them here.

**Files likely impacted**

- `README.md`
- `DEVELOPERS.md` or `docs/architecture.md`
- `docs/ai-assistant-notes.md` (or similar)
- Optional updates to source file header comments (`src/cli.ts`, `src/lib/*.ts`)

**Commands to verify**

- Follow the README end-to-end on a clean environment:
    - `npm install`
    - `npm run build`
    - `npm run typecheck`
    - `npm test`
    - `node dist/cli.js validate --input "<sample-puzzle>"`
    - `node dist/cli.js generate --difficulty easy --seed 42`
    - `node dist/cli.js solve --input "<generated-puzzle>"`

Sources:

