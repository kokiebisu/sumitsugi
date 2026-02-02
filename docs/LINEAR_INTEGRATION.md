# Linear MCP Integration

This document explains the Linear MCP (Model Context Protocol) server integration for tsumugi.

## Overview

The Linear MCP server provides Claude with direct access to Linear's API, enabling:
- Listing and querying issues
- Creating and updating issues
- Adding comments
- Managing workflow states
- Automatic task synchronization

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=21f06272-3f96-46f2-836c-0d5dd726f931
```

**Get your Linear API key:**
1. Go to Linear Settings → API
2. Create a new Personal API Key
3. Copy the key (starts with `lin_api_`)

**Get your team ID:**
```bash
source .env.local
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { teams { nodes { id name key } } }"}' \
  https://api.linear.app/graphql | python3 -m json.tool
```

### 2. Claude Code Configuration

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "plugin:linear:linear": {
      "url": "https://mcp.linear.app/mcp",
      "transport": "http",
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}",
        "LINEAR_TEAM_ID": "${LINEAR_TEAM_ID}"
      }
    }
  }
}
```

### 3. Verify Connection

After restarting Claude CLI, verify the connection:

```bash
# Check if MCP server is connected
# Look for: plugin:linear:linear: https://mcp.linear.app/mcp (HTTP) - ✓ Connected

# Test API connection
./scripts/linear-list.sh
```

## Helper Scripts

Three helper scripts are provided in `scripts/`:

### linear-list.sh

Lists all open tasks with details:

```bash
./scripts/linear-list.sh
```

Output:
```
Open Tasks (5):

TSU-75: ユーザー紹介プログラム設計
  State: Todo | Assignee: Unassigned | Updated: 2026-02-01

TSU-74: コンテンツマーケティング開始
  State: Todo | Assignee: Unassigned | Updated: 2026-02-01
...
```

### linear-done.sh

Marks one or more tasks as Done:

```bash
# Single task
./scripts/linear-done.sh TSU-123

# Multiple tasks
./scripts/linear-done.sh TSU-123 TSU-124 TSU-125
```

Output:
```
Done State ID: a044ed83-b069-454b-8243-7d9dc6912324

Processing TSU-123...
  ✅ TSU-123: Task title (Done)

Processing TSU-124...
  ✅ TSU-124: Another task (Done)
```

### linear-comment.sh

Adds a comment to a task:

```bash
./scripts/linear-comment.sh TSU-123 "Implementation completed successfully"
```

Output:
```
Adding comment to TSU-123...
✅ Comment added to TSU-123
```

## Usage Examples

### Task Completion Workflow

When completing a task:

```bash
# 1. Check open tasks
./scripts/linear-list.sh

# 2. Complete your work
# ... make changes, test, commit ...

# 3. Mark task as done
./scripts/linear-done.sh TSU-123

# 4. Add completion notes (optional)
./scripts/linear-comment.sh TSU-123 "✅ Implemented feature X
- Added component Y
- Updated tests
- Documentation updated"
```

### Meeting Follow-up

After a team meeting:

```bash
# Mark multiple decided tasks as done
./scripts/linear-done.sh TSU-71 TSU-72 TSU-73

# Add meeting notes
./scripts/linear-comment.sh TSU-71 "Approved in 2026-02-02 team meeting"
```

## Troubleshooting

### MCP Server Not Connected

**Symptoms:**
- `plugin:linear:linear` not shown in Claude CLI startup
- Helper scripts fail with authentication errors

**Solutions:**

1. Check environment variables:
   ```bash
   source .env.local
   echo $LINEAR_API_KEY
   echo $LINEAR_TEAM_ID
   ```

2. Verify `.claude/settings.json` has correct MCP configuration

3. Restart Claude CLI:
   ```bash
   # Exit current session (Ctrl+C)
   claude
   ```

4. Test Linear API directly:
   ```bash
   source .env.local
   curl -s -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: $LINEAR_API_KEY" \
     -d '{"query":"query { viewer { name email } }"}' \
     https://api.linear.app/graphql | python3 -m json.tool
   ```

### Script Permission Errors

```bash
chmod +x scripts/linear-*.sh
```

### Wrong Team ID

If you get "Issue not found" errors, verify your team ID:

```bash
source .env.local
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { teams { nodes { id name key } } }"}' \
  https://api.linear.app/graphql | python3 -m json.tool
```

## Direct API Usage (Advanced)

For custom operations, use the Linear GraphQL API directly:

```bash
source .env.local

# Query example
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { issues(first: 10, filter: { team: { id: { eq: \"'$LINEAR_TEAM_ID'\" } } }) { nodes { identifier title state { name } } } }"}' \
  https://api.linear.app/graphql | python3 -m json.tool

# Mutation example
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"mutation { issueUpdate(id: \"ISSUE_ID\", input: { stateId: \"STATE_ID\" }) { success } }"}' \
  https://api.linear.app/graphql | python3 -m json.tool
```

## References

- [Linear API Documentation](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [Linear MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/linear)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Integration Benefits

1. **Automatic Synchronization**: Claude can automatically update Linear when completing tasks
2. **Context Awareness**: Claude can see current task status and priorities
3. **Reduced Manual Work**: No need to manually update Linear UI
4. **Audit Trail**: All updates are logged with comments
5. **Consistency**: Ensures Linear always reflects current project state
