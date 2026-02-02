# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (Playwright)

## Test-Driven Development (TDD)

**Claude automatically invokes TDD workflow** for:
- New features
- Bug fixes
- Refactoring
- Business logic implementation

MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

**No manual command needed** - Claude will automatically use the tdd-guide agent or tdd-workflow skill when appropriate.

## Troubleshooting Test Failures

1. Automatically uses **tdd-guide** agent
2. Check test isolation
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)

## E2E Test Setup (MANDATORY)

**Proactively set up E2E tests when:**
- Implementing user-facing features (new pages, forms, flows)
- Adding interactive UI components (modals, dropdowns, wizards)
- Modifying critical user journeys (auth, checkout, booking)
- Creating new API endpoints with UI integration

**Use the `/e2e` skill to:**
1. Generate Playwright test journeys
2. Set up test fixtures and page objects
3. Run tests locally with screenshots/videos/traces
4. Configure CI integration

**Required for features involving:**
- User authentication/authorization
- Form submissions and validation
- Payment flows
- Multi-step processes
- Data mutations (create/update/delete)

**Skip E2E for:**
- Pure backend changes with no UI impact
- Documentation updates
- Configuration changes
- Non-interactive visual changes

## Agent Support

- **tdd-guide** - Automatically invoked for new features, enforces write-tests-first
- **e2e-runner** - Playwright E2E testing specialist, auto-invoked for critical flows
