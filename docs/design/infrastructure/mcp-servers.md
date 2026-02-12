# MCP サーバー統合設計

> 外部MCPサーバーの導入・設定方針

---

## 1. Filesystem MCP（実験的）

**目的:** 学習・実験
**作成日:** 2026-02-02
**サーバー:** `@modelcontextprotocol/server-filesystem` (公式)

### 概要

ファイル操作の効率化と既存ツール（Read, Write, Edit, Glob, Grep, Serena MCP）との比較を行う。

### 設定

**`.mcp.json`:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/workspaces/sumitsugi"
      ],
      "env": {}
    }
  }
}
```

**`.claude/settings.local.json`** で `enabledMcpjsonServers` に `"filesystem"` を追加。

### アクセス範囲

- ルートディレクトリ: `/workspaces/sumitsugi`
- プロジェクト外アクセス不可（サンドボックス化）
- `.env.local` は `.gitignore` で保護済み

### 評価

| 観点       | 結果                                                  |
| ---------- | ----------------------------------------------------- |
| メリット   | 公式実装、安定、基本操作サポート                      |
| デメリット | 既存Claude Codeツールと機能重複、実用的メリット限定的 |

---

## 2. Linear MCP

**目的:** Linear タスク管理の自動化
**作成日:** 2026-02-02
**ステータス:** 承認済み
**サーバー:** `https://mcp.linear.app/mcp` (公式)

### 背景

**移行前:** 手動bashスクリプト（curl + GraphQL API）
**移行後:** Claude会話内で自動的にLinear操作

### 設定

**`.claude/settings.json`:**

```json
{
  "mcpServers": {
    "linear": {
      "url": "https://mcp.linear.app/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer ${LINEAR_API_KEY}"
      }
    }
  }
}
```

- `LINEAR_API_KEY` は `.env.local` から自動読み込み
- 既存プラグイン（Serena, Superpowers等）と共存可能

### 利用可能機能

| カテゴリ         | 操作                   |
| ---------------- | ---------------------- |
| Issue管理        | 作成、検索、更新、取得 |
| チーム管理       | 一覧、フィルタ         |
| プロジェクト管理 | 一覧、詳細             |
| コメント         | 追加                   |

### 移行計画

| Phase   | 内容                                                             |
| ------- | ---------------------------------------------------------------- |
| Phase 1 | MCP設定追加、基本動作確認                                        |
| Phase 2 | MCP優先利用、bashスクリプトをフォールバックとして保持            |
| Phase 3 | ドキュメント更新、スクリプトをトラブルシューティングセクションへ |

### 既存資産の再利用

- `.env.local` のAPIキーはそのまま使用
- `LINEAR_TEAM_ID` も引き続き参照
- 既存bashスクリプトは安全策として保持

---

## 参考リンク

- [Linear MCP Documentation](https://linear.app/docs/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2025-11-25)

---

_元ファイル: `plans/2026-02-02-filesystem-mcp-design.md`, `plans/2026-02-02-linear-mcp-integration-design.md`_
