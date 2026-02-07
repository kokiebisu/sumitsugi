#!/bin/bash
# Linear Task Completion Script
# Usage: ./scripts/linear-done.sh TSU-123 [TSU-124 ...]

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
  echo "Set it as environment variable or add to .env.local"
  exit 1
fi

if [ -z "$LINEAR_TEAM_ID" ]; then
  echo "Error: LINEAR_TEAM_ID not set"
  echo "Set it as environment variable or add to .env.local"
  exit 1
fi

if [ $# -eq 0 ]; then
  echo "Usage: $0 TSU-123 [TSU-124 ...]"
  echo "Example: $0 TSU-123 TSU-124"
  exit 1
fi

# Get Done state ID
DONE_STATE_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"query { workflowStates(filter: { team: { id: { eq: \\\"$LINEAR_TEAM_ID\\\" } } }) { nodes { id name type } } }\"}" \
  https://api.linear.app/graphql | python3 -c "import sys, json; data=json.load(sys.stdin); states=[s for s in data['data']['workflowStates']['nodes'] if s['name']=='Done']; print(states[0]['id'] if states else '')")

if [ -z "$DONE_STATE_ID" ]; then
  echo "Error: Could not get Done state ID"
  exit 1
fi

echo "Done State ID: $DONE_STATE_ID"
echo ""

# Process each issue identifier
for IDENTIFIER in "$@"; do
  echo "Processing $IDENTIFIER..."

  # Get issue ID from identifier (using issue() query which accepts TSU-XXX format)
  ISSUE_ID=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\":\"query { issue(id: \\\"$IDENTIFIER\\\") { id identifier title state { name } } }\"}" \
    https://api.linear.app/graphql | python3 -c "import sys, json; data=json.load(sys.stdin); issue=data.get('data',{}).get('issue'); print(issue['id'] if issue else '')")

  if [ -z "$ISSUE_ID" ]; then
    echo "  ❌ Issue $IDENTIFIER not found"
    continue
  fi

  # Update state to Done
  RESULT=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\":\"mutation { issueUpdate(id: \\\"$ISSUE_ID\\\", input: { stateId: \\\"$DONE_STATE_ID\\\" }) { success issue { identifier title state { name } } } }\"}" \
    https://api.linear.app/graphql)

  SUCCESS=$(echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['issueUpdate']['success'])")
  TITLE=$(echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['issueUpdate']['issue']['title'])")
  STATE=$(echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['issueUpdate']['issue']['state']['name'])")

  if [ "$SUCCESS" = "True" ]; then
    echo "  ✅ $IDENTIFIER: $TITLE ($STATE)"
  else
    echo "  ❌ Failed to update $IDENTIFIER"
  fi
  echo ""
done

echo "Done!"
