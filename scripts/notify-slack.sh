#!/usr/bin/env bash
# Sends a message to Slack via incoming webhook.
# Usage: ./scripts/notify-slack.sh "message text" ["optional emoji"] ["optional username"]
#
# Requires SLACK_WEBHOOK_URL environment variable.
# Silently exits if SLACK_WEBHOOK_URL is not set (graceful degradation).

set -euo pipefail

MESSAGE="${1:?Usage: notify-slack.sh \"message\"}"
EMOJI="${2:-:robot_face:}"
USERNAME="${3:-tsumugi-bot}"

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  echo "SLACK_WEBHOOK_URL not set, skipping Slack notification"
  exit 0
fi

# Escape message for JSON (handle newlines and quotes)
ESCAPED=$(echo "$MESSAGE" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')

curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"text\": ${ESCAPED}, \"icon_emoji\": \"${EMOJI}\", \"username\": \"${USERNAME}\"}" \
  > /dev/null

echo "Slack notification sent"
