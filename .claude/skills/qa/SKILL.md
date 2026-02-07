---
name: qa
description: Visual QA audit of UI pages. Takes Playwright screenshots and analyzes them against requirements. Use when you want to verify features are implemented correctly on the UI without manually checking.
---

# Visual QA Audit

Captures screenshots of all (or specific) pages via Playwright, then analyzes them against the project requirements to produce a QA report.

## Arguments

- `/qa` — Audit all pages
- `/qa S-003` — Audit a specific screen by ID
- `/qa home` or `/qa ホーム` — Audit by page name
- `/qa /listing` — Audit by route path

## Workflow

### Step 1: Capture Screenshots

Run the Playwright screenshot spec:

```bash
# All pages
bun run test:e2e -- tests/e2e/qa/qa-screenshots.spec.ts

# Specific screen (filter by screen ID or name)
bun run test:e2e -- tests/e2e/qa/qa-screenshots.spec.ts --grep "S-003"
```

This produces full-page screenshots in `tests/e2e/artifacts/qa/`.

If the command fails because Chromium is not installed, run `bun run test:e2e:install` first.

### Step 2: Read Requirements Context

Read these files for audit criteria:

- `docs/requirements/design-guidelines.md` — Colors, spacing, badge rules
- `docs/requirements/screens.md` — Screen definitions and required elements
- `docs/requirements/glossary.md` — Terminology definitions

For feature-specific audits, also read the relevant file from `docs/requirements/features/`.

### Step 3: Analyze Screenshots

Use the Read tool to view each screenshot PNG file from `tests/e2e/artifacts/qa/`. Claude can see images natively.

For each screenshot, evaluate against the **Audit Checklist** below.

### Step 4: Output QA Report

Output a structured report in this format:

```markdown
# QA Audit Report

**Date**: YYYY-MM-DD
**Pages Audited**: N
**Summary**: X PASS / Y WARN / Z FAIL

| Screen                 | Status | Issues                    |
| ---------------------- | ------ | ------------------------- |
| S-001 ホーム           | PASS   | —                         |
| S-003 物件詳細         | WARN   | Badge color slightly off  |
| S-101 リスティング一覧 | FAIL   | "セラー" found in UI text |

## Detailed Findings

### S-101 リスティング一覧 [FAIL]

**Screenshot**: tests/e2e/artifacts/qa/S-101-リスティング一覧.png

- **Terminology**: FAIL — Found "セラー" in sidebar. Should be "前の住人".
- **Layout**: PASS — Header, footer, grid layout present.
- **Colors**: PASS — Coral accent correctly applied.
- **Completeness**: PASS — Create button, listing cards visible.
```

## Audit Checklist

### 1. Terminology (CRITICAL)

Check that **no forbidden terms** appear in the visible UI text:

| Forbidden Term            | Correct Term |
| ------------------------- | ------------ |
| セラー                    | 前の住人     |
| バイヤー                  | 次の住人     |
| インテリア利用料          | 引越し費用   |
| セラー歴 / ホスティング歴 | 活動歴       |

Note: Internal code (`seller`, `isSeller`) is fine. Only UI-visible text matters.

### 2. Colors & Theme

- **Accent color**: Coral `#FF5A5F` used for CTAs, highlights
- **Overall theme**: Clean, Airbnb-inspired design
- **Text colors**: Primary `#484848`, secondary `#767676`
- **No garish or clashing colors**

### 3. Layout & Structure

- Header with tsumugi logo is present
- Navigation menu is accessible
- Footer is present (where applicable)
- Content is properly aligned (no overflow, no broken layouts)
- Responsive-looking (no horizontal scrollbar on desktop viewport)

### 4. Content Completeness

Check against the screen definition in `docs/requirements/screens.md`:

- **S-001 ホーム**: Area-based horizontal scroll sections, property cards
- **S-002 物件一覧**: Grid of property cards
- **S-003 物件詳細**: Photo gallery, property info, furniture list, seller profile, inquiry CTA
- **S-004 問い合わせ**: Inquiry form with fields
- **S-005 アカウント**: User info display
- **S-101 リスティング一覧**: List of seller's properties
- **S-102 物件新規登録**: Multi-step registration form

### 5. Design Components

- shadcn/ui components used (cards, buttons, dialogs, badges)
- Lucide React icons (not random emoji or other icon sets)
- Consistent spacing and typography
- Proper use of badges for property status

### 6. Badges & Status Indicators

- Landlord approval badge (✓ 大家承認済み) renders correctly where applicable
- Property status badges (draft/public) visible on seller screens
- Inquiry status indicators present on relevant screens

### 7. Page-Specific Checks

For **404/error pages**: Note if any screen from the registry returns a 404 — this means the page hasn't been implemented yet. Flag as "NOT IMPLEMENTED" rather than "FAIL".

For **auth-gated pages**: If a page redirects to login instead of showing content, the auth setup may have failed. Note this in the report.

## Screen Registry

| ID    | Name             | Route                    | Auth   |
| ----- | ---------------- | ------------------------ | ------ |
| S-001 | ホーム           | `/`                      | none   |
| S-002 | 物件一覧         | `/properties`            | none   |
| S-003 | 物件詳細         | `/listings/[id]`         | none   |
| S-004 | 問い合わせ       | `/listings/[id]/inquiry` | user   |
| S-005 | アカウント       | `/account`               | user   |
| S-006 | アカウント編集   | `/account/edit`          | user   |
| S-101 | リスティング一覧 | `/listing`               | seller |
| S-102 | 物件新規登録     | `/listing/new`           | seller |
| S-104 | 物件プレビュー   | `/listing/[id]/preview`  | seller |
| X-001 | ダッシュボード   | `/dashboard`             | user   |
| X-002 | 利用規約         | `/terms`                 | none   |
| X-003 | プライバシー     | `/privacy`               | none   |

## Tips

- When auditing a single page, provide **detailed** analysis with specific findings.
- When auditing all pages, provide a **summary table** first, then detailed findings only for WARN/FAIL pages.
- If a screenshot shows a loading spinner or blank page, the page may need more wait time. Note this as "INCONCLUSIVE" and suggest re-running.
- Compare viewport screenshots (above-the-fold) separately from full-page screenshots for layout assessment.
