# Worktree Skill

Create a new git worktree with devcontainer support for isolated feature development.

## When to Use

**AUTO-INVOKE** this skill as the FIRST action when the user requests:
- Feature implementations
- Bug fixes
- Refactoring tasks
- Code modifications
- UI/UX changes

**Skip this skill** only for:
- Single-line typo fixes
- Documentation-only changes
- Questions or research tasks

## What This Skill Does

1. Creates a new git worktree in an isolated directory
2. Sets up devcontainer symlink for consistent development environment
3. Provides the path for the user to open in VS Code

## Usage

The skill accepts a branch name as an argument:

```
worktree <branch-name>
```

If no branch name is provided, derive one from the task description:
- Feature tasks → `feature-<description>`
- Bug fixes → `fix-<description>`
- Refactoring → `refactor-<description>`

Example branch names:
- `feature-dark-mode`
- `fix-auth-bug`
- `refactor-api-endpoints`

## Instructions

When this skill is invoked:

1. **Determine the branch name:**
   - If user provided a name in their request, use it
   - Otherwise, derive from task: convert to lowercase, use hyphens, keep it short (2-4 words max)
   - Examples:
     - "Add dark mode toggle" → `feature-dark-mode`
     - "Fix login redirect bug" → `fix-login-redirect`
     - "Refactor auth system" → `refactor-auth-system`

2. **Create the worktree:**
   ```bash
   bash scripts/create-worktree.sh <branch-name>
   ```

3. **Inform the user:**
   Tell them the worktree was created and provide:
   - The branch name
   - The worktree path
   - Next steps: open in VS Code and reopen in container

4. **After worktree creation:**
   - Do NOT proceed with implementation yet
   - Wait for confirmation or next instruction
   - The user will open the worktree in a new container instance

## Example Invocation

```
User: "Add a logout button to the header"
Claude: *Invokes worktree skill*
  - Derives branch name: feature-logout-button
  - Runs: bash scripts/create-worktree.sh feature-logout-button
  - Informs user: "Created worktree at .worktrees/feature-logout-button. Open in VS Code and reopen in container to continue."
  - Waits for user to open the worktree before proceeding
```

## Notes

- This skill creates an isolated development environment for the task
- Each worktree has its own container instance with independent dependencies
- User must manually open the worktree in VS Code and reopen in container
- After user opens the worktree, they will give you the next instruction from that container
- Do NOT implement code in the main repository when this skill is used

