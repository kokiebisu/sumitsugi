# GitHub Secrets セットアップガイド

## 必要なSecrets

tsumugiのGitHub Actionsワークフローで使用するSecrets：

| Secret名 | 使用ワークフロー | 必須 |
|----------|-----------------|------|
| `ANTHROPIC_API_KEY` | Requirements Audit, Daily Knowledge Update | ✅ 必須 |
| `LINEAR_API_KEY` | Linear統合（将来） | オプション |

---

## 1. GitHub Secretsの設定方法

### WebUI経由（推奨）

1. **リポジトリページを開く**
   ```
   https://github.com/[your-username]/tsumugi
   ```

2. **Settings タブをクリック**

3. **左サイドバーから「Secrets and variables」→「Actions」をクリック**

4. **「New repository secret」ボタンをクリック**

5. **Secretを追加:**
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** [あなたのAnthropic API Key]
   - **「Add secret」をクリック**

---

### GitHub CLI経由

```bash
# .env.localから環境変数を読み込む
source .env.local

# GitHub Secretsに設定
gh secret set ANTHROPIC_API_KEY --body "$ANTHROPIC_API_KEY"
```

**確認:**
```bash
gh secret list
```

**出力例:**
```
ANTHROPIC_API_KEY  Updated 2026-02-03
```

---

## 2. Anthropic API Keyの取得方法

### 新規取得

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. 「API Keys」セクションに移動
3. 「Create Key」をクリック
4. Key名を入力（例: `tsumugi-github-actions`）
5. Keyをコピー（**一度しか表示されません**）
6. GitHub Secretsに設定

### 既存のKeyを使用

`.env.local` に既にKeyがある場合：

```bash
# .env.localの内容を確認
cat .env.local | grep ANTHROPIC_API_KEY

# 出力例:
# ANTHROPIC_API_KEY=sk-ant-xxxxx

# そのKeyをGitHub Secretsに設定
source .env.local
gh secret set ANTHROPIC_API_KEY --body "$ANTHROPIC_API_KEY"
```

---

## 3. 設定後の確認

### ワークフローを手動実行

```bash
# Requirements Audit を手動実行
gh workflow run "Requirements Audit"

# 実行状況を確認
gh run list --limit 3
```

### ログを確認

```bash
# 最新のRequirements Audit実行ログ
gh run view --log

# または、WebUIで確認
# https://github.com/[your-username]/tsumugi/actions
```

**成功例:**
```
✅ Run Claude Audit
✅ Create tasks and PR
```

**失敗例（API Key未設定）:**
```
❌ Error: Invalid API key
```

---

## 4. トラブルシューティング

### エラー: "Invalid API key"

**原因:** GitHub Secretsに正しいAPI Keyが設定されていない

**解決策:**
1. Anthropic Consoleで新しいKeyを作成
2. GitHub Secretsに設定し直す
3. ワークフローを再実行

### エラー: "secret ANTHROPIC_API_KEY not found"

**原因:** Secret名が間違っている、または設定されていない

**解決策:**
```bash
# Secretsを確認
gh secret list

# ANTHROPICで始まるSecretがなければ設定
gh secret set ANTHROPIC_API_KEY --body "sk-ant-your-key-here"
```

### エラー: ".env.local: No such file or directory"

**原因:** GitHub Actions環境には `.env.local` が存在しない（正常）

**説明:** GitHub Actionsは `.env.local` を使いません。GitHub Secretsから環境変数を読み込みます。

**確認すべき箇所:**
- スクリプトが `process.env.ANTHROPIC_API_KEY` を使っているか
- ワークフローが `env: ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` を設定しているか

---

## 5. セキュリティのベストプラクティス

### ✅ DO

- GitHub Secretsを使用（暗号化される）
- API Keyは定期的にローテーション
- 最小権限のKeyを使用

### ❌ DON'T

- API Keyをコードにハードコード
- API Keyを`.env.local`にコミット
- API KeyをPRコメントに貼り付け

---

## 6. 参考資料

- [GitHub Actions - Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Anthropic API - Authentication](https://docs.anthropic.com/claude/reference/authentication)
- [gh CLI - secret](https://cli.github.com/manual/gh_secret)

---

**次のステップ:** API Keyを設定したら、ワークフローを手動実行して動作確認してください。
