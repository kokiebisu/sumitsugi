# Devcontainer 設計

> `./dev` スクリプトによるdevcontainerアクセスとClaude Code自動起動

---

## 1. `./dev` シェルスクリプト

**目的:** ターミナルから `./dev` で devcontainer に即座にアクセスする

**作成日:** 2026-02-02

### コア機能

1. devcontainer CLI (`@devcontainers/cli`) のインストール確認・自動インストール
2. devcontainer の起動確認・自動起動 (`devcontainer up`)
3. インタラクティブ bash シェルの起動 (`devcontainer exec`)

### スマート検出

- devcontainer 内で実行された場合は "Already in devcontainer!" で終了
- `REMOTE_CONTAINERS` / `CODESPACES` 環境変数で判定

### 基本使用法

```bash
./dev              # コンテナ起動（必要時） + シェルアクセス
```

### エラーハンドリング

- CLI未インストール → 自動インストール提案 (y/n)
- コンテナ起動失敗 → エラー出力表示
- コンテナは終了後も維持（再入室が高速）

---

## 2. Claude Code 自動起動

**目的:** devcontainer 入室時に Claude Code を自動起動

**依存:** `./dev` スクリプト (上記)

### ユーザーワークフロー

```bash
# ホストマシン
./dev

# → devcontainer起動
# → Claude Code 自動起動
# → ユーザーが Claude で作業
# → /exit or Ctrl+D で Claude 終了
# → bash プロンプトに戻る（手動作業可能）
```

### 実装方式

```bash
# devcontainer exec 部分を変更
devcontainer exec --workspace-folder . bash -c "claude; exec bash"
```

- `claude` → Claude Code をインタラクティブモードで起動
- `;` → 前のコマンド完了後に次を実行
- `exec bash` → 新しい bash セッションに置換（ネストなし）

### 設計判断

| 判断事項       | 選択                 | 理由                                         |
| -------------- | -------------------- | -------------------------------------------- |
| 起動モード     | 常に自動起動         | 主要開発ツールなのでデフォルトON             |
| Worktree対応   | 非対応（mainで起動） | シンプル。ユーザーがClaude経由でworktree作成 |
| 複数ターミナル | 各自独立セッション   | タスク並行実行に最適                         |

### エラーハンドリング

- Claude 未インストール → "command not found" → bash へフォールバック
- Claude クラッシュ → bash へフォールバック
- ユーザーは常にシェルを得られる

### トレードオフ

**メリット:** 即座にClaude利用可能、反復タイピング削減
**デメリット:** Claude不要時は終了必要（軽微）

---

## 変更対象ファイル

- `dev` - シェルスクリプト（メイン変更）
- `CLAUDE.md` - コマンド説明の更新
- `README.md` - Quick Start の更新

---

_元ファイル: `plans/2026-02-02-devcontainer-shell-script-design.md`, `plans/2026-02-02-auto-start-claude-design.md`_
