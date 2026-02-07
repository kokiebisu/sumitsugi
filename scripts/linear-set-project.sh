#!/bin/bash
# Linear Project Assignment Script
# Assigns all project-less issues in the team to the default project (Development)
# Usage: ./scripts/linear-set-project.sh [PROJECT_NAME]
#   PROJECT_NAME defaults to "Development"

set -e

# Load environment variables if not already set
if [ -z "$LINEAR_API_KEY" ] || [ -z "$LINEAR_TEAM_ID" ]; then
  if [ -f .env.local ]; then
    source .env.local
  fi
fi

# Verify required environment variables
if [ -z "$LINEAR_API_KEY" ]; then
  echo "Error: LINEAR_API_KEY not set"
  exit 1
fi

if [ -z "$LINEAR_TEAM_ID" ]; then
  echo "Error: LINEAR_TEAM_ID not set"
  exit 1
fi

PROJECT_NAME="${1:-Development}"

# Get project ID by name
PROJECT_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"{ projects(filter: { name: { eq: \\\"$PROJECT_NAME\\\" } }) { nodes { id name } } }\"}" \
  https://api.linear.app/graphql | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data.get('data', {}).get('projects', {}).get('nodes', [])
print(nodes[0]['id'] if nodes else '')
")

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project '$PROJECT_NAME' not found"
  exit 1
fi

echo "Project: $PROJECT_NAME ($PROJECT_ID)"
echo ""

# Get all open issues without a project in the team
ISSUES=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"{ issues(filter: { team: { id: { eq: \\\"$LINEAR_TEAM_ID\\\" } }, project: { null: true }, state: { type: { nin: [\\\"completed\\\", \\\"canceled\\\"] } } }, first: 100) { nodes { id identifier title } } }\"}" \
  https://api.linear.app/graphql)

COUNT=$(echo "$ISSUES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data.get('data', {}).get('issues', {}).get('nodes', [])
print(len(nodes))
")

if [ "$COUNT" = "0" ]; then
  echo "All open issues already have a project assigned."
  exit 0
fi

echo "Found $COUNT issues without project. Assigning to '$PROJECT_NAME'..."
echo ""

# Assign each issue to the project
echo "$ISSUES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data.get('data', {}).get('issues', {}).get('nodes', [])
for n in nodes:
    print(f\"{n['id']}|{n['identifier']}|{n['title']}\")
" | while IFS='|' read -r ISSUE_ID IDENTIFIER TITLE; do
  RESULT=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\":\"mutation { issueUpdate(id: \\\"$ISSUE_ID\\\", input: { projectId: \\\"$PROJECT_ID\\\" }) { success } }\"}" \
    https://api.linear.app/graphql)

  SUCCESS=$(echo "$RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['issueUpdate']['success'])")

  if [ "$SUCCESS" = "True" ]; then
    echo "  ✅ $IDENTIFIER: $TITLE"
  else
    echo "  ❌ $IDENTIFIER: $TITLE (failed)"
  fi
done

echo ""
echo "Done!"
