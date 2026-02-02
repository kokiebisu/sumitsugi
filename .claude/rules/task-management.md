# Task Management

## Linear Integration (CRITICAL)

**ALWAYS update Linear when completing tasks.**

### When to Update Linear

**タスク完了時（必須）:**
- チーム会議でタスクを完了した時
- 実装・開発タスクを完了した時
- ドキュメントを作成・更新した時
- 意思決定が完了した時

**更新しない場合:**
- 軽微な修正（typo、コメント追加）
- 探索的な作業（調査、リサーチ）
- ユーザーとの会話のみ

---

## Linear Update Workflow

### 1. 環境変数の読み込み

```bash
source .env.local
```

`LINEAR_API_KEY` が `.env.local` に設定されている必要があります。

### 2. 完了したタスクをDoneに更新

```bash
# スクリプトを作成
cat > /tmp/update_linear.sh << 'EOF'
#!/bin/bash
source .env.local

# Get Done state ID
DONE_STATE_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { workflowStates { nodes { id name } } }"}' \
  https://api.linear.app/graphql | jq -r '.data.workflowStates.nodes[] | select(.name == "Done") | .id' | head -1)

# 完了したタスクのID（複数可）
TASKS=(
  "TASK_ID_1"
  "TASK_ID_2"
)

for TASK_ID in "${TASKS[@]}"; do
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\":\"mutation { issueUpdate(id: \\\"$TASK_ID\\\", input: { stateId: \\\"$DONE_STATE_ID\\\" }) { success issue { title state { name } } } }\"}" \
    https://api.linear.app/graphql | jq -r '.data.issueUpdate | "\(.success) - \(.issue.title) (\(.issue.state.name))"'
done
EOF

chmod +x /tmp/update_linear.sh && /tmp/update_linear.sh
```

### 3. タスクにコメントを追加

進捗や決定事項をコメントとして追加：

```bash
cat > /tmp/add_comment.sh << 'EOF'
#!/bin/bash
source .env.local

TASK_ID="YOUR_TASK_ID"
COMMENT="コメント内容"

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"mutation { commentCreate(input: { issueId: \\\"$TASK_ID\\\", body: \\\"$COMMENT\\\" }) { success } }\"}" \
  https://api.linear.app/graphql | jq -r '.data.commentCreate.success'
EOF

chmod +x /tmp/add_comment.sh && /tmp/add_comment.sh
```

---

## Task ID の取得方法

### オープンタスクの一覧を取得

```bash
cat > /tmp/linear_query.sh << 'EOF'
#!/bin/bash
source .env.local

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { issues(filter: { state: { name: { nin: [\"Done\", \"Canceled\"] } } }) { nodes { id title state { name } } } }"}' \
  https://api.linear.app/graphql
EOF

chmod +x /tmp/linear_query.sh && /tmp/linear_query.sh | jq -r '.data.issues.nodes[] | "\(.id) - \(.title) (\(.state.name))"'
```

---

## チェックリスト

タスク完了時：

- [ ] タスクを完了
- [ ] DASHBOARDを更新
- [ ] **LinearでタスクをDoneに更新**
- [ ] 必要に応じてコメントを追加
- [ ] ユーザーに報告

---

## 例: チーム会議でタスクを完了した場合

```bash
# 1. 環境変数を読み込み
source .env.local

# 2. オープンタスクを確認
cat > /tmp/linear_query.sh << 'EOF'
#!/bin/bash
source .env.local
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { issues(filter: { state: { name: { nin: [\"Done\", \"Canceled\"] } } }) { nodes { id title state { name } } } }"}' \
  https://api.linear.app/graphql
EOF
chmod +x /tmp/linear_query.sh && /tmp/linear_query.sh | jq -r '.data.issues.nodes[] | "\(.id) - \(.title)"'

# 3. 完了したタスクをDoneに更新
cat > /tmp/update_linear.sh << 'EOF'
#!/bin/bash
source .env.local
DONE_STATE_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { workflowStates { nodes { id name } } }"}' \
  https://api.linear.app/graphql | jq -r '.data.workflowStates.nodes[] | select(.name == "Done") | .id' | head -1)

TASKS=(
  "TASK_ID_1"
  "TASK_ID_2"
)

for TASK_ID in "${TASKS[@]}"; do
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\":\"mutation { issueUpdate(id: \\\"$TASK_ID\\\", input: { stateId: \\\"$DONE_STATE_ID\\\" }) { success issue { title state { name } } } }\"}" \
    https://api.linear.app/graphql | jq -r '.data.issueUpdate | "\(.success) - \(.issue.title) (\(.issue.state.name))"'
done
EOF
chmod +x /tmp/update_linear.sh && /tmp/update_linear.sh

# 4. DASHBOARDを更新
# 5. ユーザーに報告
```

---

## よくある質問

### Q1: Linearが更新されない場合は？

A: 以下を確認：
1. `.env.local` に `LINEAR_API_KEY` が設定されているか
2. `source .env.local` を実行したか
3. タスクIDが正しいか
4. ネットワーク接続が正常か

### Q2: 複数のタスクを一度に更新できるか？

A: 可能。`TASKS=()` 配列に複数のタスクIDを追加すればOK。

### Q3: タスクIDはどこで確認できるか？

A: Linear UI で issue を開き、URL の最後の部分（例: `TSU-123`）。
   または、上記の「オープンタスクの一覧を取得」スクリプトで確認。

---

## 重要事項

**毎回手動で更新する必要はありません。タスク完了時に自動的にLinearを更新するワークフローに従ってください。**

ユーザーから「Linearも更新して」と言われなくても、タスク完了時は必ずLinearを更新すること。
