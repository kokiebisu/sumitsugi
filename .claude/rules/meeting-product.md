# Product Meeting Rules

## Default Workflow

When using `/meeting:product` skill, follow this workflow:

### 1. Discussion & Decision Making
- Discuss product features, UX, and technical tradeoffs
- Make decisions with PM and CTO perspectives
- Document key decisions and rationale

### 2. Update REQUIREMENTS.md
- Update `docs/REQUIREMENTS.md` if specifications change
- Add new features or modify existing specifications
- Keep requirements in sync with decisions

### 3. Create Beads Tasks
- Break down decided features into granular Beads tasks
- Use `bd create` for each task with clear descriptions
- Sync tasks to Linear using the API script

### 4. DO NOT Implement
- **Product meetings should NOT include implementation**
- Stop after creating tasks
- Implementation happens separately in dedicated development sessions

## Task Creation Template (CRITICAL)

**ALWAYS include concrete descriptions with `--description` flag. Never create tasks with title only.**

When creating Beads tasks from product decisions:

```bash
bd create "Specific, actionable task title" --description "Concrete description with:
- Exact file paths to modify (e.g., src/app/listing/[id]/edit/page.tsx)
- Specific changes to make (e.g., Add checkbox field for landlordConsent)
- Context: Why this is needed (from meeting discussion)
- Acceptance criteria: What 'done' looks like
- Dependencies: Blocked by or blocks other tasks (if any)"
```

### Good Example

```bash
bd create "編集ページに大家承認チェックボックスを追加" --description "src/app/listing/[id]/edit/page.tsx に大家承認のチェックボックスフィールドを追加。任意項目とし、事前承認のメリットを説明するテキストも含める。チェック状態は landlordConsent state で管理し、handleSave 時に updateListing に渡す。"
```

### Bad Example

```bash
# BAD: No description, vague title
bd create "大家承認機能"

# BAD: Title only, no concrete details
bd create "Add landlord consent feature"
```

## Linear Sync

After creating Beads tasks, sync to Linear:

```bash
# Use the create-linear-tasks script pattern
# Include Beads ID in Linear description for traceability
```

## Summary Output

At the end of product meeting, provide:

1. **Decisions Made**: List of key product decisions
2. **REQUIREMENTS.md Changes**: Summary of updates made
3. **Tasks Created**: List of Beads tasks with IDs
4. **Linear Issues**: List of Linear issue identifiers (TSU-XXX)

## Example Output

```
## Product Meeting Summary

### Decisions Made
- Remove confirmation page (/listing/[id]/confirm)
- Add landlord consent as optional field in edit page
- Show banner on seller dashboard to encourage landlord consent

### REQUIREMENTS.md Updates
- Updated listing flow section
- Removed confirmation page from user journey
- Added landlord consent optional workflow

### Tasks Created (Beads)
- tsumugi-90d: Add landlord consent checkbox to edit page
- tsumugi-x6f: Add banner to seller dashboard
- tsumugi-adc: Remove confirmation page

### Tasks Created (Linear)
- TSU-77: Add landlord consent checkbox to edit page
- TSU-78: Add banner to seller dashboard
- TSU-79: Remove confirmation page

### Next Steps
Implementation tasks are ready. Development session can start separately.
```
