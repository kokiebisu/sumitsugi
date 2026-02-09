# Bun Migration Design

**Date:** 2026-02-02
**Goal:** Migrate from Node.js/npm to Bun for performance improvements
**Strategy:** Phased migration with validation checkpoints

## Motivation

Migrate to Bun to achieve:

- 2-3x faster dependency installs
- Faster dev server startup
- Faster builds in CI/CD
- All-in-one tooling (runtime, package manager, test runner)

**Deployment targets:** Vercel (current), AWS (future)
**Approach:** Bun everywhere (dev, CI/CD, production)
**Risk tolerance:** Somewhat comfortable with rough edges, prefer validation at each phase

## Migration Phases

### Phase 1: Development Environment (30-45 min)

**Objective:** Replace Node.js devcontainer with Bun

**Changes:**

1. **Dockerfile** (`FROM oven/bun:1-debian`)
   - Replace `node:20-bullseye` with Bun's official Debian-based image
   - Remove npm global installs (nodemon, typescript, typescript-language-server, ts-node)
   - Keep all other tools: Claude CLI, Beads, gh, docker, git-delta, Playwright
   - Change user from `node` to `bun` (Bun image default)
   - Update PATH and environment variables

2. **devcontainer.json**
   - Update `postCreateCommand`: `npm install` → `bun install`
   - Update `remoteUser`: `node` → `bun`
   - Keep all mounts (`.ssh`, `.config/gh`, `.claude`, Docker socket)
   - Update Playwright install: `npx playwright` → `bunx playwright`

3. **Package manager commands**
   - `npm install` → `bun install`
   - `npm ci` → `bun install --frozen-lockfile`
   - `npm run dev` → `bun run dev` or `bun dev`
   - `npx` → `bunx`

4. **Lock file**
   - Generate `bun.lockb` (binary lockfile)
   - Remove `package-lock.json`

**Validation checklist:**

- [ ] Devcontainer rebuilds successfully
- [ ] `bun install` completes without errors
- [ ] `bun dev` starts Next.js dev server
- [ ] `bun run build` creates production build
- [ ] `bun playwright test` runs E2E tests
- [ ] All package.json scripts work
- [ ] Claude CLI, Beads, git function correctly

**Rollback:** Revert Dockerfile and devcontainer.json from git

### Phase 2: CI/CD Workflows (30-45 min)

**Objective:** Migrate all GitHub Actions to use Bun

**Workflows to update:**

1. `requirements-audit.yml` - Daily Claude audit
2. `e2e-tests.yml` - E2E tests with Playwright
3. `cleanup-branches.yml` - Branch cleanup
4. `claude-code-review.yml` - Code review
5. `claude.yml` - Claude integration

**Standard migration pattern:**

**Before:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- name: Install dependencies
  run: npm ci

- name: Run script
  run: npm run build
```

**After:**

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest

- name: Install dependencies
  run: bun install --frozen-lockfile

- name: Run script
  run: bun run build
```

**Command mapping:**

- `npm ci` → `bun install --frozen-lockfile`
- `npm install` → `bun install`
- `npm run <script>` → `bun run <script>` or `bun <script>`
- `npx playwright` → `bunx playwright`
- `node script.js` → `bun script.js`

**Node.js inline scripts:** Keep as-is. Bun is Node-compatible and supports `require()`, `fs`, etc.

**Validation checklist:**

- [ ] All workflows trigger and run successfully
- [ ] Requirements audit completes
- [ ] E2E tests pass
- [ ] Branch cleanup works
- [ ] Code review functions
- [ ] No regression in CI performance

**Rollback:** Revert workflow files from git

### Phase 3: Production Deployment (45-60 min)

**Objective:** Configure production deployments for Bun runtime

#### 3.1 Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "bun run build",
  "devCommand": "bun dev",
  "installCommand": "bun install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Notes:**

- Vercel's Bun runtime is in beta (2026)
- Automatic fallback to Node.js if issues occur
- 2-3x faster build times expected
- Potentially faster cold starts

#### 3.2 AWS Deployment

Create `Dockerfile.production`:

```dockerfile
FROM oven/bun:1-debian as builder

WORKDIR /app

# Copy dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Build Next.js
RUN bun run build

# Production image
FROM oven/bun:1-debian-slim

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["bun", "server.js"]
```

**Deployment targets:**

- ECS (Elastic Container Service)
- EKS (Elastic Kubernetes Service)
- Lambda (with custom runtime)

**Validation checklist:**

- [ ] Vercel deployment succeeds
- [ ] Production build works locally with Bun
- [ ] Docker image builds successfully
- [ ] Production app runs correctly
- [ ] No runtime errors in production
- [ ] Performance metrics meet expectations

**Rollback:**

- Vercel: Remove `vercel.json` to fall back to Node.js
- AWS: Use existing Node.js Dockerfile

## Success Criteria

### Performance Targets

- ✅ 2-3x faster dependency installs (vs npm)
- ✅ Faster dev server startup
- ✅ Faster CI/CD builds (20-30% improvement expected)
- ✅ Comparable or better production performance

### Functional Requirements

- ✅ All tests passing (unit, integration, E2E)
- ✅ All GitHub Actions workflows passing
- ✅ Dev server works correctly
- ✅ Production builds succeed
- ✅ Production deployments stable
- ✅ No breaking changes to developer workflow

### Documentation

- ✅ CLAUDE.md updated with Bun commands
- ✅ README updated with Bun installation
- ✅ Deployment docs updated

## Risk Mitigation

**Phase-based approach:** Validate each phase before proceeding
**Rollback strategy:** Git revert available at each checkpoint
**Compatibility layer:** Bun includes Node.js for package compatibility
**Gradual deployment:** Can keep production on Node.js if needed

## Timeline

**Total estimated time:** 2-3 hours

- Phase 1: 30-45 minutes
- Phase 2: 30-45 minutes
- Phase 3: 45-60 minutes

Each phase includes implementation, testing, and validation.

## Post-Migration Tasks

1. Update CLAUDE.md with new commands
2. Update README with Bun prerequisites
3. Document any compatibility issues encountered
4. Monitor production performance metrics
5. Update team documentation

## Known Considerations

1. **Package compatibility:** Some npm packages may have issues with Bun (test thoroughly)
2. **Playwright:** Use Playwright's test runner (invoked via `bun`), not Bun's test runner
3. **Vercel beta:** Bun runtime is experimental, monitor for issues
4. **Lock file format:** `bun.lockb` is binary, not human-readable
5. **Team onboarding:** Team members need Bun installed locally

## References

- [Bun documentation](https://bun.sh/docs)
- [Bun Docker images](https://hub.docker.com/r/oven/bun)
- [Vercel Bun support](https://vercel.com/docs/frameworks/bun)
- [GitHub Actions Bun setup](https://github.com/oven-sh/setup-bun)
