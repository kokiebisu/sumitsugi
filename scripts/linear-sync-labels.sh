#!/bin/bash
# Linear Label Sync Script
# Syncs Beads issue labels to Linear issue labels.
#
# Usage:
#   ./scripts/linear-sync-labels.sh            # Sync all labels
#   ./scripts/linear-sync-labels.sh --dry-run   # Preview without changes
#
# Prerequisites:
#   - LINEAR_API_KEY in .env.local or environment
#   - bd (Beads CLI) installed
#   - python3 available

set -eo pipefail

DRY_RUN="false"
if [ "${1}" = "--dry-run" ]; then
  DRY_RUN="true"
fi

# Load environment variables if not already set
if [ -z "$LINEAR_API_KEY" ]; then
  if [ -f .env.local ]; then
    set -a && source .env.local && set +a
  fi
fi

if [ -z "$LINEAR_API_KEY" ]; then
  echo "Error: LINEAR_API_KEY not set"
  exit 1
fi

TEAM_ID="21f06272-3f96-46f2-836c-0d5dd726f931"

# Dump beads issues to temp file to avoid heredoc escaping issues
BEADS_TMP=$(mktemp)
bd list --json 2>/dev/null > "$BEADS_TMP"

export LINEAR_API_KEY TEAM_ID DRY_RUN BEADS_TMP

python3 << 'PYEOF'
import urllib.request, json, os, sys, re

api_key = os.environ['LINEAR_API_KEY']
team_id = os.environ['TEAM_ID']
dry_run = os.environ.get('DRY_RUN', 'false') == 'true'

if dry_run:
    print("[DRY RUN] Preview mode - no changes will be made")
    print("")

print("Syncing Beads labels → Linear labels...")
print("")

def graphql(query):
    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request("https://api.linear.app/graphql", data=data,
        headers={"Content-Type": "application/json", "Authorization": api_key})
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

# Step 1: Get existing Linear labels
result = graphql('query { issueLabels(first: 100) { nodes { id name } } }')
label_map = {}
for label in result["data"]["issueLabels"]["nodes"]:
    label_map[label["name"].lower()] = label["id"]

print(f"Existing Linear labels: {', '.join(sorted(label_map.keys()))}")
print("")

# Step 2: Read beads issues from temp file
beads_tmp = os.environ.get('BEADS_TMP', '/tmp/beads_issues.json')
# Find the temp file from parent script
import glob
# Read from the temp file passed via env
with open(beads_tmp) as f:
    beads_data = json.load(f)

issues = beads_data if isinstance(beads_data, list) else beads_data.get('issues', [])

# Step 3: Filter to issues with labels AND a Linear external_ref
sync_candidates = []
for issue in issues:
    labels = issue.get('labels', []) or []
    ext_ref = issue.get('external_ref', '') or ''
    if labels and 'linear.app' in ext_ref:
        match = re.search(r'(TSU-\d+)', ext_ref)
        if match:
            sync_candidates.append({
                'identifier': match.group(1),
                'title': issue.get('title', ''),
                'labels': [l.lower() for l in labels],
            })

if not sync_candidates:
    print("No issues with labels to sync.")
    sys.exit(0)

print(f"Found {len(sync_candidates)} issues with labels to sync")
print("")

# Step 4: Create missing labels in Linear
labels_needed = set()
for c in sync_candidates:
    for lbl in c['labels']:
        if lbl not in label_map:
            labels_needed.add(lbl)

if labels_needed:
    print(f"Creating {len(labels_needed)} new labels: {', '.join(sorted(labels_needed))}")
    for lbl in sorted(labels_needed):
        if dry_run:
            print(f"  [DRY RUN] Would create: {lbl}")
            label_map[lbl] = f"dry-run-{lbl}"
        else:
            safe_lbl = lbl.replace('\\', '\\\\').replace('"', '\\"')
            query = 'mutation { issueLabelCreate(input: { name: "%s", teamId: "%s" }) { success issueLabel { id name } } }' % (safe_lbl, team_id)
            result = graphql(query)
            created = result.get("data", {}).get("issueLabelCreate", {})
            if created.get("success"):
                new_id = created["issueLabel"]["id"]
                label_map[lbl] = new_id
                print(f"  Created: {lbl} ({new_id})")
            else:
                errs = result.get("errors", [])
                print(f"  Failed: {lbl} - {json.dumps(errs, ensure_ascii=False)}")
    print("")

# Step 5: Apply labels to each Linear issue
updated = 0
skipped = 0
failed = 0

for candidate in sync_candidates:
    identifier = candidate['identifier']
    beads_labels = candidate['labels']

    # Resolve to Linear label IDs
    label_ids = [label_map[lbl] for lbl in beads_labels if lbl in label_map]
    if not label_ids:
        skipped += 1
        continue

    # Get current issue state from Linear
    result = graphql('query { issue(id: "%s") { id labels { nodes { id name } } } }' % identifier)
    issue_data = result.get("data", {}).get("issue")
    if not issue_data:
        print(f"  ! {identifier}: Not found in Linear (skipped)")
        skipped += 1
        continue

    issue_id = issue_data["id"]
    existing_ids = {l["id"] for l in issue_data.get("labels", {}).get("nodes", [])}
    new_ids = set(label_ids)

    # Skip if all labels already present
    if new_ids.issubset(existing_ids):
        skipped += 1
        continue

    added_names = [lbl for lbl in beads_labels if label_map.get(lbl) and label_map[lbl] not in existing_ids]
    merged_ids = list(existing_ids | new_ids)

    if dry_run:
        print(f"  [DRY RUN] {identifier}: +{', '.join(added_names)} | {candidate['title'][:60]}")
        updated += 1
        continue

    # Update issue with merged label set
    ids_str = ', '.join(f'"{lid}"' for lid in merged_ids)
    query = 'mutation { issueUpdate(id: "%s", input: { labelIds: [%s] }) { success } }' % (issue_id, ids_str)
    result = graphql(query)

    if result.get("data", {}).get("issueUpdate", {}).get("success"):
        print(f"  + {identifier}: +{', '.join(added_names)} | {candidate['title'][:60]}")
        updated += 1
    else:
        print(f"  x {identifier}: Failed | {candidate['title'][:60]}")
        failed += 1

print("")
print(f"Done! Updated: {updated}, Skipped (already synced): {skipped}, Failed: {failed}")
PYEOF

# Clean up temp file
rm -f "$BEADS_TMP"
