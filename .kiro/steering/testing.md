# Testing Standards

## Pattern: TDD
1. Write a failing test first
2. Implement the minimum to make it pass
3. Verify with `npm test`
4. Commit

## Test file location
- `tests/modules/bot/` for bot engine tests
- `tests/modules/scoring/` for scorer tests
- `tests/modules/appointments/` for briefing/booking tests
- `tests/lib/` for library utilities

## Rules
- No `any` in test files
- Each exported function in a module must have at least one test
- Mock `fetch` with `vi.stubGlobal` — never make real network calls in tests
- Use `describe` + `it` blocks (not bare `test`)
- Always run `npm test` before committing

## Run commands
```bash
npm test              # run all tests
npm test -- tests/modules/bot/  # run specific directory
npm run build         # TypeScript check + Vite build
```

## Vitest config
Located at `vitest.config.ts`. Uses `environment: "node"`, `globals: true`.
Path alias `@/` resolves to `./src/`.
