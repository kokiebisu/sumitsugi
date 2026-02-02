# Filesystem MCP 導入設計

**日付:** 2026-02-02
**目的:** 学習・実験
**スコープ:** `/workspaces/tsumugi` 全体

## 概要

公式の `@modelcontextprotocol/server-filesystem` を導入し、ファイル操作の効率化と既存ツールとの比較を行う。

## 要件

- **目的:** ファイル操作の効率化（学習・実験目的）
- **対象:** プロジェクト全体 (`/workspaces/tsumugi`)
- **パフォーマンス:** 将来的な最適化（現在は問題なし）
- **サーバー:** `@modelcontextprotocol/server-filesystem` (公式)

## アプローチ

公式Filesystem MCPサーバーを使用し、既存のClaude Codeツール（Read, Write, Edit, Glob, Grep, Serena MCP）との違いを体験する。

### メリット
- 公式実装で安定している
- ドキュメントが充実
- 基本的なファイル操作（read, write, list, search）をサポート
- 既存ツールとの比較が容易

### デメリット
- 既存のClaude Codeツールと機能が重複する部分が多い
- 学習以外の実用的なメリットは限定的

## 設計詳細

### 1. 設定ファイルの構造

**プロジェクトMCP設定 (`.mcp.json`)** に追加:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/workspaces/tsumugi"
      ],
      "env": {}
    }
  }
}
```

**ローカル設定 (`.claude/settings.local.json`)** で有効化:

```json
{
  "enabledMcpjsonServers": ["filesystem"]
}
```

**構成の意味:**
- `.mcp.json` - プロジェクト固有のMCPサーバー定義
- `command: "npx"` - Node.jsパッケージランナーを使用
- `args[1]` - 公式filesystem MCPサーバーを指定
- `args[2]` - アクセス可能なルートディレクトリ（tsumugiプロジェクト全体）
- `-y` フラグ - 確認なしでインストール
- `enabledMcpjsonServers` - 使用するMCPサーバーのリスト

### 2. アクセス範囲とセキュリティ

**アクセス範囲:**
- ルートディレクトリ: `/workspaces/tsumugi`
- アクセス可能: プロジェクト内のすべてのファイル・ディレクトリ
- アクセス不可: プロジェクト外（`/workspaces/tsumugi` の親ディレクトリなど）

**除外設定:**
- 最初は除外なしで全ファイルにアクセス可能
- 必要に応じて後で制限を追加

**セキュリティ考慮事項:**
- プロジェクト外へのアクセスは不可（サンドボックス化）
- `.env.local` は既に `.gitignore` で保護済み
- MCPサーバーはローカルで実行（外部通信なし）

### 3. インストールと設定手順

**ステップ1: プロジェクトMCP設定を追加**
- `.mcp.json` にfilesystem MCPサーバー設定を追加
- 既存のGitHub MCPサーバー設定を保持

**ステップ2: ローカル設定で有効化**
- `.claude/settings.local.json` の `enabledMcpjsonServers` に `"filesystem"` を追加

**ステップ3: Claude Code再起動**
```bash
exit
./dev
```

**ステップ4: 動作確認**
- セッション開始時のログをチェック
- 新しいツール（filesystem関連）が利用可能か確認

**ステップ5: テスト**
- 実際にFilesystem MCPツールを使用
- 既存のRead/Writeツールとの違いを体験

### 4. 動作確認とテスト

**確認項目:**
1. MCPサーバーの起動確認
2. 利用可能なツールの確認（`read_file`, `write_file`, `list_directory`, `search_files`）
3. 基本操作のテスト（読み取り、一覧、検索）
4. 既存ツールとの比較
5. 制限の確認（プロジェクト外へのアクセス拒否）

**トラブルシューティング:**
- MCPサーバーが起動しない → `npx` が利用可能か確認
- ツールが見つからない → 設定ファイルの構文エラーをチェック
- アクセスエラー → パスが正しいか確認

## 期待される結果

- Filesystem MCPツールが利用可能になる
- 既存ツールとの機能比較ができる
- ファイル操作の新しいアプローチを学習できる
- 必要に応じて無効化・削除が可能

## 次のステップ

1. ✅ `.mcp.json` にfilesystem MCPサーバーを追加
2. ✅ `.claude/settings.local.json` で有効化
3. Claude Code再起動して動作確認
4. 動作テスト
5. 学習結果を記録（必要に応じて）
