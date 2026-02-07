#!/bin/bash
# Linear Add Comment Script
# Usage: ./scripts/linear-comment.sh TSU-123 "Comment text"

set -e

# Load environment variables if not already set
if [ -z "$LINEAR_API_KEY" ]; then
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

if [ $# -ne 2 ]; then
  echo "Usage: $0 <issue-identifier> <comment-text>"
  echo "Example: $0 TSU-123 \"Completed implementation\""
  exit 1
fi

IDENTIFIER=$1
COMMENT_TEXT=$2

echo "Adding comment to $IDENTIFIER..."

# Get issue ID from identifier
ISSUE_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"query { issues(filter: { identifier: { eq: \\\"$IDENTIFIER\\\" } }) { nodes { id identifier title } } }\"}" \
  https://api.linear.app/graphql | python3 -c "import sys, json; data=json.load(sys.stdin); nodes=data['data']['issues']['nodes']; print(nodes[0]['id'] if nodes else '')")

if [ -z "$ISSUE_ID" ]; then
  echo "❌ Issue $IDENTIFIER not found"
  exit 1
fi

# Escape the comment text for JSON
ESCAPED_COMMENT=$(echo "$COMMENT_TEXT" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read().strip()))")

# Add comment
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"mutation { commentCreate(input: { issueId: \\\"$ISSUE_ID\\\", body: $ESCAPED_COMMENT }) { success comment { id body } } }\"}" \
  https://api.linear.app/graphql)

SUCCESS=$(echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['commentCreate']['success'])")

if [ "$SUCCESS" = "True" ]; then
  echo "✅ Comment added to $IDENTIFIER"
else
  echo "❌ Failed to add comment"
  echo "$RESULT" | python3 -m json.tool
  exit 1
fi
