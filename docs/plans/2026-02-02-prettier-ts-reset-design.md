# Prettier + ts-reset 導入設計書

**作成日:** 2026-02-02
**目的:** コード品質向上（フォーマット統一 + 型安全性強化）

---

## 概要

### 導入するツール

**Prettier v3.x**

- コードフォーマッターとして、すべてのJS/TS/TSX/CSS/JSON/MDファイルを自動整形
- 設定: セミコロンあり、シングルクォート、printWidth 80
- ESLintとの競合を避けるため `eslint-config-prettier` で統合

**@total-typescript/ts-reset**

- TypeScriptの型定義を改善するライブラリ
- 推奨セットを適用（`Array.includes`、`JSON.parse`、`fetch` APIなど）
- グローバル型定義として `src/types/ts-reset.d.ts` に配置

### アーキテクチャ方針

1. **レイヤー分離**: Prettier（フォーマット）とESLint（コード品質）を明確に分離
2. **自動化優先**: 開発者の手動操作を最小化（保存時フォーマット + コミット前チェック）
3. **段階的適用**: 既存コードへの影響を最小化するため、初回は全ファイルをフォーマット後コミット
4. **CI統合**: GitHub Actionsでフォーマットチェックを追加（後続フェーズ）

---

## パッケージとファイル構成

### インストールするパッケージ

**devDependencies:**

```json
{
  "prettier": "^3.2.5",
  "@total-typescript/ts-reset": "^0.6.1",
  "eslint-config-prettier": "^9.1.0",
  "lint-staged": "^15.2.0"
}
```

**huskyは使わない理由:**

- devcontainer環境での複雑さを避ける
- package.json の `prepare` スクリプトで代替実装

### ファイル構成

```
/workspaces/tsumugi/
├── .prettierrc.json          # Prettier設定
├── .prettierignore           # フォーマット除外
├── src/types/ts-reset.d.ts   # ts-reset型定義
├── .vscode/settings.json     # エディタ統合（更新）
├── eslint.config.mjs         # ESLint設定（更新）
└── package.json              # スクリプト追加
```

### 各ファイルの役割

- `.prettierrc.json`: フォーマットルール定義
- `.prettierignore`: node_modules、.next、ビルド成果物を除外
- `ts-reset.d.ts`: グローバル型改善のimport
- `.vscode/settings.json`: 保存時自動フォーマット設定
- `package.json`: `format`、`format:check`、`prepare` スクリプト追加

---

## 自動化設定（pre-commit、lint-staged）

### package.jsonスクリプト

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . && prettier --check .",
    "prepare": "git config core.hooksPath .githooks || true"
  }
}
```

### Git Hooks実装（huskyなし）

**`.githooks/pre-commit`** (実行可能ファイル):

```bash
#!/bin/bash
# Staged filesに対してPrettier + ESLintを実行

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json|css|md)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

echo "Running Prettier on staged files..."
echo "$STAGED_FILES" | xargs bun prettier --write

echo "Running ESLint on staged files..."
echo "$STAGED_FILES" | xargs bun eslint

# Re-stage formatted files
echo "$STAGED_FILES" | xargs git add

exit 0
```

### 動作フロー

1. `bun install` 時に `prepare` スクリプトが実行され、`.githooks` をGitフックディレクトリに設定
2. コミット時に `.githooks/pre-commit` が自動実行
3. ステージされたファイルのみフォーマット＆チェック
4. フォーマット後に自動再ステージ

---

## エディタ統合とワークフロー

### VSCode設定（.vscode/settings.json）

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 開発ワークフロー

**保存時:**

1. Prettierが自動フォーマット
2. ESLintが自動修正可能な問題を修正

**コミット時:**

1. pre-commitフックが起動
2. ステージされたファイルをPrettierでフォーマット
3. ESLintでチェック（エラーがあればコミット中断）

**CI/CD（将来）:**

- `bun run format:check` でフォーマット違反を検出
- `bun lint` でコード品質チェック

---

## マイグレーション計画

### 既存コードへの適用手順

**Phase 1: セットアップ（影響なし）**

1. パッケージインストール
2. 設定ファイル作成
3. Gitフック設定

**Phase 2: 既存コードのフォーマット（1回限り）**

1. `bun run format` で全ファイルを一括フォーマット
2. 差分を確認（機能変更なし、フォーマットのみ）
3. 単一コミット: `chore: apply prettier formatting`

**Phase 3: 型改善の確認**

1. ts-reset適用後、型エラーが出る箇所を確認
2. 必要に応じて型アノテーション追加
3. `bun run build` で型チェック

### リスク軽減策

- **大量の差分**: 全ファイルフォーマットは1コミットにまとめ、PRで明示
- **型エラー**: ts-resetは既存コードを破壊しない（型を厳格化するのみ）
- **フック失敗**: pre-commitでエラーが出たら `--no-verify` で一時回避可能

### ロールバック方法

問題が発生した場合:

1. パッケージアンインストール: `bun remove prettier @total-typescript/ts-reset eslint-config-prettier`
2. 設定ファイル削除: `.prettierrc.json`, `.prettierignore`, `src/types/ts-reset.d.ts`
3. Gitフック無効化: `git config --unset core.hooksPath`

---

## 実装チェックリスト

- [ ] パッケージインストール
- [ ] `.prettierrc.json` 作成
- [ ] `.prettierignore` 作成
- [ ] `src/types/ts-reset.d.ts` 作成
- [ ] `.githooks/pre-commit` 作成（実行権限付与）
- [ ] `.vscode/settings.json` 更新
- [ ] `eslint.config.mjs` 更新
- [ ] `package.json` スクリプト追加
- [ ] 全ファイルフォーマット実行
- [ ] ビルド確認
- [ ] コミット＆PR作成
