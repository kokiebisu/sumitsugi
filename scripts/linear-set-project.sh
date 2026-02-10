#!/bin/bash
# Linear Project Assignment Script
# Assigns project-less issues to the correct Linear project based on Beads labels.
#
# Routing logic:
#   - Issues with business/marketing/legal/finance/sales/manual-setup labels → Business
#   - Everything else → Development
#
# Usage: ./scripts/linear-set-project.sh

set -eo pipefail

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

# Project IDs (from env vars, with legacy fallback)
DEV_PROJ="${LINEAR_DEV_PROJECT_ID:-4e451a29-6654-483d-be78-8057ca95e134}"
BIZ_PROJ="${LINEAR_BIZ_PROJECT_ID:-ab0431bb-ab03-4381-ae67-139c98b0f922}"

# Business label patterns (if a Beads issue has any of these labels, it goes to Business)
BUSINESS_LABELS="business|marketing|legal|finance|sales|manual-setup|partnership|branding|hiring|operations"

echo "Checking for Linear issues without a project..."
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
  echo "All open issues already have a project assigned. ✅"
  exit 0
fi

echo "Found $COUNT issues without project. Routing..."
echo ""

DEV_COUNT=0
BIZ_COUNT=0

# For each unassigned Linear issue, check Beads labels to determine project
echo "$ISSUES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data.get('data', {}).get('issues', {}).get('nodes', [])
for n in nodes:
    print(f\"{n['id']}|{n['identifier']}|{n['title']}\")
" | while IFS='|' read -r ISSUE_ID IDENTIFIER TITLE; do
  # Try to find Beads issue by external ref (Linear identifier)
  BEADS_LABELS=$(bd show "$IDENTIFIER" --json 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list) and len(data) > 0:
        labels = data[0].get('labels', [])
    elif isinstance(data, dict):
        labels = data.get('labels', [])
    else:
        labels = []
    print(','.join(labels) if labels else '')
except: print('')
" 2>/dev/null || echo "")

  # Also try by searching beads for the linear external ref
  if [ -z "$BEADS_LABELS" ]; then
    # Search beads by title keywords (fallback)
    BEADS_LABELS=""
  fi

  # Determine project based on labels
  IS_BUSINESS=false
  if [ -n "$BEADS_LABELS" ]; then
    if echo "$BEADS_LABELS" | grep -qEi "$BUSINESS_LABELS"; then
      IS_BUSINESS=true
    fi
  fi

  # Also check title keywords as fallback heuristic
  if [ "$IS_BUSINESS" = "false" ]; then
    if echo "$TITLE" | grep -qEi "ヒアリング|タグライン|予算|法律|法務|規約|管理会社.*リスト|パートナー|マーケティング|Twitter|投稿|メールアドレスを作成|提案資料|振り返り|Stripe.*申請|書類.*準備|予約.*相談|参加する|イベント|Venture|Cafe|Gathering|カンファレンス|セミナー|ミートアップ|告知|成功事例|フォローアップ|清掃費|物件登録目標|紹介プログラム|コンテンツマーケ|CAC|LTV|内覧.*調整|フィードバック収集|不動産関係者|引き継ぎ契約|エスクロー|オーナー説明|仲介会社|紹介フィー|オペレーション自動化"; then
      IS_BUSINESS=true
    fi
  fi

  if [ "$IS_BUSINESS" = "true" ]; then
    TARGET_PROJ="$BIZ_PROJ"
    PROJECT_LABEL="Business"
  else
    TARGET_PROJ="$DEV_PROJ"
    PROJECT_LABEL="Development"
  fi

  RESULT=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\":\"mutation { issueUpdate(id: \\\"$ISSUE_ID\\\", input: { projectId: \\\"$TARGET_PROJ\\\" }) { success } }\"}" \
    https://api.linear.app/graphql)

  SUCCESS=$(echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('issueUpdate', {}).get('success', False))")

  if [ "$SUCCESS" = "True" ]; then
    echo "  ✅ $IDENTIFIER → $PROJECT_LABEL: $TITLE"
  else
    echo "  ❌ $IDENTIFIER: $TITLE (failed)"
  fi
done

echo ""
echo "Done!"
