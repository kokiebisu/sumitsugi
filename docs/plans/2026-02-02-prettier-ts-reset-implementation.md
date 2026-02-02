# Prettier + ts-reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Prettier for code formatting and ts-reset for improved TypeScript type safety with full automation (save-on-format + pre-commit hooks).

**Architecture:** Layer separation (Prettier for formatting, ESLint for code quality), full automation (editor integration + git hooks), staged rollout (setup → format existing code → verify).

**Tech Stack:** Prettier 3.x, @total-typescript/ts-reset, eslint-config-prettier, custom git hooks (no husky).

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Prettier and related packages**

```bash
bun add -d prettier@^3.2.5 @total-typescript/ts-reset@^0.6.1 eslint-config-prettier@^9.1.0
```

Expected: Packages installed, package.json updated with new devDependencies

**Step 2: Verify installation**

```bash
bun prettier --version
```

Expected: Output shows Prettier version 3.x.x

**Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore: add prettier and ts-reset dependencies"
```

---

## Task 2: Configure Prettier

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`

**Step 1: Create Prettier configuration**

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Step 2: Create Prettier ignore file**

Create `.prettierignore`:

```
# Dependencies
node_modules/
bun.lockb

# Build outputs
.next/
dist/
out/
build/

# Git
.git/
.worktrees/

# Env files
.env
.env.local
.env*.local

# Logs
*.log

# OS
.DS_Store

# TypeScript
tsconfig.tsbuildinfo

# Test results
coverage/
playwright-report/
test-results/

# Misc
*.min.js
*.min.css
```

**Step 3: Test Prettier configuration**

```bash
bun prettier --check src/lib/utils.ts
```

Expected: Shows formatting issues (if any) without modifying files

**Step 4: Commit**

```bash
git add .prettierrc.json .prettierignore
git commit -m "chore: configure prettier"
```

---

## Task 3: Set Up ts-reset

**Files:**
- Create: `src/types/ts-reset.d.ts`

**Step 1: Create ts-reset type definition file**

Create `src/types/ts-reset.d.ts`:

```typescript
import '@total-typescript/ts-reset/recommended';
```

**Step 2: Verify TypeScript recognizes the file**

```bash
bun run build 2>&1 | head -20
```

Expected: Build should complete without errors (ts-reset types are now active)

**Step 3: Commit**

```bash
git add src/types/ts-reset.d.ts
git commit -m "feat: add ts-reset for improved type safety"
```

---

## Task 4: Integrate Prettier with ESLint

**Files:**
- Modify: `eslint.config.mjs`

**Step 1: Update ESLint config to disable formatting rules**

Modify `eslint.config.mjs`:

```javascript
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        RequestInit: 'readonly',
        PositionOptions: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-undef': 'error',
    },
  },
  prettierConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', '.next', '.worktrees/**'],
  },
];
```

**Step 2: Verify ESLint config**

```bash
bun lint
```

Expected: ESLint runs without formatting conflicts

**Step 3: Commit**

```bash
git add eslint.config.mjs
git commit -m "chore: integrate prettier with eslint"
```

---

## Task 5: Add Package Scripts

**Files:**
- Modify: `package.json`

**Step 1: Add formatting scripts to package.json**

Add these scripts to the `scripts` section of `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "git config core.hooksPath .githooks || true"
  }
}
```

Update existing `lint` script:

```json
{
  "scripts": {
    "lint": "eslint . && prettier --check ."
  }
}
```

**Step 2: Test format:check script**

```bash
bun run format:check
```

Expected: Shows files that need formatting (or "All matched files use Prettier code style")

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add prettier scripts to package.json"
```

---

## Task 6: Configure Editor Integration

**Files:**
- Create or Modify: `.vscode/settings.json`

**Step 1: Check if .vscode/settings.json exists**

```bash
ls -la .vscode/settings.json 2>/dev/null || echo "File does not exist"
```

**Step 2: Create or update .vscode/settings.json**

If file exists, merge these settings. If not, create it:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**Step 3: Commit**

```bash
git add .vscode/settings.json
git commit -m "chore: configure vscode for prettier formatting"
```

---

## Task 7: Set Up Git Hooks

**Files:**
- Create: `.githooks/pre-commit`

**Step 1: Create .githooks directory**

```bash
mkdir -p .githooks
```

**Step 2: Create pre-commit hook**

Create `.githooks/pre-commit`:

```bash
#!/bin/bash
# Pre-commit hook: Format and lint staged files

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json|css|md)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

