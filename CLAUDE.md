# Teleprompter

## Project Overview

**Teleprompter**: A prompt management system for LLMs running on Cloudflare Workers.

### Problem

Teams building LLM-powered applications need a way to manage, version, and distribute prompts at runtime without redeploying code. Prompts change frequently during development and tuning, and changes need to propagate to running applications immediately.

### Approach

Teleprompter stores versioned prompts in Cloudflare Durable Objects and pushes updates to applications via Cloudflare Queues. Prompts use the dotprompt format (YAML frontmatter + Handlebars body) for structured metadata alongside templates. A CLI tool manages prompts, and an SDK consumes them in applications.

## Tech Stack

- **Language**: TypeScript (strict mode, ES2021 target)
- **Runtime**: Cloudflare Workers (Durable Objects, Queues)
- **Package Manager**: npm
- **Testing**: Jest + ts-jest
- **Formatting**: Prettier (tabs, single quotes, no semicolons, 140 print width)
- **Build**: `tsc`
- **Key Libraries**: dotprompt, teleprompter-sdk, yaml

## Git Practices

- **Branching**: Feature branches off `main`
- **Branch naming**: `<type>/<description>` where type is `feature`, `bugfix`, `chore`, etc.
- **Examples**: `feature/dotprompt-support`, `bugfix/metadata-parsing`, `chore/update-deps`

## Git Commit Rules

**COMMIT EARLY, COMMIT OFTEN** - This is mandatory.

- Commit after every successful TDD cycle (RED-GREEN-REFACTOR)
- Commit after completing any discrete unit of work
- Commit before switching context or taking breaks
- Never have more than 30 minutes of uncommitted work
- Each commit should be atomic: one logical change per commit

Why this matters:
- Small commits are easier to review and revert
- Frequent commits prevent loss of work
- Atomic commits make git history useful for debugging
- Regular commits force you to think in small, testable increments

## ABSOLUTE RULES - NO EXCEPTIONS

### 1. Test-Driven Development is MANDATORY

**The Iron Law**: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

Every single line of production code MUST follow this cycle:
1. **RED**: Write failing test FIRST
2. **Verify RED**: Run test, watch it fail for the RIGHT reason
3. **GREEN**: Write MINIMAL code to pass the test
4. **Verify GREEN**: Run test, confirm it passes
5. **REFACTOR**: Clean up with tests staying green

### 2. Violations = Delete and Start Over

If ANY of these occur, you MUST delete the code and start over:
- Wrote production code before test -> DELETE CODE, START OVER
- Test passed immediately -> TEST IS WRONG, FIX TEST FIRST
- Can't explain why test failed -> NOT TDD, START OVER
- "I'll add tests later" -> DELETE CODE NOW
- "Just this once without tests" -> NO. DELETE CODE.
- "It's too simple to test" -> NO. TEST FIRST.
- "Tests after achieve same goal" -> NO. DELETE CODE.

### 3. Test Coverage Requirements

- **Minimum 90%** coverage on ALL metrics:
  - Lines: 90%+
  - Functions: 90%+
  - Branches: 85%+
  - Statements: 90%+
- Coverage below threshold = Implementation incomplete
- Untested code = Code that shouldn't exist

### 4. Before Writing ANY Code

Ask yourself:
1. Did I write a failing test for this?
2. Did I run the test and see it fail?
3. Did it fail for the expected reason?

If ANY answer is "no" -> STOP. Write the test first.

### 5. Test File Structure

For every production file, there MUST be a corresponding test file:
- `src/example.ts` -> `src/__tests__/example.test.ts`

### 6. Task Completion Requirements

**MANDATORY RULE**: NO TASK IS COMPLETE until:
- ALL tests pass (100% green)
- Build succeeds with ZERO errors
- Coverage meets minimum thresholds (90%+)
- Progress documented in PROGRESS.md

A task with failing tests or build errors is INCOMPLETE. Period.

### 7. Progress Documentation

After completing EACH task, document in `PROGRESS.md`:
- Task completed
- Tests written/passed
- Coverage achieved
- Any issues encountered
- Timestamp

## Development Workflow

For EACH feature/function:

1. Write test file or add test case
2. Run: `npm test`
3. See RED (test fails)
4. Understand WHY it fails
5. Write minimal production code
6. Run: `npm test`
7. See GREEN (test passes)
8. Refactor if needed
9. Run: `npm test` (stays green)
10. Check coverage: `npx jest --coverage`
11. Commit
12. Repeat for next feature

## Commands

```bash
# Run tests
npm test

# Run tests with coverage
npx jest --coverage

# Build
npx tsc --noEmit

# Format check
npx prettier --check src/
```

## Verification

See @VERIFICATION_PLAN.md for acceptance testing procedures.
