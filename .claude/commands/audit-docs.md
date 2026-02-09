# Audit Documentation Consistency

Perform a comprehensive audit of all documents under `docs/` (plus `.claude/PROJECT.md`, `.claude/BUSINESS.md`, and `CLAUDE.md`) to identify discrepancies, stale information, and sync issues.

## Audit Steps

### 1. Broken Internal Links

Scan all markdown files under `docs/` for relative links (`[text](./path)`, `[text](../path)`, `[text](#anchor)`).
For each link:

- Verify the target file exists
- Verify anchor targets exist (heading IDs)
- Report broken links with file:line location

### 2. README Index vs Actual Files

Compare `docs/requirements/README.md` document table and feature file table against actual files in `docs/requirements/` and `docs/requirements/features/`.

- Report files listed in README but missing from disk
- Report files on disk but not listed in README
- Verify Feature ID ranges match between README table and feature files

### 3. Terminology Consistency

Per `docs/requirements/glossary.md` and CLAUDE.md guidelines:

- UI-facing docs should use **前の住人** (not セラー), **次の住人**, **引越し費用** (not インテリア利用料), **活動歴** (not セラー歴/ホスティング歴)
- Scan all docs (excluding code files, data-model field definitions, and BUSINESS.md internal terminology section) for incorrect UI terminology
- Report each violation with file:line and suggested fix

### 4. Scope ↔ Features Alignment

Compare `docs/requirements/scope.md` MVP features against what's documented in `docs/requirements/features/*.md`:

- Features mentioned in scope.md MVP but not detailed in any features/ file
- Feature IDs referenced in scope.md that don't exist in feature files
- Feature files that have no corresponding mention in scope.md

### 5. Data Model ↔ Code Types Sync

Compare `docs/requirements/data-model.md` type definitions against actual TypeScript types in `src/lib/data.ts` (and any Drizzle schema files):

- Fields in data-model.md missing from code
- Fields in code missing from data-model.md
- Type mismatches between doc and code
- Report as informational (some gaps are expected for unimplemented features)

### 6. Meeting Decisions Integration

Check recent meeting files in `docs/requirements/meetings/` and `docs/design/meetings/`:

- For each meeting, identify key decisions (lines with 決定, 合意, 確定, 変更, 追加, 削除, 移動)
- Verify these decisions are referenced in the relevant `docs/requirements/` files (look for meeting links like `座談会#N`)
- Report meetings whose decisions appear unreflected in requirements docs

### 7. Cross-Document Version & Date Consistency

Check for stale metadata:

- `.claude/BUSINESS.md` references "REQUIREMENTS.md v1.9" — verify this is current
- Compare `最終更新日` across related documents for staleness
- Flag documents with dates significantly older than related docs

### 8. Design Docs ↔ Requirements Sync

Compare `docs/design/` technical decisions against `docs/requirements/`:

- Technology decisions (T-1 through T-8) should align with requirement feature IDs
- Post-MVP decisions in design docs should match scope.md Phase 1 Post-MVP
- Implementation status in design docs should reflect current code state

### 9. Duplicate or Conflicting Information

Check for the same concept described differently:

- Payment/pricing described in scope.md vs payment.md vs BUSINESS.md vs design/payment-implementation.md
- User roles described in users.md vs glossary.md vs BUSINESS.md
- Status types described in data-model.md vs BUSINESS.md vs CLAUDE.md
- Flag any conflicts (different numbers, different flows, different terminology)

### 10. Open Items Staleness

Review `docs/requirements/open-items.md`:

- Check if any open items have been resolved by meeting decisions or implementations
- Cross-reference against meeting decisions and code
- Report items that appear resolved but still listed as open

## Output Format

Present results as a structured report:

```
## Documentation Audit Report — {date}

### Critical Issues (must fix)
- Broken links, factual conflicts, outdated information

### Warnings (should fix)
- Terminology violations, missing cross-references, stale dates

### Informational (nice to fix)
- Data model gaps for unimplemented features, minor inconsistencies

### Summary
- Total files scanned: N
- Critical: N | Warnings: N | Info: N
```

For each issue, provide:

- **File**: path to the file
- **Line**: line number (if applicable)
- **Issue**: description of the problem
- **Suggestion**: how to fix it

## Important Notes

- Do NOT automatically fix issues. Only report them.
- Focus on actionable discrepancies, not cosmetic differences.
- Distinguish between "intentionally different" (e.g., internal vs UI terms in appropriate contexts) and "accidentally inconsistent."
- Use parallel agents to speed up the audit where possible (e.g., link checking, terminology scanning, and data model comparison can run concurrently).
