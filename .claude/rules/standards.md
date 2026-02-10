# Standards

## Coding Style

- **Immutability:** ALWAYS create new objects, NEVER mutate (`{...obj, key: val}`)
- **Small files:** 200-400 lines typical, 800 max. Many small > few large
- **Small functions:** <50 lines, no deep nesting (>4 levels)
- **Error handling:** Always catch and throw with descriptive messages
- **Input validation:** Use Zod schemas at system boundaries
- **No console.log** in committed code
- **No hardcoded values** — use env vars or config

## Testing (TDD Required)

Coverage minimum: 80%. All three required: unit, integration, E2E (Playwright).

**TDD cycle:** Write failing test (RED) → minimal implementation (GREEN) → refactor (IMPROVE)

- `bun run test:run` for unit tests
- `bun run test:e2e` for E2E tests
- E2E required for: user-facing features, forms, auth, payment, multi-step flows

## Security

Before commit: no hardcoded secrets, validated inputs, parameterized queries, XSS prevention, CSRF protection, no sensitive data in error messages.

```typescript
// ALWAYS: environment variables for secrets
const key = process.env.API_KEY;
if (!key) throw new Error('API_KEY not configured');
```

## Build Integrity (CRITICAL)

- **NEVER mark a task as "done"** unless `bun run build` passes
- **Type consistency:** When using union types (e.g., status: `'draft' | 'public'`), grep the codebase for all usages before changing or adding values
- **CI must include build:** If `bun run build` is missing from CI, add it before merging any feature PR

## Agent Auto-Invocation

Claude auto-invokes agents — no user prompt needed:

- **Plan/Architect:** Complex features, multi-file changes, architectural decisions
- **TDD:** New features, bug fixes, refactoring
- **Code review:** After writing/modifying code (MANDATORY)
- **E2E:** User-facing features (PROACTIVE)
- **Security:** Auth, user input, sensitive data
- **Build resolver:** When build fails