echo "Running Prettier on staged files..."
echo "$STAGED_FILES" | xargs bun prettier --write

echo "Running ESLint on staged files..."
if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' > /dev/null; then
  LINT_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$')
  echo "$LINT_FILES" | xargs bun eslint

  if [ $? -ne 0 ]; then
    echo "ESLint failed. Fix errors before committing."
    exit 1
  fi
fi

# Re-stage formatted files
echo "$STAGED_FILES" | xargs git add

exit 0
```

**Step 3: Make pre-commit hook executable**

```bash
chmod +x .githooks/pre-commit
```

**Step 4: Configure git to use .githooks**

```bash
git config core.hooksPath .githooks
```

**Step 5: Verify hook is configured**

```bash
git config core.hooksPath
```

Expected: Output shows `.githooks`

**Step 6: Commit**

```bash
git add .githooks/pre-commit
git commit -m "chore: add git pre-commit hook for formatting"
```

---

## Task 8: Format Existing Codebase

**Files:**
- Modify: All source files (via Prettier)

**Step 1: Run Prettier on all files**

```bash
bun run format
```

Expected: Prettier formats all files according to .prettierrc.json

**Step 2: Review changes**

```bash
git diff --stat
```

Expected: Shows modified files (formatting changes only, no logic changes)

**Step 3: Verify build still passes**

```bash
bun run build 2>&1 | tail -20
```

Expected: Build completes successfully

**Step 4: Commit formatted code**

```bash
git add .
git commit -m "chore: apply prettier formatting to codebase"
```

---

## Task 9: Verify Setup

**Files:**
- None (verification only)

**Step 1: Test format:check script**

```bash
bun run format:check
```

Expected: "All matched files use Prettier code style!"

**Step 2: Test lint script**

```bash
bun run lint
```

Expected: No errors (or only pre-existing warnings)

**Step 3: Test pre-commit hook**

Create a temporary test file:

```bash
echo 'const x={a:1,b:2}' > test-prettier.ts
git add test-prettier.ts
git commit -m "test: verify pre-commit hook"
```

Expected: Hook runs, formats the file, and commits successfully

**Step 4: Verify formatted file**

```bash
cat test-prettier.ts
```

Expected: File is properly formatted with Prettier style

**Step 5: Remove test file**

```bash
git rm test-prettier.ts
git commit -m "test: remove prettier test file"
```

**Step 6: Run full build**

```bash
bun run build
```

Expected: Build completes with no errors

**Step 7: Final verification**

```bash
echo "Setup complete. Verifying configuration..."
bun prettier --version
git config core.hooksPath
bun run format:check
```

Expected: All commands succeed

---

## Completion Checklist

After completing all tasks:

- [ ] Prettier 3.x installed and configured
- [ ] ts-reset installed with recommended rules
- [ ] ESLint integrated with Prettier (no conflicts)
- [ ] Package scripts added (format, format:check, prepare)
- [ ] VSCode configured for format-on-save
- [ ] Git pre-commit hook created and working
- [ ] Entire codebase formatted with Prettier
- [ ] Build passes with ts-reset types active
- [ ] All verification steps passed

---

## Post-Implementation Notes

**For future development:**
- Save files to auto-format (VSCode with Prettier extension)
- Pre-commit hook will format staged files automatically
- Run `bun run format` to format all files manually
- Run `bun run format:check` in CI to verify formatting

**If hook fails:**
- Check errors in terminal
- Fix linting issues manually
- Re-stage files and commit
- Use `git commit --no-verify` only for emergencies

**Rollback if needed:**
```bash
bun remove prettier @total-typescript/ts-reset eslint-config-prettier
rm .prettierrc.json .prettierignore src/types/ts-reset.d.ts .githooks/pre-commit
git config --unset core.hooksPath
```
