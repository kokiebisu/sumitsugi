# Linear MCP Integration Design

**Date:** 2026-02-02
**Status:** Approved
**Author:** Claude (brainstorming session)

## Overview

This design document outlines the integration of Linear's official MCP (Model Context Protocol) server into the tsumugi project. The goal is to achieve full automation, feature expansion, and improved developer experience for Linear task management.

## Background

### Current State

- Manual bash scripts calling Linear GraphQL API directly
- Scripts located in `.claude/rules/task-management.md`
- Requires manual execution of curl commands
- Linear API Key stored in `.env.local`

### Pain Points

- Manual script execution required for every task update
- Verbose curl commands with heredocs
- No seamless integration with Claude conversations
- Difficult to maintain and extend

### Goals

1. **Automation**: Claude automatically updates Linear during conversations
2. **Feature Expansion**: Support wider range of Linear operations
3. **Developer Experience**: Eliminate bash script maintenance burden

## Architecture

### Overview

Linear official MCP server (`https://mcp.linear.app/mcp`) configured as a remote MCP server. Claude directly interacts with Linear API through the MCP protocol.

### Authentication Flow

- Use existing `LINEAR_API_KEY` from `.env.local`
- Pass as `Authorization: Bearer` header to MCP server
- Environment variable reference (no hardcoding)

### Configuration File

Add MCP server configuration to project-local `.claude/settings.json`. Coexists with existing `enabledPlugins`.

### Migration Strategy

Keep existing bash scripts as fallback/debug tools while prioritizing MCP tools. This allows reverting to manual scripts if issues occur.

## Configuration Details

### File Structure

`.claude/settings.json`:

```json
{
  "enabledPlugins": {
    // Existing plugin configuration (unchanged)
  },
  "mcpServers": {
    "linear": {
      "url": "https://mcp.linear.app/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer ${LINEAR_API_KEY}"
      }
    }
  }
}
```

### Key Points

**Transport**: `sse` (Server-Sent Events) - follows remote MCP specification

**Environment Variable**: `${LINEAR_API_KEY}` automatically loaded from `.env.local` by Claude Code CLI

**Server Name**: `linear` - MCP tool calls will use `mcp__linear__*` format

**Compatibility**: No conflicts with existing plugins (Serena, Superpowers, etc.)

## Available Features

### Issue Management

- **Create**: New issues with title, description, team, assignee, priority, labels
- **Search**: Text search, status filters (Open/Done/Canceled)
- **Update**: Change status, assignee, priority, etc.
- **Retrieve**: Get all details for specific issues

### Team Management

- **List**: All teams in workspace (ID, name, key, description)
- **Filter**: By team ID

### Project Management

- **List**: All projects
- **Details**: Name, description, state

### Comments

- **Add**: Record progress reports and decisions on issues

### Composite Workflows

Example: "Update TSU-123 to Done and add comment 'Implementation complete'" - completed in a single conversation with Claude.

## Migration Plan

### Phase 1: MCP Introduction (Immediate)

- Add MCP server configuration to `.claude/settings.json`
- Verify functionality (simple issue search test)

### Phase 2: Parallel Operation (Transition Period)

- Prioritize MCP tools
- Keep bash scripts as fallback/debug tools
- Can revert to manual scripts if issues occur

### Phase 3: Documentation Update (After Verification)

- Update `.claude/rules/task-management.md`
- Add MCP usage examples
- Move existing scripts to "Troubleshooting" section

### Asset Reuse

**`.env.local`**: Use as-is (no changes needed)

**`LINEAR_TEAM_ID`**: Reference as needed during MCP operations

**Checklist**: Simplify from "Update Linear task to Done" to "Update Linear task" (MCP handles automation)

### Risk Management

If MCP server encounters issues, manual bash scripts remain available for operations.

## Implementation Steps

### Step 1: Update Configuration File

Add `mcpServers` section to `.claude/settings.json`. Integrate with existing `enabledPlugins`.

### Step 2: Functional Testing

Test in this order:

1. MCP server connection verification (`ListMcpResourcesTool`)
2. Simple Linear operation (e.g., list open tasks)
3. Composite workflow (e.g., search → update → comment)

### Step 3: Documentation Update

After successful testing, update `.claude/rules/task-management.md`:

- Add MCP usage examples
- Move existing scripts to troubleshooting section
- Simplify checklist

### Step 4: Production Use

Start using MCP-based workflow from next task completion.

## Success Criteria

- Linear operations completed through Claude conversations
- Manual script execution no longer required
- Composite workflows (search → update → comment) complete with single instruction

## References

- [Linear MCP Documentation](https://linear.app/docs/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- Current implementation: `.claude/rules/task-management.md`

## Decisions

| Decision                    | Rationale                                   |
| --------------------------- | ------------------------------------------- |
| Use official Linear MCP     | Most reliable, maintained by Linear team    |
| API Key authentication      | Reuse existing key, no additional auth flow |
| Project-local configuration | Keep Linear integration specific to tsumugi |
| Keep existing scripts       | Safety net during transition                |

## Next Steps

1. Implement configuration changes
2. Run functional tests
3. Update documentation
4. Begin production use
