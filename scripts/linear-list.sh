#!/bin/bash
# Linear List Open Tasks Script
# Usage: ./scripts/linear-list.sh

set -e

# Load environment variables
if [ -f .env.local ]; then
  source .env.local
else
  echo "Error: .env.local not found"
  exit 1
fi

if [ -z "$LINEAR_API_KEY" ]; then
  echo "Error: LINEAR_API_KEY not set in .env.local"
  exit 1
fi

if [ -z "$LINEAR_TEAM_ID" ]; then
  echo "Error: LINEAR_TEAM_ID not set in .env.local"
  exit 1
fi

echo "Fetching open tasks from Linear..."
echo ""

# Get open issues
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"query { issues(filter: { team: { id: { eq: \\\"$LINEAR_TEAM_ID\\\" } }, state: { name: { nin: [\\\"Done\\\", \\\"Canceled\\\"] } } }, orderBy: updatedAt) { nodes { id identifier title state { name } assignee { name } createdAt updatedAt } } }\"}" \
  https://api.linear.app/graphql | python3 -c "
import sys, json
from datetime import datetime

data = json.load(sys.stdin)
issues = data['data']['issues']['nodes']

if not issues:
    print('No open tasks found.')
    sys.exit(0)

print(f'Open Tasks ({len(issues)}):')
print('')

for issue in issues:
    identifier = issue['identifier']
    title = issue['title']
    state = issue['state']['name']
    assignee_data = issue.get('assignee')
    assignee = assignee_data.get('name', 'Unassigned') if assignee_data else 'Unassigned'
    updated = issue['updatedAt']

    # Parse and format date
    dt = datetime.fromisoformat(updated.replace('Z', '+00:00'))
    date_str = dt.strftime('%Y-%m-%d')

    print(f'{identifier}: {title}')
    print(f'  State: {state} | Assignee: {assignee} | Updated: {date_str}')
    print('')
"

echo "Use ./scripts/linear-done.sh <identifier> to mark tasks as done"
