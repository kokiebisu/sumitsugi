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

Helper scripts are available in `scripts/` directory to simplify Linear integration.

### 1. List Open Tasks

```bash
./scripts/linear-list.sh
```

Shows all open tasks with their identifiers, states, and assignees.

### 2. Mark Tasks as Done

```bash
# Single task
./scripts/linear-done.sh TSU-123

# Multiple tasks
./scripts/linear-done.sh TSU-123 TSU-124 TSU-125
```

Automatically updates tasks to "Done" state.

### 3. Assign Project to Issues

```bash
# Assign all project-less open issues to Development (default)
./scripts/linear-set-project.sh

# Assign to a specific project
./scripts/linear-set-project.sh Business
```

**CRITICAL: After `bd linear sync --push`, ALWAYS run `./scripts/linear-set-project.sh` to ensure new issues are assigned to the Development project.**

### 4. Add Comments to Tasks

```bash
./scripts/linear-comment.sh TSU-123 "Implementation completed successfully"
```

Adds a comment to the specified task.

---

## Beads → Linear 同期ワークフロー (CRITICAL)

Beadsでタスクを作成・更新した後は、必ずLinearに同期し、プロジェクトを紐づけること。

```bash
# 1. Beadsの変更をLinearにpush
bd linear sync --push --create-only

# 2. 新規issueにDevelopmentプロジェクトを紐づけ（必須）
./scripts/linear-set-project.sh
```

**この2ステップは常にセットで実行すること。** `linear-set-project.sh` を忘れるとLinear上でプロジェクト未設定のissueが残る。

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
# 1. オープンタスクを確認
./scripts/linear-list.sh

# 2. 完了したタスクをDoneに更新
./scripts/linear-done.sh TSU-123 TSU-124

# 3. 必要に応じてコメントを追加
./scripts/linear-comment.sh TSU-123 "チーム会議で決定・承認済み"

# 4. DASHBOARDを更新
# 5. ユーザーに報告
```

---

## よくある質問

### Q1: Linearが更新されない場合は？

A: 以下を確認：

1. `.env.local` に `LINEAR_API_KEY` と `LINEAR_TEAM_ID` が設定されているか
2. スクリプトに実行権限があるか (`chmod +x scripts/linear-*.sh`)
3. タスク識別子が正しいか (例: `TSU-123`)
4. ネットワーク接続が正常か

### Q2: 複数のタスクを一度に更新できるか？

A: 可能。`./scripts/linear-done.sh TSU-123 TSU-124 TSU-125` のように複数指定できる。

### Q3: タスク識別子(identifier)はどこで確認できるか？

A: Linear UI で issue を開き、URL の最後の部分（例: `TSU-123`）。
または、`./scripts/linear-list.sh` で確認。

### Q4: Helper scriptsがない場合は？

A: プロジェクトルートから以下を実行：

```bash
ls -la scripts/linear-*.sh
```

存在しない場合は、Linear MCP統合のセットアップが必要。

---

## 重要事項

**毎回手動で更新する必要はありません。タスク完了時に自動的にLinearを更新するワークフローに従ってください。**

ユーザーから「Linearも更新して」と言われなくても、タスク完了時は必ずLinearを更新すること。
